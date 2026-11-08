import { createHash } from "node:crypto";
export type Json =
  null | boolean | number | string | Json[] | { [key: string]: Json };
export type Config = { [key: string]: Json };
export type Finding = {
  path: string;
  severity: "info" | "warning" | "high";
  message: string;
};
const sensitive =
  /secret|password|token|authorization|api.?key|headers|signed.?url/i;
/** Prompts and transcripts may contain personal data: redaction is not anonymization. */
export function redact(value: Json, key = ""): Json {
  if (sensitive.test(key)) return "[REDACTED]";
  if (Array.isArray(value)) return value.map((v) => redact(v));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, redact(v, k)]),
    );
  if (typeof value === "string")
    return value.replace(/https?:\/\/[^\s"<>]+/g, (url) => {
      try {
        const u = new URL(url);
        u.username = "";
        u.password = "";
        u.search = "";
        u.hash = "";
        return u.toString();
      } catch {
        return "[URL REDACTED]";
      }
    });
  return value;
}
function stable(v: Json): string {
  if (Array.isArray(v)) return "[" + v.map(stable).join(",") + "]";
  if (v && typeof v === "object")
    return (
      "{" +
      Object.keys(v)
        .sort()
        .map((k) => JSON.stringify(k) + ":" + stable(v[k]!))
        .join(",") +
      "}"
    );
  return JSON.stringify(v);
}
export function version(config: Config): string {
  return createHash("sha256")
    .update(stable(redact(config)))
    .digest("hex");
}
export function inspect(config: Config) {
  const safe = redact(config) as Config;
  const obj = (v: Json | undefined): Config =>
    v && typeof v === "object" && !Array.isArray(v) ? v : {};
  const conversation = obj(safe.conversationConfig ?? safe.conversation_config);
  const agent = obj(conversation.agent),
    prompt = obj(agent.prompt),
    platform = obj(safe.platformSettings ?? safe.platform_settings);
  const summary = {
    agentId: safe.agentId ?? safe.agent_id ?? null,
    name: safe.name ?? null,
    model: prompt.llm ?? null,
    language: agent.language ?? null,
    voice: conversation.tts ?? null,
    knowledge: prompt.knowledgeBase ?? prompt.knowledge_base ?? null,
    tools: prompt.tools ?? prompt.toolIds ?? prompt.tool_ids ?? null,
    evaluation: platform.evaluation ?? platform.evaluationCriteria ?? null,
    deployment: platform,
  };
  return {
    schemaVersion: 1,
    configVersion: version(config),
    summary,
    configuration: safe,
    limitation:
      "Secret-only changes do not change the public version hash. Review prompts for personal data before export.",
  };
}
export type Change = {
  path: string;
  kind: "added" | "removed" | "changed";
  before?: Json;
  after?: Json;
  potentiallyBreaking: boolean;
};
export function diff(before: Config, after: Config): Change[] {
  const out: Change[] = [];
  function walk(a: Json | undefined, b: Json | undefined, path: string) {
    if (a !== undefined && b !== undefined && stable(a) === stable(b)) return;
    if (
      a &&
      b &&
      !Array.isArray(a) &&
      !Array.isArray(b) &&
      typeof a === "object" &&
      typeof b === "object"
    ) {
      for (const k of new Set([...Object.keys(a), ...Object.keys(b)]))
        walk(
          a[k],
          b[k],
          path + "/" + k.replace(/~/g, "~0").replace(/\//g, "~1"),
        );
    } else
      out.push({
        path,
        kind:
          a === undefined ? "added" : b === undefined ? "removed" : "changed",
        ...(a === undefined ? {} : { before: redact(a, path) }),
        ...(b === undefined ? {} : { after: redact(b, path) }),
        potentiallyBreaking:
          /tool|prompt|model|knowledge|auth|security|override/i.test(path),
      });
  }
  walk(before, after, "");
  return out;
}
export function validate(config: Config): Finding[] {
  const findings: Finding[] = [];
  function walk(v: Json, path: string) {
    if (!v || typeof v !== "object") return;
    for (const [key, value] of Object.entries(v)) {
      const p = path + "/" + key;
      if (/^requires?_?auth(entication)?$/i.test(key) && value === false)
        findings.push({
          path: p,
          severity: "high",
          message:
            "Authentication explicitly disabled; review public access and privileged tools.",
        });
      if (
        /url$/i.test(key) &&
        typeof value === "string" &&
        value.startsWith("http:")
      )
        findings.push({
          path: p,
          severity: "high",
          message: "Unencrypted endpoint.",
        });
      if (
        /max.*(duration|tokens)/i.test(key) &&
        typeof value === "number" &&
        value > 3600
      )
        findings.push({
          path: p,
          severity: "warning",
          message: "Large allowance; verify spending bounds and units.",
        });
      walk(value, p);
    }
  }
  walk(config, "");
  findings.push({
    path: "",
    severity: "info",
    message:
      "Manually verify tool authorization, input schemas, escalation, failure handling, evaluations and endpoint protection. Static configuration cannot prove them.",
  });
  return findings;
}
export type Scenario = {
  id: string;
  category: string;
  language: string;
  input: string;
  expected: { outcome: string; tools: string[] };
  conditions: string;
};
export type Observation = {
  outcome: string;
  tools: string[];
  transcript: string[];
  latencyMs?: number;
  credits?: number;
};
export type Result = {
  scenario: Scenario;
  observation?: Observation;
  passed: boolean;
  error?: string;
  repeat: number;
  evidenceType: "fixture" | "provider-text" | "recorded-voice" | "live-audio";
};
export interface Transport {
  evidenceType: Result["evidenceType"];
  execute(scenario: Scenario): Promise<Observation>;
}
export async function evaluate(
  scenarios: Scenario[],
  transport: Transport,
  repeats = 1,
): Promise<Result[]> {
  if (!Number.isInteger(repeats) || repeats < 1 || repeats > 10)
    throw Error("Repeat count must be 1–10.");
  if (
    scenarios.length > 1000 ||
    new Set(scenarios.map((s) => s.id)).size !== scenarios.length
  )
    throw Error("Unique IDs and at most 1000 scenarios required.");
  const results: Result[] = [];
  for (const scenario of scenarios)
    for (let repeat = 0; repeat < repeats; repeat++) {
      try {
        const observation = await transport.execute(scenario);
        results.push({
          scenario,
          observation,
          repeat,
          evidenceType: transport.evidenceType,
          passed:
            observation.outcome === scenario.expected.outcome &&
            stable([...observation.tools].sort()) ===
              stable([...scenario.expected.tools].sort()),
        });
      } catch {
        results.push({
          scenario,
          repeat,
          evidenceType: transport.evidenceType,
          passed: false,
          error: "Transport failed; inspect private logs. No automatic retry.",
        });
      }
    }
  return results;
}
export function regression(before: Result[], after: Result[]) {
  const old = new Map(before.map((r) => [r.scenario.id + ":" + r.repeat, r]));
  return after
    .filter((r) => old.get(r.scenario.id + ":" + r.repeat)?.passed && !r.passed)
    .map((r) => r.scenario.id);
}
export function wilson(passed: number, total: number): [number, number] | null {
  if (
    !Number.isInteger(total) ||
    !Number.isInteger(passed) ||
    total < 0 ||
    passed < 0 ||
    passed > total
  )
    throw Error("Invalid counts.");
  if (!total) return null;
  const z = 1.96,
    p = passed / total,
    d = 1 + (z * z) / total,
    c = (p + (z * z) / (2 * total)) / d,
    h =
      (z * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total))) /
      d;
  return [c - h, c + h];
}
export type BudgetPolicy = {
  ceiling: number;
  buffer: number;
  floor: number;
  startingBalance: number;
  currentBalance: number;
  otherCommitments: number;
  reservations: number;
  providerReceipts: number;
  coordinated: boolean;
  snapshotAgeMs: number;
};
export function budget(p: BudgetPolicy) {
  for (const [k, v] of Object.entries(p))
    if (typeof v === "number" && (!Number.isFinite(v) || v < 0))
      throw Error("Invalid budget field: " + k);
  if (p.currentBalance > p.startingBalance)
    throw Error(
      "Account counter or quota changed; reconcile before continuing.",
    );
  if (
    p.ceiling > 20000 ||
    p.buffer < 3000 ||
    p.floor < Math.min(25000, p.startingBalance)
  )
    throw Error("Phase 3 budget policy violated.");
  const observed = Math.max(0, p.startingBalance - p.currentBalance),
    liability = Math.max(p.reservations, p.providerReceipts);
  const available = Math.max(
    0,
    Math.min(
      p.ceiling - p.buffer - liability,
      p.currentBalance - p.floor - p.otherCommitments - p.buffer - liability,
    ),
  );
  return {
    available: p.coordinated && p.snapshotAgeMs <= 60000 ? available : 0,
    observedAccountUsage: observed,
    unattributedAccountUsage: Math.max(0, observed - p.providerReceipts),
    liability,
    stop: !p.coordinated
      ? "Account-wide coordination unverified"
      : p.snapshotAgeMs > 60000
        ? "Stale balance"
        : available === 0
          ? "Insufficient headroom"
          : null,
  };
}
export type Report = {
  schemaVersion: 1;
  generatedAt: string;
  sourceCommit: string;
  configVersion: string;
  results: Result[];
  costs: { reportedCredits: number | null; scope: string };
  limitations: string[];
};
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function report(
  r: Report,
  format: "json" | "markdown" | "html",
): string {
  const safe = redact(r as unknown as Json);
  if (format === "json") return JSON.stringify(safe, null, 2) + "\n";
  const heading = `AgentOps evidence: ${r.results.filter((x) => x.passed).length}/${r.results.length} contract checks passed`;
  const body = JSON.stringify(safe, null, 2);
  return format === "html"
    ? `<!doctype html><html lang="en"><meta charset="utf-8"><title>AgentOps evidence</title><h1>${escape(heading)}</h1><pre>${escape(body)}</pre></html>`
    : `# ${heading}\n\nEvidence types must be interpreted separately.\n\n\`\`\`json\n${body.replace(/\`/g, "\\u0060")}\n\`\`\`\n`;
}
export { inspectElevenLabs, type AgentReader } from "./elevenlabs.js";

