/** Explicitly opted-in live READ ONLY snapshot. Restore target is a disposable local container only. */
import { Pool, type PoolClient } from "pg";
import { config } from "dotenv";
import { execFileSync, spawnSync } from "node:child_process";
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createHash,
} from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  writeFileSync,
  readFileSync,
  rmSync,
  chmodSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";
import { restoreWorkspace } from "../../src/state-schema.js";
if (!process.argv.includes("--live-readonly"))
  throw Error(
    "Explicit --live-readonly required. No live database is used by default.",
  );
config({
  path:
    process.env.HARBORVOICE_RECOVERY_ENV || ".env.recovery.production.local",
  quiet: true,
});
const value = process.env.DATABASE_URL_UNPOOLED;
if (!value)
  throw Error(
    "Dedicated production DATABASE_URL_UNPOOLED is required via a private environment file.",
  );
const source = new URL(value);
if (!source.hostname.endsWith(".neon.tech"))
  throw Error(
    "Expected the dedicated Neon source, never an arbitrary recovery target.",
  );
for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"])
  source.searchParams.delete(key);
const pool = new Pool({
  connectionString: source.toString(),
  ssl: { rejectUnauthorized: true },
  max: 1,
  connectionTimeoutMillis: 10000,
  statement_timeout: 15000,
});
const folder = resolve(
  process.env.HARBORVOICE_BACKUP_DIR ||
    join(
      process.env.HOME!,
      "harborvoice-private-recovery",
      `${new Date().toISOString().slice(0, 10)}-live-restore`,
    ),
);
mkdirSync(folder, { recursive: true, mode: 0o700 });
chmodSync(folder, 0o700);
const temp = mkdtempSync(join(tmpdir(), "harborvoice-live-recovery-"));
const name = "harborvoice-recovery-" + randomBytes(5).toString("hex");
let container = false,
  phase = "connect",
  sourceTransaction = false;
