import "../server/environment.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { client, agentId } from "../server/elevenlabs.js";
import { agentSettings } from "../agent/settings.js";
import { scenarios } from "../agent/scenarios.js";
import { initialState } from "../src/domain.js";
const sdk = client(),
  id = agentId();
const bootstrap = JSON.parse(
  readFileSync("var/agent-manifest.json", "utf8"),
) as { tools: { id: string; name: string }[] };
const lookup = bootstrap.tools.find((t) => t.name === "lookup_shipment")!.id,
  escalation = bootstrap.tools.find((t) => t.name === "request_escalation")!.id;
mkdirSync("var", { recursive: true });
const path = "var/agent-tests.json";
const manifest: { tests: Record<string, { id: string; hash: string }> } =
  existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : { tests: {} };
const save = () =>
  writeFileSync(path, JSON.stringify(manifest, null, 2), { mode: 0o600 });
for (const scenario of scenarios) {
  const mock =
    scenario.lookup === "missing"
      ? {
          found: false,
          message:
            "Shipment not found. Ask the caller to verify their reference.",
        }
      : scenario.lookup === "error"
        ? { error: "TMS lookup unavailable" }
        : { found: true, shipment: initialState.shipments[0] };
  const definition = {
    type: "simulation" as const,
    name: `HarborVoice · ${scenario.name}`,
    simulationScenario: scenario.scenario,
    simulationMaxTurns: 4,
    successConditions: scenario.criteria,
    toolMockConfig: {
      mockingStrategy: "selected" as const,
      mockedToolIds: [lookup, escalation],
      fallbackStrategy: "raise_error" as const,
    },
    toolMockOverrides: {
      [lookup]: [
        {
          mockResult: JSON.stringify(mock),
          isError: scenario.lookup === "error",
        },
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
  const old = manifest.tests[scenario.id];
  if (!old) {
    const result = await sdk.conversationalAi.tests.create(definition);
    manifest.tests[scenario.id] = { id: result.id, hash };
    save();
    console.log(`Created test: ${scenario.name}`);
  } else if (old.hash !== hash) {
    await sdk.conversationalAi.tests.update(old.id, definition);
    manifest.tests[scenario.id].hash = hash;
    save();
    console.log(`Updated test: ${scenario.name}`);
  }
}
const existing = await sdk.conversationalAi.agents.get(id);
const attached = [...(existing.platformSettings?.testing?.attachedTests || [])];
for (const value of Object.values(manifest.tests))
  if (!attached.some((t) => t.testId === value.id))
    attached.push({ testId: value.id });
await sdk.conversationalAi.agents.update(id, {
  ...agentSettings,
  platformSettings: {
    ...agentSettings.platformSettings,
    testing: { attachedTests: attached },
  },
});
const verified = await sdk.conversationalAi.agents.get(id);
console.log(
  JSON.stringify(
    {
      updated: true,
      agentName: verified.name,
      languages: Object.keys(verified.conversationConfig.languagePresets || {}),
      attachedTests: verified.platformSettings?.testing?.attachedTests?.length,
      evaluationCriteria:
        verified.platformSettings?.evaluation?.criteria?.length,
      clientTools: verified.conversationConfig.agent?.prompt?.toolIds?.length,
      knowledgeDocuments:
        verified.conversationConfig.agent?.prompt?.knowledgeBase?.length,
    },
    null,
    2,
  ),
);
