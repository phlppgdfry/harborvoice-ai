import "../../server/environment.js";
import { client, agentId } from "../../server/elevenlabs.js";
import { enterpriseSettings } from "../../agent/enterprise-settings.js";
import { knowledge } from "../../src/domain.js";
import {
  contentHash,
  projectManaged,
  classifyDrift,
  assertSafeApply,
} from "../../lib/resource-registry.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
const sdk = client(),
  command = process.argv[2] || "dry-run";
mkdirSync("var/elite", { recursive: true });
const savedRegistry = JSON.parse(readFileSync("config/resources.json", "utf8"));
const branch = existsSync("var/elite/agent-branch.json")
  ? JSON.parse(readFileSync("var/elite/agent-branch.json", "utf8"))
      .created_branch_id
  : savedRegistry.resources.find((r: any) => r.type === "agent-branch")
      .identifier;
const desired = {
  conversationConfig: enterpriseSettings.conversationConfig,
  platformSettings: enterpriseSettings.platformSettings,
};
const remote = await sdk.conversationalAi.agents.get(agentId(), {
  branchId: branch,
});
const projected = projectManaged(remote, desired),
  localHash = contentHash(desired),
  remoteHash = contentHash(projected);
const basePath = "var/elite/sync-baseline.json";
let base = existsSync(basePath)
  ? JSON.parse(readFileSync(basePath, "utf8"))
  : undefined;
let status = classifyDrift(localHash, remoteHash, base);
if (command === "accept-baseline") {
  if (process.argv[3] !== remoteHash)
    throw Error("Accept baseline requires the exact reviewed remote hash.");
  if (localHash !== remoteHash)
    throw Error(
      "Managed remote settings differ from source. Review before accepting.",
    );
  base = { local: localHash, remote: remoteHash };
  writeFileSync(basePath, JSON.stringify(base, null, 2), { mode: 0o600 });
  status = "IN SYNC";
}
if (command === "apply") {
  assertSafeApply(process.argv[3], remoteHash, status);
  if (status === "LOCAL CHANGES") {
    await sdk.conversationalAi.agents.update(agentId(), {
      ...enterpriseSettings,
      branchId: branch,
    });
    const verified = await sdk.conversationalAi.agents.get(agentId(), {
      branchId: branch,
    });
    const h = contentHash(projectManaged(verified, desired));
    if (h !== localHash)
      throw Error(
        "Update accepted but managed settings differ; inspect remote.",
      );
    base = { local: localHash, remote: h };
    writeFileSync(basePath, JSON.stringify(base, null, 2), { mode: 0o600 });
    status = "IN SYNC";
  }
}
const manifest = existsSync("var/agent-manifest.json")
  ? JSON.parse(readFileSync("var/agent-manifest.json", "utf8"))
  : {
      documents: savedRegistry.resources
        .filter((r: any) => r.type === "knowledge")
        .map((r: any) => ({ id: r.identifier, name: r.displayName })),
    };
const documents = [];
for (const doc of knowledge) {
  const mapped = manifest.documents.find((d: any) => d.name === doc.name);
  if (!mapped) {
    documents.push({ name: doc.name, status: "LOCAL CHANGES" });
    continue;
  }
  try {
    const content =
      await sdk.conversationalAi.knowledgeBase.documents.getContent(mapped.id);
    documents.push({
      name: doc.name,
      id: mapped.id,
      sourceHash: contentHash(doc.text.trim()),
      remoteHash: contentHash(content.trim()),
      status: doc.text.trim() === content.trim() ? "IN SYNC" : "REMOTE CHANGES",
    });
  } catch {
    documents.push({
      name: doc.name,
      id: mapped.id,
      status: "PERMISSION BLOCKED",
    });
  }
}
const report = {
  checkedAt: new Date().toISOString(),
  command,
  agent: {
    id: agentId(),
    branchId: branch,
    status,
    localHash,
    remoteHash,
    source: "agent/enterprise-settings.ts",
  },
  knowledge: documents,
  creative: {
    status: "MANUAL ACTION REQUIRED",
    registry: "config/elite-flows.json",
    reason:
      "Native Flow/Studio edits are preserved. No supported bidirectional project serializer or Creator-tier Templates API.",
  },
  scope:
    "Read-only by default. Apply changes only managed agent fields and requires a reviewed exact remote hash. Knowledge drift is detected from actual content; replacement/indexing is an explicit separate operation. No media generation.",
};
writeFileSync(
  "docs/elite/synchronization.json",
  JSON.stringify(report, null, 2) + "\n",
);
const flows = JSON.parse(readFileSync("config/elite-flows.json", "utf8"));
const voices = JSON.parse(
  readFileSync("docs/elite/voice-engineering.json", "utf8"),
).savedVoices;
const registry = {
  version: "2.0.0",
  verifiedAt: report.checkedAt,
  resources: [
    {
      type: "agent-branch",
      identifier: branch,
      displayName: "Nora Enterprise v2",
      localSourcePath: "agent/enterprise-settings.ts",
      remoteObjectReference: `https://elevenlabs.io/app/agents/${agentId()}`,
      environment: "evaluation",
      currentVersion: remote.versionId,
      contentHash: localHash,
      lastVerifiedSynchronization: report.checkedAt,
      syncDirection: "local-to-remote",
      syncStatus: status,
    },
    ...documents.map((d: any) => ({
      type: "knowledge",
      identifier: d.id,
      displayName: d.name,
      localSourcePath: "src/domain.ts",
      remoteObjectReference: d.id,
      environment: "shared",
      currentVersion: "2.0.0",
      contentHash: d.sourceHash,
      lastVerifiedSynchronization: report.checkedAt,
      syncDirection: "local-to-remote",
      syncStatus: d.status,
    })),
    ...flows.map((f: any) => ({
      type: "flow",
      identifier: f.id,
      displayName: f.name,
      localSourcePath: "config/elite-flows.json",
      remoteObjectReference: f.url,
      environment: "workspace",
      currentVersion: "native editable",
      lastVerifiedSynchronization: report.checkedAt,
      syncDirection: "manual-native-to-registry",
      syncStatus: "MANUAL ACTION REQUIRED",
    })),
    ...voices.map((v: any) => ({
      type: "voice",
      identifier: v.voiceId,
      displayName: v.name,
      localSourcePath: "docs/elite/voice-engineering.json",
      remoteObjectReference: v.url,
      environment: "private workspace",
      currentVersion: "saved Voice Design",
      lastVerifiedSynchronization: report.checkedAt,
      syncDirection: "remote-to-registry",
      syncStatus: "IN SYNC",
    })),
  ],
};
writeFileSync(
  "config/resources.json",
  JSON.stringify(registry, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
