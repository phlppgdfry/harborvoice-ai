import { test } from "node:test";
import assert from "node:assert/strict";
import {
  contentHash,
  projectManaged,
  classifyDrift,
  assertSafeApply,
} from "../lib/resource-registry.js";
test("managed projection compares owned fields while preserving unknown remote settings", () => {
  const remote = {
    agent: { prompt: "a", voice: "remote" },
    privacy: { retention: 7 },
  };
  assert.deepEqual(projectManaged(remote, { agent: { prompt: "a" } }), {
    agent: { prompt: "a" },
  });
  assert.equal(remote.agent.voice, "remote");
  assert.equal(contentHash({ b: 2, a: 1 }), contentHash({ a: 1, b: 2 }));
});
test("three-way drift separates local, remote and conflicting edits", () => {
  const base = { local: "a", remote: "b" };
  assert.equal(classifyDrift("a", "b", base), "IN SYNC");
  assert.equal(classifyDrift("c", "b", base), "LOCAL CHANGES");
  assert.equal(classifyDrift("a", "c", base), "REMOTE CHANGES");
  assert.equal(classifyDrift("c", "d", base), "CONFLICT");
  assert.equal(classifyDrift("a", "b"), "MANUAL ACTION REQUIRED");
});
test("apply refuses stale snapshots and remote conflicts", () => {
  assert.throws(
    () => assertSafeApply("old", "new", "LOCAL CHANGES"),
    /snapshot changed/,
  );
  assert.throws(
    () => assertSafeApply("new", "new", "CONFLICT"),
    /manual reconciliation/,
  );
  assert.doesNotThrow(() => assertSafeApply("new", "new", "LOCAL CHANGES"));
});
