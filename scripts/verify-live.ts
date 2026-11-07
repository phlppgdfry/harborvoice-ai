import "../server/environment.js";
import { mkdirSync, writeFileSync } from "node:fs";
import { client, agentId } from "../server/elevenlabs.js";
// Read-only account verification. This does not generate audio or start a conversation.
const sdk = client();
const id = agentId();
const [voices, agent, session] = await Promise.all([
  sdk.voices.getAll(),
  sdk.conversationalAi.agents.get(id),
  sdk.conversationalAi.conversations.getSignedUrl({ agentId: id }),
]);
const sources = agent.conversationConfig.agent?.prompt?.knowledgeBase || [];
const embeddingModel =
  agent.conversationConfig.agent?.prompt?.rag?.embeddingModel;
const indexes = await Promise.all(
  sources.map((source) =>
    sdk.conversationalAi.getDocumentRagIndexes(source.id),
  ),
);
const indexedSources = indexes.filter((result) =>
  result.indexes.some(
    (index) => index.model === embeddingModel && index.status === "succeeded",
  ),
).length;
const report = {
  checkedAt: new Date().toISOString(),
  scope:
    "Read-only live SDK verification; no audio generation or active conversation",
  apiAuthenticated: true,
  voiceCount: voices.voices.length,
  agentName: agent.name,
  knowledgeDocuments:
    agent.conversationConfig.agent?.prompt?.knowledgeBase?.length || 0,
  toolCount: agent.conversationConfig.agent?.prompt?.toolIds?.length || 0,
  indexedKnowledgeDocuments: indexedSources,
  ragEnabled: !!agent.conversationConfig.agent?.prompt?.rag?.enabled,
  authenticatedSessions: !!agent.platformSettings?.auth?.enableAuth,
  signedSessionUrlIssued: !!session.signedUrl,
};
if (
  !report.signedSessionUrlIssued ||
  !report.authenticatedSessions ||
  report.knowledgeDocuments < 4 ||
  report.toolCount < 2 ||
  (report.ragEnabled && indexedSources < sources.length)
)
  throw new Error(
    "Live configuration is incomplete. Check the agent bootstrap manifest and account permissions.",
  );
mkdirSync("var", { recursive: true });
writeFileSync("var/live-verification.json", JSON.stringify(report, null, 2), {
  mode: 0o600,
});
console.log(JSON.stringify(report, null, 2));
