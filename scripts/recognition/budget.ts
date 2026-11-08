import { governor } from "./governor.js";
import { governor as previous } from "../elite/governor.js";
import { existsSync, writeFileSync, readFileSync, copyFileSync } from "node:fs";
if (!existsSync(governor.path)) {
  const prior = await previous.report();
  if (prior.pending) throw Error("Prior generation jobs remain pending.");
  copyFileSync(previous.path, "var/recognition/prior-ledger.json");
  writeFileSync(
    "var/recognition/prior-reconciliation.json",
    JSON.stringify(prior, null, 2),
    { mode: 0o600 },
  );
  await governor.initialize("HarborVoice v2.1 Recognition Sprint", 25000, 3000);
}
const { ledger, ...state } = await governor.report();
const previousState = JSON.parse(
  readFileSync("var/recognition/prior-reconciliation.json", "utf8"),
);
const report = {
  checkedAt: ledger.latest.checkedAt,
  execution: ledger.execution,
  maximumAdditional: ledger.maximumAdditional,
  billingBuffer: ledger.billingBuffer,
  minimumBalance: ledger.minimumBalance,
  ...state,
  previousBudget: {
    maximumAdditional: previousState.ledger.maximumAdditional,
    observedUsage: previousState.observedUsage,
    conservativeLiability: previousState.conservativeLiability,
    retainedUnbilledExposure: Math.max(
      0,
      previousState.conservativeLiability - previousState.observedUsage,
    ),
    buffer: previousState.ledger.billingBuffer,
  },
  operations: Object.values(ledger.operations).map(
    ({ providerIds, ...op }) => ({
      ...op,
      providerReferenceCount: providerIds.length,
    }),
  ),
  scope:
    "Separate sprint budget. Prior ledger and failed holds preserved in a private immutable snapshot. Account-wide observed changes include any concurrent or delayed billing, not exact per-job invoices.",
};
writeFileSync(
  "docs/recognition/credit-usage.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
