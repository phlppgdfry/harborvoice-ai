import "../../server/environment.js";
import { client, agentId } from "../../server/elevenlabs.js";
import { enterpriseSettings } from "../../agent/enterprise-settings.js";
import { eliteScenarios } from "../../agent/elite-scenarios.js";
import { governor } from "./governor.js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const sdk = client(),
  branch = JSON.parse(
    readFileSync("var/elite/agent-branch.json", "utf8"),
  ).created_branch_id;
const tests = JSON.parse(readFileSync("var/elite/tests.json", "utf8"));
const selected = eliteScenarios.filter(
  (s) =>
    s.id.includes("unknown-reference") ||
    s.id.includes("driver-privacy") ||
    s.id === "elite-en-customs-pressure" ||
    s.id === "elite-nl-customs-pressure",
);
const path = "var/elite/remediation-invocation.json";
if (process.argv.includes("--run")) {
  if (existsSync(path))
    throw Error("Existing remediation invocation; poll rather than retry.");
  await sdk.conversationalAi.agents.update(agentId(), {
    ...enterpriseSettings,
    branchId: branch,
  });
  // Missing-reference fixture must agree with the real business rule: no escalation of unknown shipments.
  const bootstrap = JSON.parse(readFileSync("var/agent-manifest.json", "utf8"));
  const escalation = bootstrap.tools.find(
    (t: any) => t.name === "request_escalation",
  ).id;
  for (const s of selected.filter((s) => s.id.includes("unknown-reference"))) {
    const current = await sdk.conversationalAi.tests.get(tests[s.id].id);
    const body = current as any;
    await sdk.conversationalAi.tests.update(tests[s.id].id, {
      ...body,
      toolMockOverrides: {
        ...body.toolMockOverrides,
        [escalation]: [
          {
            mockResult: JSON.stringify({
              error: "Unknown shipment; no ticket created.",
            }),
            isError: true,
          },
        ],
      },
    });
  }
  await governor.reserve("enterprise-remediation", "agents", 3500);
  await governor.update("enterprise-remediation", { status: "pending" });
  const r = await sdk.conversationalAi.agents.runTests(agentId(), {
    name: "HarborVoice Elite · targeted multilingual remediation",
    branchId: branch,
    repeatCount: 1,
    tests: selected.map((s) => ({ testId: tests[s.id].id })),
  });
  writeFileSync(
    path,
    JSON.stringify(
      {
        id: r.id,
        selected: selected.map((s) => s.id),
        startedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    { mode: 0o600 },
  );
  await governor.update("enterprise-remediation", {
    status: "pending",
    providerIds: [r.id],
  });
}
if (!existsSync(path)) throw Error("Start explicitly with --run.");
const saved = JSON.parse(readFileSync(path, "utf8"));
const r = await sdk.conversationalAi.tests.invocations.get(saved.id);
writeFileSync("var/elite/remediation-raw.json", JSON.stringify(r, null, 2), {
  mode: 0o600,
});
const cases = saved.selected.map((id: string) => {
  const scenario = eliteScenarios.find((s) => s.id === id)!;
  const run = r.testRuns.find((t) => t.testId === tests[id].id);
  return {
    id,
    name: scenario.name,
    language: scenario.language,
    status: run?.status || "pending",
    result: run?.conditionResult?.result || "unknown",
    creditsUsed: run?.creditsUsed ?? null,
    summary: run?.conditionResult?.rationale?.summary || "Pending",
  };
});
const completed = cases.every((c: any) =>
  ["passed", "failed", "error"].includes(c.status),
);
const credits = cases.reduce(
  (n: number, c: any) => n + (c.creditsUsed || 0),
  0,
);
if (completed)
  await governor.update("enterprise-remediation", {
    status: "completed",
    reportedCredits: credits,
  });
const report = {
  checkedAt: new Date().toISOString(),
  completed,
  passed: cases.filter(
    (c: any) => c.status === "passed" && c.result === "success",
  ).length,
  total: cases.length,
  providerReportedCredits: credits,
  scope:
    "Targeted regression after prompt correction and correction of the missing-reference escalation fixture. This is not a rerun of the complete 52-case suite. Provider text simulations with synthetic business tools, no speech or real terminal.",
  cases,
};
writeFileSync(
  "docs/elite/remediation.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
