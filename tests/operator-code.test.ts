import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadOperatorCode } from "../scripts/ops/operator-code.js";
test("explicit operator file takes precedence over an ambient preview credential", () => {
  const dir = mkdtempSync(join(tmpdir(), "harborvoice-code-test-"));
  try {
    const file = join(dir, "operator.txt"),
      production = "synthetic-production-fixture-".repeat(2);
    writeFileSync(file, production + "\n", { mode: 0o600 });
    assert.equal(
      loadOperatorCode({
        HARBORVOICE_OPERATOR_CODE_FILE: file,
        OPERATOR_TOKEN: "synthetic-preview-fixture-".repeat(2),
      }),
      production,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test("explicit environment credential is usable without a preview file", () => {
  const token = "synthetic-environment-fixture-".repeat(2);
  assert.equal(loadOperatorCode({ OPERATOR_TOKEN: token }), token);
  assert.throws(() => loadOperatorCode({}), /No code was sent/);
});
test("dotenv or multiline input fails before any login and does not echo credentials", () => {
  const dir = mkdtempSync(join(tmpdir(), "harborvoice-code-test-"));
  const secret = "synthetic-sensitive-fixture-".repeat(2);
  try {
    const file = join(dir, "operator.txt");
    for (const value of [
      "OPERATOR_TOKEN=" + secret,
      secret + "\nOTHER=value",
    ]) {
      writeFileSync(file, value, { mode: 0o600 });
      assert.throws(
        () => loadOperatorCode({ HARBORVOICE_OPERATOR_CODE_FILE: file }),
        (error: unknown) =>
          error instanceof Error &&
          !error.message.includes(secret) &&
          error.message.includes("No code was sent"),
      );
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
