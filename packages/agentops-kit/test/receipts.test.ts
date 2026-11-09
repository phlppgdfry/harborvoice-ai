import { test } from "node:test";
import assert from "node:assert/strict";
import { importNativeReceipt, evaluate, type Scenario } from "../src/index.js";
const expected = {
  invocationId: "inv_1",
  agentId: "agent_1",
  branchId: "agtbrch_1",
  testIds: ["test_1"],
  repeats: 1,
};
const run = {
  test_run_id: "run_1",
  test_invocation_id: "inv_1",
  agent_id: "agent_1",
  branch_id: "agtbrch_1",
  test_id: "test_1",
  status: "passed",
  credits_used: 7,
};
const raw = (r: unknown[] = [run]) => ({ id: "inv_1", test_runs: r });
test("offline importer preserves provenance and excludes raw transcript/secrets", () => {
  const result = importNativeReceipt(
    { ...raw(), agent_responses: ["PRIVATE"], charging: { token: "PRIVATE" } },
    expected,
  );
  assert.equal(result.passed, true);
  assert.equal(result.reportedCredits, 7);
  assert.match(result.sourceSha256, /^[a-f0-9]{64}$/);
  assert.ok(!JSON.stringify(result).includes("PRIVATE"));
  assert.match(result.holdDisposition, /RETAIN/);
});
test("SDK camelCase and explicit zero credit receipts are supported", () => {
  const r = importNativeReceipt(
    {
      id: "inv_1",
      testRuns: [
        {
          testRunId: "run_1",
          testInvocationId: "inv_1",
          agentId: "agent_1",
          branchId: "agtbrch_1",
          testId: "test_1",
          status: "passed",
          creditsUsed: 0,
        },
      ],
    },
    expected,
  );
  assert.equal(r.reportedCredits, 0);
});
test("missing, partial, pending and historical costs never become zero final bills", () => {
  for (const runs of [
    [],
    [{ ...run, credits_used: null }],
    [{ ...run, status: "pending" }],
  ]) {
    const r = importNativeReceipt(raw(runs), expected);
    assert.equal(r.reportedCredits, null);
    assert.match(r.holdDisposition, /RETAIN/);
  }
  const partial = importNativeReceipt(raw(), {
    ...expected,
    testIds: ["test_1", "test_2"],
  });
  assert.equal(partial.knownCredits, 7);
  assert.equal(partial.missingRuns, 1);
  assert.equal(partial.passed, false);
  assert.equal(partial.reportedCredits, null);
});
test("wrong identity, unmapped tests, duplicate runs and malformed costs fail closed", () => {
  for (const changes of [
    { branch_id: null },
    { agent_id: "other" },
    { test_invocation_id: "other" },
    { test_id: "unknown" },
    { credits_used: -1 },
    { credits_used: "7" },
    { credits_used: 0.5 },
    { status: "success" },
    { testId: "test_1" },
  ]) {
    assert.throws(() =>
      importNativeReceipt(raw([{ ...run, ...changes }]), expected),
    );
  }
  assert.throws(() =>
    importNativeReceipt(raw([run, run]), { ...expected, repeats: 2 }),
  );
  assert.throws(() => importNativeReceipt({ ...raw(), id: "wrong" }, expected));
  assert.throws(() =>
    importNativeReceipt({ ...raw(), testRuns: [] }, expected),
  );
  assert.throws(() => importNativeReceipt(raw(), { ...expected, repeats: 0 }));
});
test("cancelled and failed terminal receipts retain failure and known billing", () => {
  for (const status of ["cancelled", "failed"]) {
    const r = importNativeReceipt(raw([{ ...run, status }]), expected);
    assert.equal(r.complete, true);
    assert.equal(r.passed, false);
    assert.equal(r.reportedCredits, 7);
  }
});
const scenario: Scenario = {
  id: "grounding",
  category: "normal",
  language: "nl",
  input: "Where is HV-123456?",
  expected: {
    outcome: "grounded",
    tools: ["lookup"],
    toolCalls: [{ name: "lookup", arguments: { reference: "HV-123456" } }],
    facts: { reference: "HV-123456", status: "held" },
  },
  conditions: "Exact reference and facts required",
};
test("a plausible outcome with wrong tool arguments and invented facts fails", async () => {
  const [r] = await evaluate([scenario], {
    evidenceType: "fixture",
    execute: async () => ({
      outcome: "grounded",
      tools: ["lookup"],
      transcript: [],
      toolCalls: [{ name: "lookup", arguments: { reference: "HV-654321" } }],
      facts: { reference: "HV-123456", status: "released" },
    }),
  });
  assert.equal(r!.passed, false);
  assert.deepEqual(r!.failedAssertions, ["toolCalls", "facts"]);
});
test("missing structured evidence fails; exact verified contract passes", async () => {
  const execute = async () => ({
    outcome: "grounded",
    tools: ["lookup"],
    transcript: [],
  });
  assert.equal(
    (await evaluate([scenario], { evidenceType: "fixture", execute }))[0]!
      .passed,
    false,
  );
  const [r] = await evaluate([scenario], {
    evidenceType: "fixture",
    execute: async () => ({
      ...(await execute()),
      toolCalls: scenario.expected.toolCalls,
      facts: scenario.expected.facts,
    }),
  });
  assert.equal(r!.passed, true);
});
