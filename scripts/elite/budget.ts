import { governor } from "./governor.js";
import { writeFileSync, mkdirSync } from "node:fs";
const [operation = "report", key, workstream, estimate] = process.argv.slice(2);
if (operation === "init")
  await governor.initialize("HarborVoice v2.0.0 Elite", 50_000, 5_000);
else if (operation === "reserve")
  await governor.reserve(key, workstream, Number(estimate));
else if (
  operation === "pending" ||
  operation === "completed" ||
  operation === "failed"
)
  await governor.update(key, {
    status: operation,
    ...(workstream ? { providerIds: workstream.split(",") } : {}),
  });
const r = await governor.report();
const { ledger, ...state } = r;
const report = {
  checkedAt: ledger.latest.checkedAt,
  execution: ledger.execution,
  maximumAdditional: ledger.maximumAdditional,
  minimumBalance: ledger.minimumBalance,
  billingBuffer: ledger.billingBuffer,
  ...state,
  operations: Object.values(ledger.operations).map(
    ({ providerIds, ...op }) => ({
      ...op,
      providerReferenceCount: providerIds.length,
    }),
  ),
  scope:
    "Account-wide observed delta. Estimates remain reserved after completion or failure to cover delayed billing. No attribution of concurrent external usage. Provider IDs and credentials stay private. Ledger uses exclusive filesystem locking and atomic replacement; hosted serverless requests must not use this local ledger.",
};
mkdirSync("docs/elite", { recursive: true });
writeFileSync(
  "docs/elite/credit-usage.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
