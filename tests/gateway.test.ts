import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import { createGateway } from "../server/gateway.js";
import {
  issueOperatorSession,
  validOperatorSession,
} from "../server/operator-auth.js";
let server: Server,
  base = "";
const secret = "gateway-operator-test";
before(async () => {
  process.env.OPERATOR_TOKEN = secret;
  process.env.ELEVENLABS_API_KEY = "fixture-no-network";
  process.env.ELEVENLABS_AGENT_ID = "agent-fixture";
  server = createGateway().listen(0, "127.0.0.1");
  await new Promise<void>((r) => server.on("listening", r));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
after(async () => new Promise<void>((r) => server.close(() => r())));
test("hosted status separates configured API, browser workspace and operator authentication", async () => {
  const r = await fetch(base + "/api/status");
  const data = await r.json();
  assert.equal(data.configured, true);
  assert.equal(data.agentReady, true);
  assert.equal(data.workspaceStorage, "browser");
  assert.equal(data.operatorAuthenticated, false);
  assert.equal(data.uploadLimitBytes, 4 * 1024 * 1024);
  assert.equal(r.headers.get("cache-control"), "no-store");
  assert.ok(!JSON.stringify(data).includes(secret));
});
test("hosted gateway fails closed when no operator secret is configured", () => {
  delete process.env.OPERATOR_TOKEN;
  try {
    assert.throws(() => createGateway(), /OPERATOR_TOKEN/);
  } finally {
    process.env.OPERATOR_TOKEN = secret;
  }
});
test("public visitors cannot trigger a paid provider request", async () => {
  const r = await fetch(base + "/api/audio/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "Test", voiceId: "voice-fixture" }),
  });
  assert.equal(r.status, 401);
  assert.match((await r.json()).error, /Sign in/);
});
test("workspace writes and webhook retention are explicitly unavailable on a stateless gateway", async () => {
  for (const [path, method] of [
    ["/api/state", "GET"],
    ["/api/sessions", "POST"],
    ["/api/webhooks/elevenlabs", "POST"],
  ]) {
    const r = await fetch(base + path, { method });
    assert.equal(r.status, 409);
    assert.match((await r.json()).error, /browser/);
  }
});
test("wrong operator code and cross-origin sign-in do not create a session", async () => {
  const wrong = await fetch(base + "/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: "wrong" }),
  });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.headers.get("set-cookie"), null);
  const external = await fetch(base + "/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://external.example",
    },
    body: JSON.stringify({ code: secret }),
  });
  assert.equal(external.status, 403);
});
test("operator sign-in creates a secure HttpOnly session without echoing the secret", async () => {
  const login = await fetch(base + "/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: secret }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie")!;
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /Secure/i);
  assert.match(cookie, /SameSite=Strict/i);
  assert.ok(!cookie.includes(secret));
  const result = await fetch(base + "/api/status", {
    headers: { Cookie: cookie.split(";")[0] },
  });
  assert.equal((await result.json()).operatorAuthenticated, true);
  const lookup = await fetch(base + "/api/tools/lookup", {
    method: "POST",
    headers: {
      Cookie: cookie.split(";")[0],
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reference: "HV-2048" }),
  });
  assert.equal(lookup.status, 200);
  assert.equal((await lookup.json()).shipment.status, "Customs hold");
});
test("cookie signatures reject tampering, expiry and a rotated secret", () => {
  const now = Date.now();
  const cookie = "hv_operator=" + issueOperatorSession(secret, now);
  assert.equal(validOperatorSession(cookie, secret, now), true);
  assert.equal(validOperatorSession(cookie + "tampered", secret, now), false);
  assert.equal(
    validOperatorSession(cookie, secret, now + 8 * 60 * 60 * 1000),
    false,
  );
  assert.equal(validOperatorSession(cookie, "new-secret", now), false);
});
test("Vercel rewrite routes preserve nested API paths", async () => {
  const r = await fetch(base + "/api/index?route=tools%2Flookup", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reference: "HV-2048" }),
  });
  assert.equal(r.status, 200);
  assert.equal((await r.json()).found, true);
});
test("hosted uploads above four MB are rejected before a provider call", async () => {
  const body = new FormData();
  body.append(
    "file",
    new Blob([new Uint8Array(4 * 1024 * 1024 + 1)], { type: "audio/wav" }),
    "large.wav",
  );
  const r = await fetch(base + "/api/audio/transcribe", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
    body,
  });
  assert.equal(r.status, 400);
  assert.match((await r.json()).error, /4 MB/);
});
