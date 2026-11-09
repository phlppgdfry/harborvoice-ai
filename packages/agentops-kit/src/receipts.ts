import { createHash } from "node:crypto";

export type NativeReceiptExpectation = {
  invocationId: string;
  agentId: string;
  branchId: string;
  testIds: string[];
  repeats: number;
};
type RecordValue = Record<string, unknown>;
const object = (v: unknown): RecordValue => {
  if (!v || typeof v !== "object" || Array.isArray(v))
    throw Error("Expected an object.");
  return v as RecordValue;
};
function field(o: RecordValue, camel: string, snake: string): unknown {
  if (camel !== snake && camel in o && snake in o)
    throw Error("Ambiguous SDK/API aliases.");
  return o[camel] ?? o[snake];
}
function id(v: unknown): string {
  if (typeof v !== "string" || !/^[a-zA-Z0-9_-]{1,200}$/.test(v))
    throw Error("Invalid provider identifier.");
  return v;
}
/** Offline, metadata-only import. Never dispatches, retries, or releases a spending hold. */
export function importNativeReceipt(
  raw: unknown,
  expected: NativeReceiptExpectation,
) {
  const serialized = JSON.stringify(raw);
  if (!serialized || Buffer.byteLength(serialized) > 2_000_000)
    throw Error("Receipt exceeds 2 MB or is not JSON.");
  const e = object(expected);
  for (const key of ["invocationId", "agentId", "branchId"] as const)
    id(e[key]);
  if (
    !Array.isArray(e.testIds) ||
    e.testIds.length < 1 ||
    e.testIds.length > 12 ||
    new Set(e.testIds).size !== e.testIds.length ||
    !Number.isInteger(e.repeats) ||
    (e.repeats as number) < 1 ||
    (e.repeats as number) > 2
  )
    throw Error("Explicit expected tests and 1–2 repeats required.");
  e.testIds.forEach(id);
  const invocation = object(raw);
  if (id(invocation.id) !== expected.invocationId)
    throw Error("Invocation mismatch.");
  for (const [camel, snake, value] of [
    ["agentId", "agent_id", expected.agentId],
    ["branchId", "branch_id", expected.branchId],
  ] as const) {
    const v = field(invocation, camel, snake);
    if (v != null && v !== value) throw Error("Invocation identity mismatch.");
  }
  const rawRuns = field(invocation, "testRuns", "test_runs");
  if (
    !Array.isArray(rawRuns) ||
    rawRuns.length > expected.testIds.length * expected.repeats
  )
    throw Error("Unexpected run count.");
  const seen = new Set<string>();
  const counts = new Map<string, number>();
  const runs = rawRuns.map((value) => {
    const r = object(value);
    const runId = id(field(r, "testRunId", "test_run_id"));
    const testId = id(field(r, "testId", "test_id"));
    if (seen.has(runId) || !expected.testIds.includes(testId))
      throw Error("Duplicate or unmapped run.");
    seen.add(runId);
    counts.set(testId, (counts.get(testId) ?? 0) + 1);
    if (counts.get(testId)! > expected.repeats)
      throw Error("Too many repeats.");
    if (
      field(r, "testInvocationId", "test_invocation_id") !==
        expected.invocationId ||
      field(r, "agentId", "agent_id") !== expected.agentId ||
      field(r, "branchId", "branch_id") !== expected.branchId
    )
      throw Error("Run identity missing or mismatched.");
    if (
      !["pending", "passed", "failed", "cancelled"].includes(String(r.status))
    )
      throw Error("Unknown run status.");
    const cost = field(r, "creditsUsed", "credits_used");
    if (
      cost != null &&
      (typeof cost !== "number" || !Number.isSafeInteger(cost) || cost < 0)
    )
      throw Error("Invalid credit receipt.");
    return {
      runId,
      testId,
      status: r.status as "pending" | "passed" | "failed" | "cancelled",
      reportedCredits: cost == null ? null : (cost as number),
    };
  });
  const missingRuns = expected.testIds.length * expected.repeats - runs.length;
  const complete =
    missingRuns === 0 && runs.every((r) => r.status !== "pending");
  const knownCredits = runs.reduce(
    (sum, r) => sum + (r.reportedCredits ?? 0),
    0,
  );
  if (!Number.isSafeInteger(knownCredits))
    throw Error("Credit total overflow.");
  return {
    schemaVersion: 1,
    evidenceType: "provider-test-receipt",
    sourceSha256: createHash("sha256").update(serialized).digest("hex"),
    invocationId: expected.invocationId,
    agentId: expected.agentId,
    branchId: expected.branchId,
    runs,
    missingRuns,
    complete,
    passed:
      complete &&
      invocation.cancelled !== true &&
      field(invocation, "bucketingStatus", "bucketing_status") !== "failed" &&
      runs.every((r) => r.status === "passed"),
    knownCredits,
    reportedCredits:
      complete && runs.every((r) => r.reportedCredits !== null)
        ? knownCredits
        : null,
    holdDisposition: "RETAIN — requires separate final billing reconciliation",
    limitations: [
      "Caller-supplied receipt; source hash is integrity metadata, not provider authentication.",
      "Native test status does not establish benchmark grounding, voice quality or real-user acceptance.",
      "Missing costs remain unknown. Import never settles reservations. Raw transcripts and charging details are omitted.",
    ],
  };
}
