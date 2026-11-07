import { test, after, before } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import type { Server } from "node:http";
import { createApp } from "../server/app.js";
import { createStore } from "../server/store.js";
import { verifyWebhook } from "../server/security.js";
const store = createStore(":memory:");
let server: Server;
let url = "";
before(async () => {
  delete process.env.ELEVENLABS_API_KEY;
  delete process.env.ELEVENLABS_AGENT_ID;
  process.env.OPERATOR_TOKEN = "test-operator";
  process.env.ELEVENLABS_WEBHOOK_SECRET = "test-webhook";
  server = createApp(store).listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.on("listening", resolve));
  const address = server.address();
  url = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}/api`;
});
after(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((e) => (e ? reject(e) : resolve())),
  );
  store.close();
});
const post = (
  path: string,
  body: unknown,
  extra: Record<string, string> = {},
) =>
  fetch(url + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer test-operator",
      ...extra,
    },
    body: JSON.stringify(body),
  });
test("status never reveals secrets", async () => {
  const r = await fetch(url + "/status");
  const body = await r.text();
  assert.equal(r.status, 200);
  assert.ok(!body.includes("test-operator"));
  assert.equal(JSON.parse(body).configured, false);
});
test("workspace requires configured operator token", async () => {
  assert.equal((await fetch(url + "/state")).status, 401);
  assert.equal(
    (
      await fetch(url + "/state", {
        headers: { Authorization: "Bearer wrong" },
      })
    ).status,
    401,
  );
});
test("cross-origin requests are rejected even with credentials", async () => {
  assert.equal(
    (
      await post(
        "/tools/lookup",
        { reference: "HV-2048" },
        { Origin: "https://untrusted.example" },
      )
    ).status,
    403,
  );
});
test("lookup reports unknown without hallucinating data", async () => {
  const response = await post("/tools/lookup", { reference: "HV-9999" });
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).found, false);
});
test("invalid input cannot mutate workspace", async () => {
  assert.equal(
    (await post("/escalations", { shipmentId: "HV-2048", reason: "x" })).status,
    400,
  );
  assert.equal(store.read().tickets.length, 0);
});
test("persisted escalation is pending, repeated request deduplicates, approval leaves cargo untouched", async () => {
  const body = {
    shipmentId: "HV-2048",
    reason: "Please review the customs hold.",
  };
  const a = await (await post("/escalations", body)).json();
  const b = await (await post("/escalations", body)).json();
  assert.equal(a.id, b.id);
  assert.equal(a.status, "Pending review");
  assert.equal(
    (await post("/escalations/review", { id: a.id, decision: "Approved" }))
      .status,
    200,
  );
  assert.equal(store.read().shipments[0].status, "Customs hold");
  assert.equal(
    (await post("/escalations/review", { id: a.id, decision: "Rejected" }))
      .status,
    400,
  );
});
test("demo sessions persist transcript and language", async () => {
  const sessionId = crypto.randomUUID();
  const response = await post("/demo/chat", {
    text: "Waar is HV-2048?",
    language: "nl",
    sessionId,
  });
  assert.equal(response.status, 200);
  const session = store.read().sessions.find((s) => s.id === sessionId)!;
  assert.equal(session.messages.length, 2);
  assert.equal(session.mode, "demo");
  assert.equal(session.language, "nl");
});
test("missing API key gives actionable error without external call", async () => {
  const response = await post("/agent/session", {});
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /ELEVENLABS_API_KEY/);
});
test("webhook signature rejects tampering, expiry, missing and future timestamp", () => {
  const raw = Buffer.from('{"event_id":"one"}');
  const now = Date.now();
  const timestamp = Math.floor(now / 1000);
  const sig = createHmac("sha256", "secret")
    .update(`${timestamp}.`)
    .update(raw)
    .digest("hex");
  assert.ok(verifyWebhook(raw, `t=${timestamp},v0=${sig}`, "secret", now));
  assert.equal(
    verifyWebhook(Buffer.from("{}"), `t=${timestamp},v0=${sig}`, "secret", now),
    false,
  );
  assert.equal(
    verifyWebhook(raw, `t=${timestamp},v0=${sig}`, "secret", now + 301000),
    false,
  );
  assert.equal(verifyWebhook(raw, "", "secret", now), false);
  assert.equal(
    verifyWebhook(raw, `t=${timestamp},v0=${sig}`, "secret", now - 301000),
    false,
  );
});
test("signed webhook delivery is idempotent and cannot mutate shipment status", async () => {
  const raw = JSON.stringify({
    type: "post_call_transcription",
    data: { conversation_id: "demo-one" },
  });
  const timestamp = Math.floor(Date.now() / 1000);
  const sig = createHmac("sha256", "test-webhook")
    .update(`${timestamp}.${raw}`)
    .digest("hex");
  const deliver = () =>
    fetch(url + "/webhooks/elevenlabs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "elevenlabs-signature": `t=${timestamp},v0=${sig}`,
      },
      body: raw,
    });
  const first = await deliver();
  assert.equal(first.status, 200);
  assert.equal((await first.json()).duplicate, false);
  assert.equal((await (await deliver()).json()).duplicate, true);
  assert.equal(store.read().shipments[0].status, "Customs hold");
});
test("webhook without valid signature is rejected", async () => {
  assert.equal(
    (await post("/webhooks/elevenlabs", { type: "fake" })).status,
    401,
  );
});
