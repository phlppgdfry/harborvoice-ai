import "../../server/environment.js";
import { client, agentId } from "../../server/elevenlabs.js";
import { eliteScenarios } from "../../agent/elite-scenarios.js";
import { enterpriseSettings } from "../../agent/enterprise-settings.js";
import { initialState } from "../../src/domain.js";
import { governor } from "./governor.js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
const sdk = client(),
  branch = JSON.parse(
    readFileSync("var/elite/agent-branch.json", "utf8"),
  ).created_branch_id;
const bootstrap = JSON.parse(readFileSync("var/agent-manifest.json", "utf8"));
const lookup = bootstrap.tools.find(
    (t: any) => t.name === "lookup_shipment",
  ).id,
  escalation = bootstrap.tools.find(
    (t: any) => t.name === "request_escalation",
  ).id;
const path = "var/elite/tests.json";
const manifest: Record<string, { id: string; hash: string }> = existsSync(path)
  ? JSON.parse(readFileSync(path, "utf8"))
  : {};
const operation = process.argv[2] || "report";
if (operation === "prepare") {
  await sdk.conversationalAi.agents.update(agentId(), {
    ...enterpriseSettings,
    branchId: branch,
  });
  for (const s of eliteScenarios) {
    const mock =
      s.lookup === "missing"
        ? { found: false, message: "Shipment not found; verify reference." }
        : s.lookup === "error"
          ? { error: "TMS lookup unavailable" }
          : { found: true, shipment: initialState.shipments[0] };
    const definition = {
      type: "simulation" as const,
      name: "HarborVoice Elite · " + s.name,
      simulationScenario: s.scenario,
      simulationMaxTurns: 4,
      successConditions: s.criteria,
      toolMockConfig: {
        mockingStrategy: "selected" as const,
        mockedToolIds: [lookup, escalation],
        fallbackStrategy: "raise_error" as const,
      },
      toolMockOverrides: {
        [lookup]: [
          { mockResult: JSON.stringify(mock), isError: s.lookup === "error" },
        ],
        [escalation]: [
          {
            mockResult: JSON.stringify({
              id: "ESC-REVIEW",
              shipmentId: "HV-2048",
              status: "Pending review",
              reason: "Customer requested operator review.",
            }),
          },
        ],
      },
    };
    const hash = createHash("sha256")
      .update(JSON.stringify(definition))
      .digest("hex");
    if (!manifest[s.id]) {
      const r = await sdk.conversationalAi.tests.create(definition);
      manifest[s.id] = { id: r.id, hash };
    } else if (manifest[s.id].hash !== hash) {
      await sdk.conversationalAi.tests.update(manifest[s.id].id, definition);
      manifest[s.id].hash = hash;
    }
    writeFileSync(path, JSON.stringify(manifest, null, 2), { mode: 0o600 });
  }
  console.log(
    "Prepared " +
      Object.keys(manifest).length +
      " native tests on Enterprise branch.",
  );
}
const invocationPath = "var/elite/evaluation-invocation.json";
if (operation === "run") {
  if (existsSync(invocationPath))
    throw Error("Existing invocation recorded; poll instead of paid retry.");
  if (Object.keys(manifest).length !== 52)
    throw Error("Prepare all 52 tests first.");
  await governor.reserve("enterprise-suite", "agents", 16000);
  await governor.update("enterprise-suite", { status: "pending" });
  try {
    const result = await sdk.conversationalAi.agents.runTests(agentId(), {
      name: "HarborVoice Elite · 52 multilingual enterprise scenarios",
      branchId: branch,
      repeatCount: 1,
      tests: eliteScenarios.map((s) => ({ testId: manifest[s.id].id })),
    });
    writeFileSync(
      invocationPath,
      JSON.stringify(
        { id: result.id, startedAt: new Date().toISOString() },
        null,
        2,
      ),
      { mode: 0o600 },
    );
    await governor.update("enterprise-suite", {
      status: "pending",
      providerIds: [result.id],
    });
    console.log("One bounded 52-case suite started.");
  } catch (e) {
    await governor.update("enterprise-suite", {
      status: "failed",
      note: "Submission failed; inspect provider invocations before retry.",
    });
    throw e;
  }
}
if (existsSync(invocationPath)) {
  const invocation = JSON.parse(readFileSync(invocationPath, "utf8"));
  const r = await sdk.conversationalAi.tests.invocations.get(invocation.id);
  writeFileSync("var/elite/evaluation-raw.json", JSON.stringify(r, null, 2), {
    mode: 0o600,
  });
  const cases = eliteScenarios.map((s) => {
    const run = r.testRuns.find((t) => t.testId === manifest[s.id]?.id);
    return {
      id: s.id,
      name: s.name,
      language: s.language,
      category: s.category,
      status: run?.status || "not executed",
      result: run?.conditionResult?.result || "unknown",
      creditsUsed: run?.creditsUsed ?? null,
      summary:
        run?.conditionResult?.rationale?.summary || "Awaiting provider result",
    };
  });
  const terminal = cases.every((c) =>
    ["passed", "failed", "error"].includes(c.status),
  );
  const credits = cases.reduce((n, c) => n + (c.creditsUsed || 0), 0);
  if (terminal)
    await governor.update("enterprise-suite", {
      status: "completed",
      reportedCredits: credits,
    });
  const report = {
    checkedAt: new Date().toISOString(),
    version: "2.0.0",
    branchId: branch,
    scenarioCount: 52,
    repeatCount: 1,
    maxTurns: 4,
    scope:
      "Real provider text simulations against the isolated Enterprise branch with synthetic business-tool fixtures. No microphone, telephony, production TMS or speech latency measured. Model judgments are bounded and not independent certification.",
    completed: terminal,
    passed: cases.filter((c) => c.status === "passed" && c.result === "success")
      .length,
    providerReportedCredits: credits,
    wallClockSeconds: (Date.now() - Date.parse(invocation.startedAt)) / 1000,
    cases,
  };
  writeFileSync(
    "docs/elite/evaluation.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    JSON.stringify(
      {
        completed: terminal,
        passed: report.passed,
        cases: cases.length,
        credits,
      },
      null,
      2,
    ),
  );
}
