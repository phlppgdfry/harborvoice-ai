import "../../server/environment.js";
import { client } from "../../server/elevenlabs.js";
import { enterpriseSettings } from "../../agent/enterprise-settings.js";
import { contentHash, projectManaged } from "../../lib/resource-registry.js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const registry = JSON.parse(readFileSync("config/resources.json", "utf8")),
  agent = registry.resources.find((r: any) => r.type === "agent-branch"),
  desired = {
    conversationConfig: enterpriseSettings.conversationConfig,
    platformSettings: enterpriseSettings.platformSettings,
  };
const sdk = client(),
  remote = await sdk.conversationalAi.agents.get(
    process.env.ELEVENLABS_AGENT_ID || "agent_6901m6t6k3tpfnk9n2z3q2h1et7a",
    { branchId: agent.identifier },
  );
const results = [
  {
    resource: agent.displayName,
    status:
      contentHash(projectManaged(remote, desired)) === contentHash(desired)
        ? "IN SYNC"
        : "REMOTE CHANGES",
  },
];
for (const d of registry.resources.filter((r: any) => r.type === "knowledge")) {
  try {
    const text = await sdk.conversationalAi.knowledgeBase.documents.getContent(
      d.identifier,
    );
    results.push({
      resource: d.displayName,
      status:
        contentHash(text.trim()) === d.contentHash
          ? "IN SYNC"
          : "REMOTE CHANGES",
    });
  } catch {
    results.push({ resource: d.displayName, status: "PERMISSION BLOCKED" });
  }
}
mkdirSync("var/elite", { recursive: true });
writeFileSync(
  "var/elite/drift-ci.json",
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      scope:
        "Read-only agent and knowledge checks; no generation or remote writes.",
      results,
    },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify(results, null, 2));
if (results.some((r) => r.status !== "IN SYNC")) process.exitCode = 1;
