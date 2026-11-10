import { Pool } from "pg";
import { initialState, type State } from "../src/domain.js";
import { restoreWorkspace } from "../src/state-schema.js";
import { createHash } from "node:crypto";
import type { Store } from "./store.js";

export const migration = `
CREATE SCHEMA IF NOT EXISTS harborvoice;
REVOKE ALL ON SCHEMA harborvoice FROM PUBLIC;
CREATE TABLE IF NOT EXISTS harborvoice.migrations(version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS harborvoice.workspace(id integer PRIMARY KEY CHECK(id=1), data jsonb NOT NULL CHECK(jsonb_typeof(data)='object'));
CREATE TABLE IF NOT EXISTS harborvoice.webhook_events(id text PRIMARY KEY, received_at timestamptz NOT NULL DEFAULT now(), payload jsonb NOT NULL);
CREATE INDEX IF NOT EXISTS webhook_retention ON harborvoice.webhook_events(received_at);
CREATE TABLE IF NOT EXISTS harborvoice.revoked_sessions(hash text PRIMARY KEY, expires_at timestamptz NOT NULL);
REVOKE ALL ON ALL TABLES IN SCHEMA harborvoice FROM PUBLIC;
INSERT INTO harborvoice.migrations(version) VALUES(1) ON CONFLICT DO NOTHING;
`;
const sessionHash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export function createPostgresStore(url = process.env.DATABASE_URL!): Store {
  if (!url) throw new Error("DATABASE_URL is required.");
  const parsed = new URL(url);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
  // Never accept a connection-string option that disables certificate verification.
  for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"])
    parsed.searchParams.delete(key);
  const pool = new Pool({
    connectionString: parsed.toString(),
    max: 2,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    statement_timeout: 10000,
    idle_in_transaction_session_timeout: 10000,
    ssl: local ? false : { rejectUnauthorized: true },
    allowExitOnIdle: true,
  });
  pool.on("error", () =>
    console.error(JSON.stringify({ event: "database_pool_error" })),
  );
  let ready: Promise<void> | undefined;
  const initialise = () =>
    (ready ??= (async () => {
      const c = await pool.connect();
      try {
        await c.query("BEGIN");
        await c.query("SELECT pg_advisory_xact_lock(84719021)");
        const existed = (
          await c.query(
            "SELECT to_regclass('harborvoice.migrations') IS NOT NULL AS migrated",
          )
        ).rows[0].migrated;
        if (existed) {
          const valid = (
            await c.query(
              "SELECT to_regclass('harborvoice.workspace') IS NOT NULL AS present",
            )
          ).rows[0].present;
          if (!valid)
            throw new Error(
              "Previously migrated workspace is missing; restore a backup before startup.",
            );
        }
        await c.query(migration);
        if (
          existed &&
          !(await c.query("SELECT id FROM harborvoice.workspace WHERE id=1"))
            .rowCount
        )
          throw new Error(
            "Workspace record missing; refusing silent reseeding.",
          );
        await c.query(
          "INSERT INTO harborvoice.workspace(id,data) VALUES(1,$1::jsonb) ON CONFLICT DO NOTHING",
          [JSON.stringify(initialState)],
        );
        await c.query("COMMIT");
      } catch (e) {
        await c.query("ROLLBACK");
        throw e;
      } finally {
        c.release();
      }
    })().catch((e) => {
      ready = undefined;
      throw e;
    }));
  function decode(raw: unknown): State {
    const value = restoreWorkspace(JSON.stringify(raw));
    if (!value)
      throw new Error(
        "Persisted workspace failed validation; recovery required.",
      );
    return value;
  }
  return {
    ready: initialise,
    async health() {
      await initialise();
      await pool.query("SELECT 1 FROM harborvoice.workspace WHERE id=1");
    },
    async read() {
      await initialise();
      return decode(
        (await pool.query("SELECT data FROM harborvoice.workspace WHERE id=1"))
          .rows[0]?.data,
      );
    },
    async mutate<T>(fn: (s: State) => T) {
      await initialise();
      const c = await pool.connect();
      try {
        await c.query("BEGIN");
        const state = decode(
          (
            await c.query(
              "SELECT data FROM harborvoice.workspace WHERE id=1 FOR UPDATE",
            )
          ).rows[0]?.data,
        );
        const cutoff = Date.now() - 30 * 86400000;
        state.sessions = state.sessions.filter(
          (s) => Date.parse(s.startedAt) >= cutoff,
        );
        const result = fn(state);
        decode(state);
        await c.query(
          "UPDATE harborvoice.workspace SET data=$1::jsonb WHERE id=1",
          [JSON.stringify(state)],
        );
        await c.query(
          "DELETE FROM harborvoice.webhook_events WHERE received_at < now()-interval '30 days'",
        );
        await c.query(
          "DELETE FROM harborvoice.revoked_sessions WHERE expires_at < now()",
        );
        await c.query("COMMIT");
        return result;
      } catch (e) {
        await c.query("ROLLBACK");
        throw e;
      } finally {
        c.release();
      }
    },
    async webhook(id, payload) {
      await initialise();
      return (
        (
          await pool.query(
            "INSERT INTO harborvoice.webhook_events(id,payload) VALUES($1,$2::jsonb) ON CONFLICT DO NOTHING",
            [id, payload],
          )
        ).rowCount === 1
      );
    },
    async revokeSession(cookie) {
      await initialise();
      await pool.query(
        "INSERT INTO harborvoice.revoked_sessions(hash,expires_at) VALUES($1,now()+interval '31 days') ON CONFLICT DO NOTHING",
        [sessionHash(cookie)],
      );
    },
    async sessionRevoked(cookie) {
      await initialise();
      return (
        (
          await pool.query(
            "SELECT 1 FROM harborvoice.revoked_sessions WHERE hash=$1",
            [sessionHash(cookie)],
          )
        ).rowCount !== 0
      );
    },
    async close() {
      await pool.end();
    },
  };
}
