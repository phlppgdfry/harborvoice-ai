import { z } from "zod";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  renameSync,
  rmdirSync,
} from "node:fs";
import { dirname } from "node:path";
export type CreditSnapshot = { used: number; limit: number; checkedAt: string };
export type CreditOperation = {
  key: string;
  workstream: string;
  estimate: number;
  status: "reserved" | "pending" | "completed" | "failed";
  reservedAt: string;
  updatedAt: string;
  providerIds: string[];
  reportedCredits?: number;
  note?: string;
};
export type CreditLedger = {
  version: 1;
  execution: string;
  starting: CreditSnapshot;
  maximumAdditional: number;
  minimumBalance: number;
  billingBuffer: number;
  latest: CreditSnapshot;
  operations: Record<string, CreditOperation>;
};
export function budgetState(ledger: CreditLedger) {
  const ops = Object.values(ledger.operations);
  const observed = ledger.latest.used - ledger.starting.used;
  const committed = ops.reduce(
    (n, o) => n + Math.max(o.estimate, o.reportedCredits ?? 0),
    0,
  );
  const pending = ops.filter(
    (o) => o.status === "pending" || o.status === "reserved",
  );
  const liability = Math.max(observed, committed);
  return {
    startingBalance: ledger.starting.limit - ledger.starting.used,
    actualBalance: ledger.latest.limit - ledger.latest.used,
    observedUsage: observed,
    estimatedCommitted: committed,
    providerReportedUsage: ops.reduce(
      (n, o) => n + (o.reportedCredits ?? 0),
      0,
    ),
    pendingReservations: pending.reduce(
      (n, o) => n + Math.max(o.estimate, o.reportedCredits ?? 0),
      0,
    ),
    failedReservations: ops
      .filter((o) => o.status === "failed")
      .reduce((n, o) => n + Math.max(o.estimate, o.reportedCredits ?? 0), 0),
    conservativeLiability: liability,
    budgetRemaining: Math.max(
      0,
      ledger.maximumAdditional - liability - ledger.billingBuffer,
    ),
    completed: ops.filter((o) => o.status === "completed").length,
    pending: pending.length,
    failed: ops.filter((o) => o.status === "failed").length,
  };
}
function validate(snapshot: CreditSnapshot) {
  if (
    !Number.isFinite(snapshot.used) ||
    !Number.isFinite(snapshot.limit) ||
    snapshot.used < 0 ||
    snapshot.limit < snapshot.used ||
    !Number.isFinite(Date.parse(snapshot.checkedAt)) ||
    Math.abs(Date.now() - Date.parse(snapshot.checkedAt)) > 60_000
  )
    throw Error(
      "Credit balance cannot be verified reliably; generation stopped.",
    );
}
const snapshotSchema = z.object({
  used: z.number().finite().nonnegative(),
  limit: z.number().finite().nonnegative(),
  checkedAt: z.string().datetime(),
});
const ledgerSchema = z
  .object({
    version: z.literal(1),
    execution: z.string().min(1),
    starting: snapshotSchema,
    latest: snapshotSchema,
    maximumAdditional: z.number().finite().positive().max(50_000),
    minimumBalance: z.number().finite().min(55_000),
    billingBuffer: z.number().finite().min(5_000),
    operations: z.record(
      z.string(),
      z.object({
        key: z.string().min(1),
        workstream: z.string().min(1),
        estimate: z.number().finite().positive(),
        status: z.enum(["reserved", "pending", "completed", "failed"]),
        reservedAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        providerIds: z.array(z.string()),
        reportedCredits: z.number().finite().nonnegative().optional(),
        note: z.string().optional(),
      }),
    ),
  })
  .refine(
    (v) =>
      v.starting.limit >= v.starting.used &&
      v.latest.limit === v.starting.limit &&
      v.latest.used >= v.starting.used &&
      v.latest.used <= v.latest.limit &&
      v.minimumBalance >=
        v.starting.limit - v.starting.used - v.maximumAdditional,
    "Invalid account/budget invariants",
  );
