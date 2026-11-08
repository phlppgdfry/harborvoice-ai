import { test } from "node:test";
import assert from "node:assert/strict";
import {
  inspect,
  diff,
  validate,
  budget,
  evaluate,
  report,
  wilson,
  regression,
  type Scenario,
  type BudgetPolicy,
} from "../src/index.js";
const s: Scenario = {
  id: "x",
  category: "tools",
  language: "en",
  input: "Find a shipment",
  expected: { outcome: "grounded", tools: ["lookup"] },
  conditions: "synthetic",
};
const p: BudgetPolicy = {
  ceiling: 20000,
  buffer: 3000,
  floor: 25000,
  startingBalance: 65322,
  currentBalance: 65322,
  otherCommitments: 30000,
  reservations: 0,
  providerReceipts: 0,
  coordinated: true,
  snapshotAgeMs: 0,
};
test("redacts nested secrets and URL credentials", () => {
  const v = JSON.stringify(
    inspect({
      token: "LEAK",
      nested: {
        headers: { Authorization: "LEAK" },
        url: "https://user:LEAK@example.com/?key=LEAK",
      },
    }),
  );
  assert.ok(!v.includes("LEAK"));
});
test("canonical version independent of key order", () =>
  assert.equal(
    inspect({ a: 1, b: 2 }).configVersion,
    inspect({ b: 2, a: 1 }).configVersion,
  ));
test("diff sees secret rotation without revealing values", () => {
  const d = diff({ api_key: "old" }, { api_key: "new" });
  assert.equal(d.length, 1);
  assert.equal(d[0]?.before, "[REDACTED]");
});
test("removed tools marked potentially breaking", () =>
  assert.equal(
    diff({ tools: ["a"] }, { tools: [] })[0]?.potentiallyBreaking,
    true,
  ));
test("heuristics flag explicit auth and insecure URLs", () =>
  assert.equal(
    validate({ requires_auth: false, url: "http://example.test" }).filter(
      (x) => x.severity === "high",
    ).length,
    2,
  ));
test("budget blocks absent coordination and stale balances", () => {
  assert.equal(budget({ ...p, coordinated: false }).available, 0);
  assert.equal(budget({ ...p, snapshotAgeMs: 60001 }).available, 0);
});
test("budget preserves other commitments, floor and buffer", () =>
  assert.equal(budget(p).available, 7322));
test("budget rejects invalid numbers and ceiling", () => {
  assert.throws(() => budget({ ...p, ceiling: 20001 }));
  assert.throws(() => budget({ ...p, reservations: NaN }));
  assert.throws(() => budget({ ...p, floor: 0 }));
});
test("failed reservations remain liabilities", () =>
  assert.equal(budget({ ...p, reservations: 1000 }).available, 6322));
test("evaluation detects incorrect tool and regression", async () => {
  const good = await evaluate([s], {
    evidenceType: "fixture",
    execute: async () => ({
      outcome: "grounded",
      tools: ["lookup"],
      transcript: [],
    }),
  });
  const bad = await evaluate([s], {
    evidenceType: "fixture",
    execute: async () => ({
      outcome: "grounded",
      tools: ["delete"],
      transcript: [],
    }),
  });
  assert.deepEqual(regression(good, bad), ["x"]);
});
test("transport failures redact private error and never retry", async () => {
  let n = 0;
  const r = await evaluate([s], {
    evidenceType: "fixture",
    execute: async () => {
      n++;
      throw Error("PRIVATE");
    },
  });
  assert.equal(n, 1);
  assert.equal(r[0]?.passed, false);
  assert.ok(!JSON.stringify(r).includes("PRIVATE"));
});
test("bounds repeats and duplicate IDs", async () => {
  await assert.rejects(
    evaluate([s, s], {
      evidenceType: "fixture",
      execute: async () => ({ outcome: "", tools: [], transcript: [] }),
    }),
  );
});
test("Wilson interval handles small samples and empty counts", () => {
  assert.equal(wilson(0, 0), null);
  assert.ok(wilson(6, 6)![0] < 0.7);
  assert.throws(() => wilson(7, 6));
});
test("HTML escapes script payload", () => {
  const html = report(
    {
      schemaVersion: 1,
      generatedAt: "now",
      sourceCommit: "<script>",
      configVersion: "x",
      results: [],
      costs: { reportedCredits: null, scope: "unknown" },
      limitations: [],
    },
    "html",
  );
  assert.ok(!html.includes("<script>"));
});
import {
  reserve,
  receipt,
  ledgerState,
  type BudgetLedger,
} from "../src/index.js";
const ledger: BudgetLedger = {
  schemaVersion: 1,
  project: "phase3",
  policy: p,
  operations: [],
};
test("reservation proposals are immutable and consume capacity", () => {
  const next = reserve(ledger, "test1", 1000);
  assert.equal(ledger.operations.length, 0);
  assert.equal(ledgerState(next).available, 6322);
});
test("duplicate operation cannot dispatch again", () =>
  assert.throws(() => reserve(reserve(ledger, "test1", 1000), "test1", 1000)));
test("receipt below estimate retains liability until confirmed final", () => {
  const next = receipt(
    reserve(ledger, "test1", 1000),
    "test1",
    100,
    "provider-1",
  );
  assert.equal(ledgerState(next).liability, 1000);
  assert.equal(
    ledgerState(receipt(next, "test1", 100, "provider-1", true)).liability,
    100,
  );
});
test("receipt above estimate increases liability", () => {
  const next = receipt(
    reserve(ledger, "test1", 1000),
    "test1",
    1500,
    "provider-1",
  );
  assert.equal(ledgerState(next).liability, 1500);
});
test("failed operation retains conservative liability", () => {
  const next = reserve(ledger, "test1", 1000);
  next.operations[0]!.state = "failed";
  assert.equal(ledgerState(next).liability, 1000);
});
test("uncoordinated reservations rejected", () =>
  assert.throws(() =>
    reserve({ ...ledger, policy: { ...p, coordinated: false } }, "test", 1),
  ));
test("corrupt imported reservation cannot expand capacity", () =>
  assert.throws(() =>
    ledgerState({
      ...ledger,
      operations: [
        { id: "bad", project: "phase3", estimate: -1000, state: "reserved" },
      ],
    }),
  ));
test("account reset requires reconciliation", () =>
  assert.throws(() => budget({ ...p, currentBalance: 70000 })));
test("provider identity and final receipt cannot be reopened", () => {
  const next = receipt(
    reserve(ledger, "test1", 1000),
    "test1",
    100,
    "provider-1",
    true,
  );
  assert.throws(() => receipt(next, "test1", 100, "provider-2", true));
  assert.throws(() => receipt(next, "test1", 100, "provider-1"));
});
test("inspector supports SDK-normalized and raw configuration fields", () => {
  assert.equal(
    inspect({
      agent_id: "agent_test",
      conversation_config: {
        agent: { language: "nl", prompt: { llm: "example" } },
      },
    }).summary.language,
    "nl",
  );
  assert.equal(
    inspect({
      agentId: "agent_test",
      conversationConfig: { agent: { language: "fr" } },
    }).summary.language,
    "fr",
  );
});
test("JSON-imported string numbers and missing budget fields fail closed", () => {
  assert.throws(() =>
    budget({ ...p, reservations: "-10000" } as unknown as BudgetPolicy),
  );
  const missing = { ...p } as Partial<BudgetPolicy>;
  delete missing.currentBalance;
  assert.throws(() => budget(missing as BudgetPolicy));
  assert.throws(() =>
    budget({ ...p, coordinated: "true" } as unknown as BudgetPolicy),
  );
});
