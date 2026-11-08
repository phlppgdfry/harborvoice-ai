import { test } from "node:test";
import assert from "node:assert/strict";
import { createPostgresStore, migration } from "../server/postgres.js";
import { createApp } from "../server/app.js";
import { createGateway } from "../server/gateway.js";
import { validateRuntime } from "../server/runtime.js";
import type { client } from "../server/elevenlabs.js";
import { proposeEscalation } from "../src/domain.js";
const enabled = process.env.TEST_POSTGRES === "1";
test("production config rejects demo storage, weak secrets and invalid public origin", () => {
  const before = { ...process.env };
  try {
    process.env.APP_MODE = "production";
    process.env.OPERATOR_TOKEN = "short";
    assert.throws(() => validateRuntime(true), /OPERATOR_TOKEN/);
    process.env.OPERATOR_TOKEN = "x".repeat(40);
    process.env.ELEVENLABS_API_KEY = "fixture";
    process.env.ELEVENLABS_AGENT_ID = "agent";
    process.env.PUBLIC_ORIGIN = "http://invalid";
    assert.throws(() => validateRuntime(true), /PUBLIC_ORIGIN/);
    process.env.PUBLIC_ORIGIN = "https://operator.example";
    delete process.env.DATABASE_URL;
    assert.throws(() => createGateway(), /DATABASE_URL/);
  } finally {
    process.env = before;
  }
});
test(
  "PostgreSQL migration, concurrency, rollback, restart and production authorization",
  { skip: !enabled },
  async () => {
    const url = process.env.DATABASE_URL!;
    assert.ok(url);
    assert.match(migration, /REVOKE ALL/);
    let store = createPostgresStore(url);
    await store.ready!();
    await store.mutate((s) => {
      s.tickets = [];
      s.sessions = [];
    });
    const ids = await Promise.all(
      Array.from({ length: 6 }, () =>
        store.mutate((s) =>
          proposeEscalation(s, "HV-2048", "Concurrent synthetic test"),
        ),
      ),
    );
    assert.equal(new Set(ids.map((x) => x.id)).size, 1);
    await assert.rejects(
      store.mutate((s) => {
        s.tickets = [];
        throw new Error("injected write failure");
      }) as Promise<unknown>,
      /injected/,
    );
    assert.equal((await store.read()).tickets.length, 1);
    await store.close();
    store = createPostgresStore(url);
    assert.equal((await store.read()).tickets.length, 1);
    const previous = { ...process.env };
    Object.assign(process.env, {
      APP_MODE: "production",
      NODE_ENV: "test",
      OPERATOR_TOKEN: "test-production-operator-".repeat(2),
      ELEVENLABS_API_KEY: "fixture-no-network",
      ELEVENLABS_AGENT_ID: "agent-fixture",
      PUBLIC_ORIGIN: "https://operator.example",
    });
    const sdk = {
      conversationalAi: {
        agents: {
          get: async () => ({
            name: "Synthetic fixture agent",
            platformSettings: { auth: { enableAuth: true } },
          }),
        },
      },
    };
    const app = createApp(store, (() => sdk) as unknown as typeof client, {
      workspaceStorage: "postgres",
      hosted: true,
    });
    const server = app.listen(0, "127.0.0.1");
    await new Promise<void>((r) => server.on("listening", r));
    const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    try {
      assert.equal((await fetch(base + "/api/health")).status, 200);
      assert.equal((await fetch(base + "/api/state")).status, 401);
      const login = await fetch(base + "/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: process.env.OPERATOR_TOKEN }),
      });
      assert.equal(login.status, 200);
      const cookie = login.headers.get("set-cookie")!.split(";")[0];
      assert.match(login.headers.get("set-cookie")!, /Secure/);
      const headers = { Cookie: cookie, "Content-Type": "application/json" };
      const status = await (
        await fetch(base + "/api/status", { headers })
      ).json();
      assert.equal(status.demoEnabled, false);
      assert.equal(status.workspaceStorage, "postgres");
      assert.equal(status.deployment, "hosted");
      assert.equal(
        (
          await fetch(base + "/api/demo/chat", {
            method: "POST",
            headers,
            body: JSON.stringify({}),
          })
        ).status,
        409,
      );
      assert.equal(
        (
          await fetch(base + "/api/escalations", {
            method: "POST",
            headers: { ...headers, Origin: "https://evil.example" },
            body: "{}",
          })
        ).status,
        403,
      );
      const readiness = await fetch(base + "/api/readiness", { headers });
      assert.equal(readiness.status, 200);
      assert.equal((await readiness.json()).provider.status, "authenticated");
      const sample = {
        id: crypto.randomUUID(),
        mode: "live",
        startedAt: new Date().toISOString(),
        language: "en",
        messages: [{ role: "agent", text: "Synthetic persisted fixture" }],
      };
      assert.equal(
        (
          await fetch(base + "/api/sessions", {
            method: "POST",
            headers,
            body: JSON.stringify(sample),
          })
        ).status,
        200,
      );
      assert.equal(
        (await fetch(base + `/api/conversations/${sample.id}`, { headers }))
          .status,
        200,
      );
      const imported = await fetch(base + "/api/import/conversations", {
        method: "POST",
        headers,
        body: JSON.stringify({ sessions: [sample] }),
      });
      assert.equal(
        (await imported.json()).imported,
        0,
        "import must preserve existing IDs without overwriting",
      );
      assert.equal(
        (
          await fetch(base + `/api/conversations/${sample.id}`, {
            method: "DELETE",
            headers,
          })
        ).status,
        204,
      );
      assert.equal(
        (await fetch(base + `/api/conversations/${sample.id}`, { headers }))
          .status,
        404,
      );
      assert.match(
        (await fetch(base + "/api/health")).headers.get(
          "content-security-policy",
        )!,
        /frame-ancestors 'none'/,
      );
      assert.equal(
        (await fetch(base + "/api/auth/session", { method: "DELETE", headers }))
          .status,
        200,
      );
      assert.equal(
        (await fetch(base + "/api/state", { headers })).status,
        401,
        "logged-out cookie must be revoked in durable storage",
      );
      const unauthorizedKey = {
        Authorization: `Bearer ${process.env.OPERATOR_TOKEN}`,
      };
      assert.equal(
        (await fetch(base + "/api/state", { headers: unauthorizedKey })).status,
        200,
        "cookie logout must not revoke the operator API credential",
      );
    } finally {
      await new Promise<void>((r) => server.close(() => r()));
      await store.close();
      process.env = previous;
    }
  },
);