export class CreditGovernor {
  constructor(
    readonly path: string,
    readonly readSnapshot: () => Promise<CreditSnapshot>,
  ) {}
  private async locked<T>(run: () => Promise<T>) {
    mkdirSync(dirname(this.path), { recursive: true, mode: 0o700 });
    const lock = this.path + ".lock";
    try {
      mkdirSync(lock, { mode: 0o700 });
    } catch {
      throw Error(
        "Credit governor locked by another process. Inspect pending work; no automatic retry.",
      );
    }
    try {
      return await run();
    } finally {
      rmdirSync(lock);
    }
  }
  private read(): CreditLedger {
    const parsed = ledgerSchema.safeParse(
      JSON.parse(readFileSync(this.path, "utf8")),
    );
    if (!parsed.success)
      throw Error("Credit ledger failed validation; generation stopped.");
    return parsed.data;
  }
  private save(value: CreditLedger) {
    const temp = this.path + ".tmp";
    writeFileSync(temp, JSON.stringify(value, null, 2) + "\n", { mode: 0o600 });
    renameSync(temp, this.path);
  }
  async initialize(
    execution: string,
    maximumAdditional = 50_000,
    billingBuffer = 5_000,
  ) {
    return this.locked(async () => {
      if (existsSync(this.path)) return this.read();
      if (
        !Number.isFinite(maximumAdditional) ||
        maximumAdditional <= 0 ||
        maximumAdditional > 50_000 ||
        !Number.isFinite(billingBuffer) ||
        billingBuffer < 5_000
      )
        throw Error("Invalid authorized budget envelope.");
      const s = await this.readSnapshot();
      validate(s);
      const startingBalance = s.limit - s.used;
      if (startingBalance < maximumAdditional + billingBuffer)
        throw Error("Insufficient verified balance for this execution.");
      const ledger: CreditLedger = {
        version: 1,
        execution,
        starting: s,
        latest: s,
        maximumAdditional,
        minimumBalance: Math.max(55_000, startingBalance - maximumAdditional),
        billingBuffer,
        operations: {},
      };
      this.save(ledger);
      return ledger;
    });
  }
  private async refresh(ledger: CreditLedger) {
    const s = await this.readSnapshot();
    validate(s);
    if (s.limit !== ledger.starting.limit || s.used < ledger.latest.used)
      throw Error(
        "Account quota/counter changed; manual billing reconciliation required.",
      );
    ledger.latest = s;
    this.save(ledger);
    return ledger;
  }
  async report() {
    return this.locked(async () => {
      const ledger = await this.refresh(this.read());
      return { ledger, ...budgetState(ledger) };
    });
  }
  async reserve(key: string, workstream: string, estimate: number) {
    return this.locked(async () => {
      const ledger = await this.refresh(this.read());
      if (ledger.operations[key])
        throw Error(
          "Operation already recorded; inspect provider IDs before retrying.",
        );
      if (!Number.isFinite(estimate) || estimate <= 0)
        throw Error("A positive conservative estimate is required.");
      const state = budgetState(ledger);
      if (
        estimate > state.budgetRemaining ||
        state.actualBalance - estimate - ledger.billingBuffer <
          ledger.minimumBalance
      )
        throw Error(
          "Credit governor hard stop: allowance or preserved balance exceeded.",
        );
      const now = new Date().toISOString();
      ledger.operations[key] = {
        key,
        workstream,
        estimate,
        status: "reserved",
        reservedAt: now,
        updatedAt: now,
        providerIds: [],
      };
      this.save(ledger);
      return ledger.operations[key];
    });
  }
  async update(
    key: string,
    patch: Pick<CreditOperation, "status"> &
      Partial<
        Pick<CreditOperation, "providerIds" | "reportedCredits" | "note">
      >,
  ) {
    return this.locked(async () => {
      const ledger = this.read(),
        op = ledger.operations[key];
      if (!op) throw Error("Reserve operation first.");
      if (op.status === "completed" && patch.status !== "completed")
        throw Error("Completed operation cannot be reopened.");
      if (
        patch.reportedCredits !== undefined &&
        (!Number.isFinite(patch.reportedCredits) || patch.reportedCredits < 0)
      )
        throw Error("Invalid reported credits.");
      Object.assign(op, patch, { updatedAt: new Date().toISOString() });
      this.save(ledger);
      return op;
    });
  }
}
