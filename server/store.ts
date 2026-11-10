import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { initialState, type State } from "../src/domain.js";
import { restoreWorkspace } from "../src/state-schema.js";
import { createHash } from "node:crypto";
export function createStore(filename = "var/harborvoice.sqlite") {
  if (filename !== ":memory:")
    mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(
    "PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS workspace(id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS webhook_events(id TEXT PRIMARY KEY, received_at TEXT NOT NULL, payload TEXT NOT NULL);",
  );
  db.exec(
    "CREATE TABLE IF NOT EXISTS revoked_sessions(hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL); PRAGMA user_version=1;",
  );
  if (!db.prepare("SELECT id FROM workspace WHERE id=1").get())
    db.prepare("INSERT INTO workspace VALUES(1, ?)").run(
      JSON.stringify(initialState),
    );
  return {
    read: (): State => {
      const raw = (
        db.prepare("SELECT data FROM workspace WHERE id=1").get() as {
          data: string;
        }
      ).data;
      const state = restoreWorkspace(raw);
      if (!state)
        throw new Error(
          "Persisted workspace is invalid; restore from a verified backup.",
        );
      return state;
    },
    mutate<T>(fn: (s: State) => T): T {
      db.exec("BEGIN IMMEDIATE");
      try {
        const state = this.read();
        state.sessions = state.sessions.filter(
          (s) => Date.parse(s.startedAt) >= Date.now() - 30 * 86400000,
        );
        const result = fn(state);
        if (!restoreWorkspace(JSON.stringify(state)))
          throw new Error("Invalid workspace mutation.");
        db.prepare("UPDATE workspace SET data=? WHERE id=1").run(
          JSON.stringify(state),
        );
        db.prepare("DELETE FROM webhook_events WHERE received_at < ?").run(
          new Date(Date.now() - 30 * 86400000).toISOString(),
        );
        db.prepare("DELETE FROM revoked_sessions WHERE expires_at < ?").run(
          Date.now(),
        );
        db.exec("COMMIT");
        return result;
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    },
    webhook(id: string, payload: string) {
      return (
        db
          .prepare("INSERT OR IGNORE INTO webhook_events VALUES(?,?,?)")
          .run(id, new Date().toISOString(), payload).changes > 0
      );
    },
    async revokeSession(cookie: string) {
      db.prepare("INSERT OR IGNORE INTO revoked_sessions VALUES(?,?)").run(
        createHash("sha256").update(cookie).digest("hex"),
        Date.now() + 31 * 86400000,
      );
    },
    async sessionRevoked(cookie: string) {
      return !!db
        .prepare(
          "SELECT hash FROM revoked_sessions WHERE hash=? AND expires_at>?",
        )
        .get(createHash("sha256").update(cookie).digest("hex"), Date.now());
    },
    health() {
      db.prepare("SELECT id FROM workspace WHERE id=1").get();
    },
    close: () => db.close(),
  };
}
export type Store = {
  read(): State | Promise<State>;
  mutate<T>(fn: (s: State) => T): T | Promise<T>;
  webhook(id: string, payload: string): boolean | Promise<boolean>;
  close(): void | Promise<void>;
  ready?(): Promise<void>;
  health?(): void | Promise<void>;
  revokeSession?(cookie: string): Promise<void>;
  sessionRevoked?(cookie: string): Promise<boolean>;
};