export type Reservation = {
  id: string;
  project: string;
  estimate: number;
  state: "reserved" | "pending" | "failed" | "reconciled";
  providerId?: string;
  receipt?: number;
};
export type BudgetLedger = {
  schemaVersion: 1;
  project: string;
  policy: BudgetPolicy;
  operations: Reservation[];
};
export function ledgerState(ledger: BudgetLedger) {
  if (
    !ledger.project ||
    new Set(ledger.operations.map((o) => o.id)).size !==
      ledger.operations.length
  )
    throw Error("Invalid ledger identity.");
  for (const o of ledger.operations)
    if (
      !o.id ||
      o.project !== ledger.project ||
      !Number.isFinite(o.estimate) ||
      o.estimate <= 0 ||
      (o.receipt !== undefined &&
        (!Number.isFinite(o.receipt) || o.receipt < 0)) ||
      !["reserved", "pending", "failed", "reconciled"].includes(o.state)
    )
      throw Error("Invalid reservation.");
  const reservations = ledger.operations.reduce(
    (sum, o) =>
      sum +
      (o.state === "reconciled"
        ? (o.receipt ?? o.estimate)
        : Math.max(o.estimate, o.receipt ?? 0)),
    0,
  );
  const providerReceipts = ledger.operations.reduce(
    (sum, o) => sum + (o.receipt ?? 0),
    0,
  );
  return budget({ ...ledger.policy, reservations, providerReceipts });
}
/** Pure proposal only. Persist atomically under a verified shared lock before dispatch. */
export function reserve(
  ledger: BudgetLedger,
  id: string,
  estimate: number,
): BudgetLedger {
  if (!id || ledger.operations.some((o) => o.id === id))
    throw Error(
      "Unique reservation ID required; never retry an ambiguous operation.",
    );
  if (
    !Number.isFinite(estimate) ||
    estimate <= 0 ||
    estimate > ledgerState(ledger).available
  )
    throw Error("Reservation exceeds verified headroom.");
  return {
    ...ledger,
    operations: [
      ...ledger.operations,
      { id, project: ledger.project, estimate, state: "reserved" },
    ],
  };
}
export function receipt(
  ledger: BudgetLedger,
  id: string,
  credits: number,
  providerId: string,
  confirmedFinal = false,
): BudgetLedger {
  if (
    !Number.isFinite(credits) ||
    credits < 0 ||
    !providerId ||
    !ledger.operations.some((o) => o.id === id)
  )
    throw Error("Existing reservation and valid provider receipt required.");
  ledgerState(ledger);
  const prior = ledger.operations.find((o) => o.id === id)!;
  if (prior.providerId && prior.providerId !== providerId)
    throw Error("Provider identity changed.");
  if (prior.state === "reconciled" && !confirmedFinal)
    throw Error("Final receipt cannot reopen a reservation.");
  return {
    ...ledger,
    operations: ledger.operations.map((o) =>
      o.id === id
        ? {
            ...o,
            receipt: Math.max(o.receipt ?? 0, credits),
            providerId,
            state: confirmedFinal ? "reconciled" : "pending",
          }
        : o,
    ),
  };
}
export {
  submitNativeSuite,
  readNativeSuite,
  type NativeTestsClient,
  type AccountWideGuard,
  type NativeInvocation,
} from "./elevenlabs.js";
