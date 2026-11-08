import { randomBytes } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const name = `harborvoice-test-${randomBytes(5).toString("hex")}`;
const dir = mkdtempSync(join(tmpdir(), "harborvoice-pg-"));
const password = randomBytes(24).toString("hex");
writeFileSync(join(dir, "db.env"), `POSTGRES_PASSWORD=${password}\n`, {
  mode: 0o600,
});
let started = false;
try {
  execFileSync(
    "docker",
    [
      "run",
      "--rm",
      "-d",
      "--name",
      name,
      "--env-file",
      join(dir, "db.env"),
      "-p",
      "127.0.0.1::5432",
      "postgres:17-alpine",
    ],
    { stdio: ["ignore", "ignore", "inherit"] },
  );
  started = true;
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
  if (!ready) throw new Error("Ephemeral PostgreSQL did not become ready.");
  const port = execFileSync("docker", ["port", name, "5432/tcp"], {
    encoding: "utf8",
  })
    .trim()
    .split(":")
    .at(-1);
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", "--test", "tests/production.test.ts"],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        TEST_POSTGRES: "1",
        DATABASE_URL: `postgresql://postgres:${password}@127.0.0.1:${port}/postgres`,
      },
    },
  );
  if (result.status === 0) {
    const backup = execFileSync("docker", [
      "exec",
      name,
      "pg_dump",
      "-U",
      "postgres",
      "--schema",
      "harborvoice",
      "--format=custom",
      "postgres",
    ]);
    execFileSync(
      "docker",
      [
        "exec",
        name,
        "psql",
        "-U",
        "postgres",
        "-c",
        "CREATE DATABASE restore_check",
      ],
      { stdio: "ignore" },
    );
    execFileSync(
      "docker",
      [
        "exec",
        "-i",
        name,
        "pg_restore",
        "-U",
        "postgres",
        "-d",
        "restore_check",
      ],
      { input: backup, stdio: ["pipe", "ignore", "inherit"] },
    );
    const count = execFileSync(
      "docker",
      [
        "exec",
        name,
        "psql",
        "-U",
        "postgres",
        "-d",
        "restore_check",
        "-tAc",
        "SELECT count(*) FROM harborvoice.workspace",
      ],
      { encoding: "utf8" },
    ).trim();
    if (count !== "1") throw new Error("Backup restore verification failed.");
    console.log(
      "PASS: real pg_dump/pg_restore round trip on the disposable synthetic database",
    );
  }
  process.exitCode = result.status ?? 1;
} finally {
  if (started) execFileSync("docker", ["stop", name], { stdio: "ignore" });
  rmSync(dir, { recursive: true, force: true });
}
