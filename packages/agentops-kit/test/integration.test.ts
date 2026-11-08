import { test } from "node:test";
import assert from "node:assert/strict";
import { inspectElevenLabs } from "../src/index.js";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
// Compile-time SDK compatibility, no instance and no request.
const typeCheck = (client: ElevenLabsClient) =>
  inspectElevenLabs(client, "agent_example");
void typeCheck;
test("official client structural adapter uses mock transport and redacts", async () => {
  const r = await inspectElevenLabs(
    {
      conversationalAi: {
        agents: {
          get: async (id) => ({
            agent_id: id,
            api_key: "PRIVATE",
            conversation_config: { tts: { voice_id: "voice_example" } },
          }),
        },
      },
    },
    "agent_example",
  );
  assert.ok(!JSON.stringify(r).includes("PRIVATE"));
});
test("invalid ID fails before transport", async () => {
  await assert.rejects(
    inspectElevenLabs(
      {
        conversationalAi: {
          agents: {
            get: async () => {
              throw Error("should not call");
            },
          },
        },
      },
      "bad",
    ),
  );
});
import {
  submitNativeSuite,
  readNativeSuite,
  type NativeTestsClient,
  type AccountWideGuard,
} from "../src/index.js";
const nativeTypeCheck = (client: ElevenLabsClient) =>
  readNativeSuite(client, "invocation_example");
void nativeTypeCheck;
const req = {
  agentId: "agent_example",
  branchId: "agtbrch_example",
  testIds: ["test_example"],
  repeats: 1,
  operationKey: "phase3-test",
  estimate: 100,
};
function mock() {
  const calls: unknown[] = [];
  const client: NativeTestsClient = {
    conversationalAi: {
      agents: {
        runTests: async (id, body) => {
          calls.push({ id, body });
          return { id: "invocation_example", testRuns: [] };
        },
      },
      tests: { invocations: { get: async (id) => ({ id, testRuns: [] }) } },
    },
  };
  return { client, calls };
}
const allowed: AccountWideGuard = {
  scope: "account-wide",
  withReservation: async (_op, dispatch) => dispatch(),
  recordInvocation: async () => {},
};
test("native adapter fails closed without account-wide guard", async () => {
  const m = mock();
  await assert.rejects(submitNativeSuite(m.client, req));
  assert.equal(m.calls.length, 0);
});
test("native adapter respects denied reservation before provider call", async () => {
  const m = mock();
  await assert.rejects(
    submitNativeSuite(m.client, req, {
      ...allowed,
      withReservation: async () => {
        throw Error("Shared account uncoordinated");
      },
    }),
  );
  assert.equal(m.calls.length, 0);
});
test("native adapter uses official request and persists invocation under guard", async () => {
  const m = mock();
  let stored = "";
  const result = await submitNativeSuite(m.client, req, {
    ...allowed,
    recordInvocation: async (_key, id) => {
      stored = id;
    },
  });
  assert.equal(stored, result.id);
  assert.deepEqual(m.calls, [
    {
      id: "agent_example",
      body: {
        branchId: "agtbrch_example",
        repeatCount: 1,
        tests: [{ testId: "test_example" }],
      },
    },
  ]);
});
test("native adapter bounds repeats and requires isolated branch", async () => {
  const m = mock();
  await assert.rejects(
    submitNativeSuite(m.client, { ...req, repeats: 3 }, allowed),
  );
  await assert.rejects(
    submitNativeSuite(m.client, { ...req, branchId: "" }, allowed),
  );
  assert.equal(m.calls.length, 0);
});
test("guard cannot dispatch same operation twice", async () => {
  const m = mock();
  await assert.rejects(
    submitNativeSuite(m.client, req, {
      ...allowed,
      withReservation: async (_op, dispatch) => {
        await dispatch();
        return dispatch();
      },
    }),
  );
  assert.equal(m.calls.length, 1);
});
test("native receipt read is separate and never submits a run", async () => {
  const m = mock();
  assert.equal(
    (await readNativeSuite(m.client, "invocation_example")).id,
    "invocation_example",
  );
  assert.equal(m.calls.length, 0);
});
