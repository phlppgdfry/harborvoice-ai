import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
export function client() {
  if (!process.env.ELEVENLABS_API_KEY)
    throw new Error(
      "Configure ELEVENLABS_API_KEY on the server to use this feature.",
    );
  return new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
    timeoutInSeconds: 90,
    maxRetries: 0,
  });
}
export function agentId() {
  const id = process.env.ELEVENLABS_AGENT_ID;
  if (!id)
    throw new Error("Configure ELEVENLABS_AGENT_ID on the server first.");
  return id;
}
// Serialize read/append/update per agent so concurrent uploads cannot discard attachments.
const attachments = new Map<string, Promise<void>>();
export async function attachKnowledge(
  name: string,
  text: string,
  sdk = client(),
) {
  const id = agentId();
  const document =
    await sdk.conversationalAi.knowledgeBase.documents.createFromText({
      name,
      text,
    });
  const previous = attachments.get(id) || Promise.resolve();
  let rag:
    | {
        enabled?: boolean;
        embeddingModel?:
          "e5_mistral_7b_instruct" | "multilingual_e5_large_instruct";
      }
    | undefined;
  const update = previous
    .catch(() => {})
    .then(async () => {
      const agent = await sdk.conversationalAi.agents.get(id);
      rag = agent.conversationConfig.agent?.prompt?.rag;
      await sdk.conversationalAi.agents.update(id, {
        conversationConfig: {
          agent: {
            prompt: {
              knowledgeBase: [
                ...(agent.conversationConfig.agent?.prompt?.knowledgeBase ||
                  []),
                { type: "text", name, id: document.id, usageMode: "auto" },
              ],
            },
          },
        },
      });
    });
  attachments.set(id, update);
  try {
    await update;
  } catch {
    throw new Error(
      `Document ${document.id} was created but could not be attached. Attach it manually in ElevenLabs; do not upload it again.`,
    );
  } finally {
    if (attachments.get(id) === update) attachments.delete(id);
  }
  if (rag?.enabled && rag.embeddingModel) {
    try {
      await sdk.conversationalAi.knowledgeBase.document.computeRagIndex(
        document.id,
        { model: rag.embeddingModel },
      );
    } catch {
      throw new Error(
        `Document ${document.id} is attached, but RAG indexing failed. Retry indexing in ElevenLabs; do not upload it again.`,
      );
    }
  }
  return document;
}
