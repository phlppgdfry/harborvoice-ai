import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CreditGovernor } from "../lib/credit-governor.js";
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "hv-credit-"));
  let used = 1000,
    limit = 111200;
  const g = new CreditGovernor(join(dir, "ledger.json"), async () => ({
    used,
    limit,
    checkedAt: new Date().toISOString(),
  }));
  return {
    g,
    setUsed: (n: number) => {
      used = n;
    },
    setLimit: (n: number) => {
      limit = n;
    },
    close: () => rmSync(dir, { recursive: true, force: true }),
  };
}
test("governor preserves hard allowance, billing buffer and minimum account balance", async () => {
  const f = fixture();
  try {
    await f.g.initialize("test");
    await f.g.reserve("a", "video", 44000);
    await assert.rejects(f.g.reserve("b", "video", 1001), /hard stop/);
    const r = await f.g.report();
    assert.equal(r.ledger.minimumBalance, 60200);
    assert.equal(r.budgetRemaining, 1000);
  } finally {
    f.close();
  }
});
test("failed and pending jobs retain reservations and cannot be blindly retried", async () => {
  const f = fixture();
  try {
    await f.g.initialize("test");
    await f.g.reserve("a", "audio", 2000);
    await f.g.update("a", { status: "pending", providerIds: ["provider-job"] });
    await f.g.update("a", { status: "failed" });
    await assert.rejects(f.g.reserve("a", "audio", 2000), /already recorded/);
    const r = await f.g.report();
    assert.equal(r.failedReservations, 2000);
    assert.deepEqual(r.ledger.operations.a.providerIds, ["provider-job"]);
  } finally {
    f.close();
  }
});
test("account-wide external spend and delayed billing reconcile conservatively", async () => {
  const f = fixture();
  try {
    await f.g.initialize("test");
    await f.g.reserve("a", "audio", 2000);
    await f.g.update("a", { status: "completed", reportedCredits: 1200 });
    let r = await f.g.report();
    assert.equal(r.conservativeLiability, 2000);
    f.setUsed(6000);
    r = await f.g.report();
    assert.equal(r.conservativeLiability, 5000);
    assert.equal(r.budgetRemaining, 40000);
    f.setLimit(112000);
    await assert.rejects(f.g.report(), /quota\/counter changed/);
  } finally {
    f.close();
  }
});
test("independent governor instances cannot concurrently overwrite reservations", async () => {
  const f = fixture();
  try {
    await f.g.initialize("test");
    const g2 = new CreditGovernor(f.g.path, f.g.readSnapshot);
    const r = await Promise.allSettled([
      f.g.reserve("a", "audio", 30000),
      g2.reserve("b", "audio", 30000),
    ]);
    assert.equal(r.filter((x) => x.status === "fulfilled").length, 1);
    assert.equal(Object.keys((await f.g.report()).ledger.operations).length, 1);
  } finally {
    f.close();
  }
});

test("corrupt reservation data cannot turn the available allowance into NaN", async () => {
  const f = fixture();
  try {
    await f.g.initialize("test");
    await f.g.reserve("a", "audio", 500);
    const ledger = JSON.parse(readFileSync(f.g.path, "utf8"));
    delete ledger.operations.a.estimate;
    writeFileSync(f.g.path, JSON.stringify(ledger));
    await assert.rejects(f.g.reserve("b", "audio", 40000), /failed validation/);
  } finally {
    f.close();
  }
});
test("a configuration cannot expand the owner-authorized maximum", async () => {
  const f = fixture();
  try {
    await assert.rejects(f.g.initialize("test", 50001), /authorized budget/);
    await assert.rejects(f.g.initialize("test", 50000, 0), /authorized budget/);
  } finally {
    f.close();
  }
});
