import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import {
  evaluate,
  report,
  type Scenario,
  type Observation,
  type Report,
} from "../../packages/agentops-kit/src/index.js";
const scenarios = JSON.parse(
  readFileSync("benchmarks/voice-ai/scenarios/contracts.json", "utf8"),
) as Scenario[];
const observations = JSON.parse(
  readFileSync(
    "benchmarks/voice-ai/scenarios/contract-observations.json",
    "utf8",
  ),
) as Record<string, Observation>;
assert.equal(scenarios.length, 12);
assert.equal(new Set(scenarios.map((s) => s.id)).size, 12);
for (const language of ["en", "nl", "fr"])
  assert.equal(scenarios.filter((s) => s.language === language).length, 4);
const results = await evaluate(scenarios, {
  evidenceType: "fixture",
  execute: async (s) => {
    const o = observations[s.id];
    if (!o) throw Error("Missing independently authored observation.");
    return o;
  },
});
assert.equal(results.filter((r) => r.passed).length, 3);
for (const language of ["en", "nl", "fr"]) {
  const rows = results.filter((r) => r.scenario.language === language);
  assert.equal(rows.filter((r) => r.passed).length, 1);
  assert.ok(rows.some((r) => r.failedAssertions?.includes("toolCalls")));
  assert.ok(rows.some((r) => r.failedAssertions?.includes("facts")));
}
const r: Report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  configVersion: "structured-contract-v1",
  results,
  costs: {
    reportedCredits: 0,
    scope: "Offline adversarial observations; no provider calls.",
  },
  limitations: [
    "Twelve manually authored contracts, four each in EN/NL/FR; observations intentionally include nine failures.",
    "Checks exact ordered tool arguments and structured facts, not semantic transcript truth, language fluency or audio.",
    "This is a validator sensitivity study, not a held-out model evaluation or a measured improvement in agent reliability.",
    "A real provider experiment needs independent annotations, frozen configuration, explicit spending approval and account-wide coordination.",
  ],
};
mkdirSync("apps/agentproof/public", { recursive: true });
writeFileSync("apps/agentproof/public/contracts.json", report(r, "json"));
writeFileSync("docs/final-mastery/contracts.json", report(r, "json"));
console.log(
  "12 multilingual adversarial contracts: 3 accepted controls, 9 detected failures; zero provider calls.",
);
