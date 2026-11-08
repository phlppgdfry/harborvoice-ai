import "../../server/environment.js";
import { client, agentId } from "../../server/elevenlabs.js";
import { knowledge } from "../../src/domain.js";
import { contentHash, classifyDrift } from "../../lib/resource-registry.js";
import { governor } from "./governor.js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const registry = JSON.parse(readFileSync("config/resources.json", "utf8")),
  sdk = client();
const plan = [];
for (const source of knowledge) {
  const resource = registry.resources.find(
    (r: any) => r.type === "knowledge" && r.displayName === source.name,
  );
  if (!resource)
    throw Error("Unregistered knowledge source; do not create duplicates.");
  const remote = (
    await sdk.conversationalAi.knowledgeBase.documents.getContent(
      resource.identifier,
    )
  ).trim();
  const localHash = contentHash(source.text.trim()),
    remoteHash = contentHash(remote);
  plan.push({
    id: resource.identifier,
    name: source.name,
    localHash,
    remoteHash,
    status: classifyDrift(localHash, remoteHash, {
      local: resource.contentHash,
      remote: resource.contentHash,
    }),
  });
}
const planHash = contentHash(plan),
  apply = process.argv[2] === "apply";
if (apply) {
  if (process.argv[3] !== planHash)
    throw Error("Expected reviewed knowledge plan hash is required.");
  if (plan.some((p) => ["REMOTE CHANGES", "CONFLICT"].includes(p.status)))
    throw Error(
      "Remote knowledge edits require manual reconciliation; nothing updated.",
    );
  const agent = await sdk.conversationalAi.agents.get(agentId()),
    model = agent.conversationConfig.agent?.prompt?.rag?.embeddingModel;
  for (const change of plan.filter((p) => p.status === "LOCAL CHANGES")) {
    const source = knowledge.find((d) => d.name === change.name)!;
    const key = "knowledge-" + change.id + "-" + change.localHash.slice(0, 12);
    await governor.reserve(key, "knowledge", 1000);
    await governor.update(key, { status: "pending", providerIds: [change.id] });
    try {
      const fresh =
        await sdk.conversationalAi.knowledgeBase.documents.getContent(
          change.id,
        );
      if (contentHash(fresh.trim()) !== change.remoteHash)
        throw Error("Knowledge changed after preview; update refused.");
      await sdk.conversationalAi.knowledgeBase.documents.update(change.id, {
        content: source.text,
      });
      if (model)
        await sdk.conversationalAi.knowledgeBase.document.computeRagIndex(
          change.id,
          { model },
        );
      const actual =
        await sdk.conversationalAi.knowledgeBase.documents.getContent(
          change.id,
        );
      if (contentHash(actual.trim()) !== change.localHash)
        throw Error("Remote content verification failed");
      const indexes = await sdk.conversationalAi.getDocumentRagIndexes(
        change.id,
      );
      const indexed =
        !model ||
        indexes.indexes.some(
          (i) => i.model === model && i.status === "succeeded",
        );
      await governor.update(key, {
        status: indexed ? "completed" : "pending",
        note: indexed
          ? "Content and RAG index verified."
          : "Content verified; inspect index before any paid retry.",
      });
      change.status = indexed ? "IN SYNC" : "MANUAL ACTION REQUIRED";
      if (indexed) {
        const resource = registry.resources.find(
          (r: { identifier: string }) => r.identifier === change.id,
        );
        resource.contentHash = change.localHash;
        resource.currentVersion = change.localHash;
        resource.lastVerifiedSynchronization = new Date().toISOString();
        resource.syncStatus = "IN SYNC";
        writeFileSync(
          "config/resources.json",
          JSON.stringify(registry, null, 2) + "\n",
        );
      }
    } catch (e) {
      await governor.update(key, {
        status: "failed",
        note: "Existing document ID retained. Inspect content/index before retrying.",
      });
      throw e;
    }
  }
}
mkdirSync("var/elite", { recursive: true });
const report = {
  checkedAt: new Date().toISOString(),
  mode: apply ? "apply" : "dry-run",
  planHash,
  scope:
    "Compare actual source/remote text, preserve native IDs and refuse remote edits. Unchanged content triggers no writes or indexing. Changed-source application requires reviewed plan hash and credit reservation. Current execution verified the unchanged path; changed-content update is implemented but not live-exercised.",
  documents: plan,
};
writeFileSync(
  "docs/elite/knowledge-sync.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
