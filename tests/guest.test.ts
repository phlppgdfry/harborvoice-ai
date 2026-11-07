import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../server/app.js";
import { createStore } from "../server/store.js";
import type { client } from "../server/elevenlabs.js";
async function fixture(
  run: (base: string, calls: () => number) => Promise<void>,
  options: { expired?: boolean; unsafe?: boolean } = {},
) {
  process.env.OPERATOR_TOKEN = "private-operator";
  process.env.ELEVENLABS_API_KEY = "fixture";
  process.env.ELEVENLABS_GUEST_AGENT_ID = "visitor-agent";
  process.env.GUEST_VOICE_EXPIRES_AT = new Date(
    Date.now() + (options.expired ? -1000 : 86400000),
  ).toISOString();
  let calls = 0;
  const sdk = {
    conversationalAi: {
      agents: {
        get: async () => ({
          conversationConfig: {
            conversation: { maxDurationSeconds: options.unsafe ? 600 : 60 },
          },
          platformSettings: {
            auth: { enableAuth: true },
            callLimits: { dailyLimit: 2, agentConcurrencyLimit: 1 },
          },
        }),
      },
      conversations: {
        getSignedUrl: async ({ agentId }: { agentId: string }) => {
          assert.equal(agentId, "visitor-agent");
          calls++;
          return { signedUrl: "wss://fixture.invalid/visitor" };
        },
      },
    },
  };
  const store = createStore(":memory:");
  const app = createApp(store, (() => sdk) as unknown as typeof client);
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((r) => server.on("listening", r));
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  try {
    await run(base, () => calls);
  } finally {
    await new Promise<void>((r) => server.close(() => r()));
    store.close();
  }
}
test("visitor session targets only the constrained guest agent; private paid tools stay locked", () =>
  fixture(async (base, calls) => {
    const status = await (await fetch(base + "/api/status")).json();
    assert.equal(status.guestVoice.enabled, true);
    assert.equal(status.guestVoice.dailyLimit, 2);
    const r = await fetch(base + "/api/guest/session", { method: "POST" });
    assert.equal(r.status, 200);
    assert.ok((await r.json()).signedUrl);
    assert.equal(calls(), 1);
    for (const path of [
      "/audio/speech",
      "/agent/session",
      "/escalations/review",
    ]) {
      const blocked = await fetch(base + "/api" + path, { method: "POST" });
      assert.equal(blocked.status, 401);
    }
    const shipment = await fetch(base + "/api/guest/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: "HV-2048" }),
    });
    assert.equal((await shipment.json()).shipment.status, "Customs hold");
    const cross = await fetch(base + "/api/guest/session", {
      method: "POST",
      headers: { Origin: "https://outside.example" },
    });
    assert.equal(cross.status, 403);
    assert.equal(calls(), 1);
  }));
test("expired visitor window does not issue a signed session", () =>
  fixture(
    async (base, calls) => {
      const r = await fetch(base + "/api/guest/session", { method: "POST" });
      assert.equal(r.status, 410);
      assert.equal(calls(), 0);
    },
    { expired: true },
  ));
test("unsafe provider limits fail closed before issuing a visitor URL", () =>
  fixture(
    async (base, calls) => {
      const r = await fetch(base + "/api/guest/session", { method: "POST" });
      assert.equal(r.status, 503);
      assert.equal(calls(), 0);
    },
    { unsafe: true },
  ));
