import "../server/environment.js";
import { readFileSync, writeFileSync } from "node:fs";
import { client } from "../server/elevenlabs.js";
import { reservations } from "./academy-budget.js";
const baseline = JSON.parse(readFileSync("var/academy-budget.json", "utf8"));
const current = (await client().user.subscription.get()).characterCount;
const ledger = reservations();
const reservedCredits = Object.values(ledger).reduce(
  (sum, value) => sum + value.allowance,
  0,
);
const accountCreditDelta = current - baseline.creditsUsed;
const report = {
  checkedAt: new Date().toISOString(),
  maximumCredits: baseline.maximumCredits,
  reservedCredits,
  accountCreditDelta,
  withinBudget:
    accountCreditDelta >= 0 &&
    accountCreditDelta <= baseline.maximumCredits &&
    reservedCredits <= baseline.maximumCredits,
  reservations: ledger,
  itemizedCreativeCredits: 2192.5864952844827,
  nativeAudiobookUiQuoteCredits: 2528,
  scope:
    "Account-wide counter delta since this Academy run began, not an itemized invoice. Billing can be delayed and other account activity can affect the counter. Reservations are conservative request allowances, not actual charges. No generation is performed by this report.",
};
writeFileSync(
  "docs/academy-budget-evidence.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
if (!report.withinBudget) process.exitCode = 1;
