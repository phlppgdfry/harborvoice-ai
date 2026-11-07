import "../server/environment.js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { client, agentId } from "../server/elevenlabs.js";
import { scenarios } from "../agent/scenarios.js";

// Explicit --run starts one bounded suite. The default only refreshes its report.
const sdk = client();
const manifest = JSON.parse(readFileSync("var/agent-tests.json", "utf8")) as {
  tests: Record<string, { id: string }>;
};
const invocationPath = "var/agent-invocation.json";
let invocationId: string;
if (process.argv.includes("--run")) {
  const result = await sdk.conversationalAi.agents.runTests(agentId(), {
    name: "HarborVoice 1.2 · six bounded multilingual scenarios",
    repeatCount: 1,
    tests: scenarios.map((scenario) => ({
      testId: manifest.tests[scenario.id].id,
    })),
  });
  invocationId = result.id;
  writeFileSync(invocationPath, JSON.stringify({ id: invocationId }), {
    mode: 0o600,
  });
} else {
  if (!existsSync(invocationPath))
    throw new Error(
      "No recorded invocation. Use --run to start one paid suite.",
    );
  invocationId = JSON.parse(readFileSync(invocationPath, "utf8")).id;
}
const invocation =
  await sdk.conversationalAi.tests.invocations.get(invocationId);
writeFileSync(
  "var/agent-invocation-detail.json",
  JSON.stringify(invocation, null, 2),
  { mode: 0o600 },
);
const cases = scenarios.map((scenario) => {
  const run = invocation.testRuns.find(
    (test) => test.testId === manifest.tests[scenario.id].id,
  );
  return {
    id: scenario.id,
    name: scenario.name,
    language: scenario.language,
    status: run?.status || "pending",
    result: run?.conditionResult?.result || "unknown",
    creditsUsed: run?.creditsUsed ?? null,
    summary:
      run?.conditionResult?.rationale?.summary ||
      "Awaiting provider evaluation.",
  };
});
const report = {
  checkedAt: new Date().toISOString(),
  scope:
    "Real ElevenLabs LLM simulations; synthetic shipment and escalation tool fixtures; no microphone, telephony or generated speech tested.",
  repeatCount: 1,
  maxTurnsPerCase: 4,
  completed: cases.every((test) => test.status !== "pending"),
  passed: cases.filter(
    (test) => test.status === "passed" && test.result === "success",
  ).length,
  cases,
};
writeFileSync(
  "docs/agent-evaluation.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
