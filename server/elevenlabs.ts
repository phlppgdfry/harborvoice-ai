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
export async function attachKnowledge(name: string, text: string) {
  const sdk = client();
  const id = agentId();
  const document =
    await sdk.conversationalAi.knowledgeBase.documents.createFromText({
      name,
      text,
    });
  try {
    const agent = await sdk.conversationalAi.agents.get(id);
    await sdk.conversationalAi.agents.update(id, {
      conversationConfig: {
        agent: {
          prompt: {
            knowledgeBase: [
              ...(agent.conversationConfig.agent?.prompt?.knowledgeBase || []),
              { type: "text", name, id: document.id, usageMode: "auto" },
            ],
          },
        },
      },
    });
  } catch {
    throw new Error(
      `Document ${document.id} was created but could not be attached. Attach it manually in ElevenLabs; do not upload it again.`,
    );
  }
  return document;
}