const started = Date.now();
mkdirSync("var/closure", { recursive: true, mode: 0o700 });
let client: PoolClient | undefined;
try {
  client = await pool.connect();
  await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
  sourceTransaction = true;
  assert.equal(
    (await client.query("SHOW transaction_read_only")).rows[0]
      .transaction_read_only,
    "on",
  );
  const version = Number(
    (await client.query("SHOW server_version_num")).rows[0].server_version_num,
  );
  if (version < 180000 || version >= 190000)
    throw Error(
      "This runner requires a PostgreSQL 18 source; inspect before using another client version.",
    );
  const sql = `SELECT json_build_object('workspaceRows',(SELECT count(*) FROM harborvoice.workspace),'workspaceDigest',(SELECT md5(data::text) FROM harborvoice.workspace WHERE id=1),'webhookRows',(SELECT count(*) FROM harborvoice.webhook_events),'revokedRows',(SELECT count(*) FROM harborvoice.revoked_sessions),'schemaVersion',(SELECT max(version) FROM harborvoice.migrations)) AS evidence`;
  const original = (await client.query(sql)).rows[0].evidence;
  const snapshot = (await client.query("SELECT pg_export_snapshot() AS id"))
    .rows[0].id;
  phase = "disposable-container";
  const targetPassword = randomBytes(24).toString("hex");
  writeFileSync(
    join(temp, "target.env"),
    `POSTGRES_PASSWORD=${targetPassword}\n`,
    { mode: 0o600 },
  );
  execFileSync(
    "docker",
    [
      "run",
      "--rm",
      "-d",
      "--name",
      name,
      "--env-file",
      join(temp, "target.env"),
      "postgres:18-alpine",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  container = true;
  let ready = false;
  for (let i = 0; i < 60; i++) {
    if (
      spawnSync("docker", ["exec", name, "pg_isready", "-U", "postgres"])
        .status === 0
    ) {
      ready = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!ready) throw Error("Local restore container not ready.");
  const vars = {
    PGHOST: source.hostname,
    PGPORT: source.port || "5432",
    PGUSER: decodeURIComponent(source.username),
    PGPASSWORD: decodeURIComponent(source.password),
    PGDATABASE: decodeURIComponent(source.pathname.slice(1)),
    PGSSLMODE: "verify-full",
    PGSSLROOTCERT: "system",
    PGCONNECT_TIMEOUT: "10",
    PGOPTIONS: "-c default_transaction_read_only=on -c statement_timeout=30000",
  };
  if (Object.values(vars).some((v) => /[\r\n]/.test(v)))
    throw Error("Invalid credential file input.");
  writeFileSync(
    join(temp, "source.env"),
    Object.entries(vars)
      .map(([k, v]) => `${k}=${v}`)
      .join("\n") + "\n",
    { mode: 0o600 },
  );
  phase = "read-only-dump";
  const dump = execFileSync(
    "docker",
    [
      "exec",
      "--env-file",
      join(temp, "source.env"),
      name,
      "pg_dump",
      "--schema=harborvoice",
      "--format=custom",
      `--snapshot=${snapshot}`,
      "--no-owner",
      "--no-privileges",
    ],
    {
      maxBuffer: 32 * 1024 * 1024,
      timeout: 60000,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  await client.query("ROLLBACK");
  sourceTransaction = false;
  phase = "encrypted-artifact";
  const key = randomBytes(32),
    iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(dump), cipher.final()]);
  const backupPath = join(folder, `harborvoice-${Date.now()}.dump.aesgcm`),
    keyPath = backupPath + ".key";
  writeFileSync(
    backupPath,
    Buffer.concat([
      Buffer.from("HVBACKUP1"),
      iv,
      cipher.getAuthTag(),
      encrypted,
    ]),
    { mode: 0o600 },
  );
  writeFileSync(keyPath, key.toString("hex") + "\n", { mode: 0o600 });
  const file = readFileSync(backupPath);
  assert.equal(file.subarray(0, 9).toString(), "HVBACKUP1");
  const decrypt = createDecipheriv(
    "aes-256-gcm",
    Buffer.from(readFileSync(keyPath, "utf8").trim(), "hex"),
    file.subarray(9, 21),
  );
  decrypt.setAuthTag(file.subarray(21, 37));
  const restored = Buffer.concat([
    decrypt.update(file.subarray(37)),
    decrypt.final(),
  ]);
  assert.equal(
    createHash("sha256").update(restored).digest("hex"),
    createHash("sha256").update(dump).digest("hex"),
  );
  phase = "local-restore";
  execFileSync(
    "docker",
    [
      "exec",
      "-i",
      name,
      "pg_restore",
      "-U",
      "postgres",
      "--dbname=postgres",
      "--no-owner",
      "--no-privileges",
    ],
    { input: restored, timeout: 60000, stdio: ["pipe", "ignore", "pipe"] },
  );
  const actual = JSON.parse(
    execFileSync(
      "docker",
      ["exec", name, "psql", "-U", "postgres", "-d", "postgres", "-tAc", sql],
      { encoding: "utf8" },
    ).trim(),
  );
  assert.deepEqual(actual, original);
  const workspace = execFileSync(
    "docker",
    [
      "exec",
      name,
      "psql",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-tAc",
      "SELECT data::text FROM harborvoice.workspace WHERE id=1",
    ],
    { encoding: "utf8" },
  );
  assert.ok(restoreWorkspace(workspace));
  phase = "complete";
  const report = {
    checkedAt: new Date().toISOString(),
    passed: true,
    scope:
      "Live Neon source READ ONLY, consistent exported snapshot; encrypted local backup decrypted and restored only to a disposable unexposed local PostgreSQL 18 container.",
    sourceVersion: version,
    rows: {
      workspace: actual.workspaceRows,
      webhooks: actual.webhookRows,
      revokedSessions: actual.revokedRows,
    },
    schemaVersion: actual.schemaVersion,
    workspaceDigestMatched: true,
    workspaceSchemaValid: true,
    encryptedArtifactVerified: true,
    elapsedSeconds: Math.ceil((Date.now() - started) / 1000),
    productionWrites: false,
    productionRestore: false,
    limitations:
      "Not provider point-in-time recovery or offsite/scheduled backup. Encryption key is private on this Mac alongside backup; owner must arrange separate key custody for disaster recovery.",
  };
  writeFileSync(
    "var/closure/live-recovery.json",
    JSON.stringify(report, null, 2) + "\n",
    { mode: 0o600 },
  );
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  let diagnostic = error instanceof Error ? error.message : "Unknown failure";
  if (error && typeof error === "object" && "stderr" in error)
    diagnostic += "\n" + String(error.stderr);
  for (const secret of [value, decodeURIComponent(source.password)])
    if (secret) diagnostic = diagnostic.replaceAll(secret, "[redacted]");
  writeFileSync("var/closure/live-recovery-debug.txt", diagnostic, {
    mode: 0o600,
  });
  const report = {
    checkedAt: new Date().toISOString(),
    passed: false,
    phase,
    productionWrites: false,
    productionRestore: false,
  };
  writeFileSync(
    "var/closure/live-recovery.json",
    JSON.stringify(report, null, 2) + "\n",
    { mode: 0o600 },
  );
  console.error(JSON.stringify(report));
  process.exitCode = 1;
} finally {
  if (sourceTransaction && client)
    await client.query("ROLLBACK").catch(() => {});
  client?.release();
  await pool.end();
  if (container) execFileSync("docker", ["stop", name], { stdio: "ignore" });
  rmSync(temp, { recursive: true, force: true });
}
