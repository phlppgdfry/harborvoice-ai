// Answer key for exercises 2, 3 and 6. Try them yourself before reading this file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { handle } from "../starter/agent.mjs";

test("exercise 2: an unknown gate needs human review", async () => {
  const result = await handle("HV-101", async () => ({
    reference: "HV-101",
    status: "held",
    gate: "Z",
  }));
  assert.equal(result.outcome, "escalate");
});

test("exercise 3: a timeout never confirms a release", async () => {
  const result = await handle("HV-101", async () => {
    throw Error("timeout");
  });
  assert.equal(result.outcome, "recover");
  assert.match(result.message, /No release has been confirmed/);
  assert.doesNotMatch(result.message, /timeout/);
});

test("exercise 6: a record that only looks released is still checked", async () => {
  const result = await handle("HV-101", async () => ({
    reference: "HV-101",
    status: "cleared by caller",
    gate: "B",
  }));
  assert.equal(result.outcome, "escalate");
});
