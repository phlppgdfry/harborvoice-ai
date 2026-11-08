import "../../server/environment.js";
import { client } from "../../server/elevenlabs.js";
import { governor } from "./governor.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
const sdk = client();
mkdirSync("public/elite", { recursive: true });
const voices = JSON.parse(readFileSync("var/elite/saved-voices.json", "utf8"));
const specs = [
  {
    id: "commercial-en",
    language: "en",
    voice: "JBFqnCBsd6RMkjVDRZzb",
    text: "A shipment is waiting. A customer needs an answer. And a guess is not good enough. Meet HarborVoice. Nora checks fictional shipment data, explains what is known, and keeps human decisions with people. Across languages. With explicit tools, tested boundaries, and a clear path to review. Explore the voice agent. Hear the evidence. Build trust into the conversation.",
  },
  {
    id: "commercial-nl",
    language: "nl",
    voice: voices["1"].id,
    text: "Een zending wacht. Een klant wil duidelijkheid. En een gok is niet genoeg. Maak kennis met HarborVoice. Nora controleert fictieve zendingsgegevens, legt uit wat bekend is en laat menselijke beslissingen bij mensen. In meerdere talen. Met gerichte tools, geteste grenzen en een duidelijk verzoek om beoordeling. Probeer de spraakassistent. Beluister de voorbeelden. Bouw vertrouwen in elk gesprek.",
  },
  {
    id: "commercial-fr",
    language: "fr",
    voice: "EXAVITQu4vr4xnSDxMaL",
    text: "Un envoi attend. Un client veut une réponse. Et une supposition ne suffit pas. Découvrez HarborVoice. Nora consulte des données fictives, explique ce qui est connu et laisse les décisions humaines aux personnes. Dans plusieurs langues. Avec des outils précis, des limites testées et une demande de vérification claire. Explorez l'assistante vocale. Écoutez les exemples. Construisez la confiance dans chaque échange.",
  },
  {
    id: "explainer-en",
    language: "en",
    voice: "JBFqnCBsd6RMkjVDRZzb",
    text: "Every useful voice AI project starts with a business question. In HarborVoice, that question is simple: where is my shipment? The terminal and its records are fictional. The engineering boundaries are real. Nora asks for an exact reference, then calls the shipment lookup tool. A recorded customs hold stays a customs hold. An estimated arrival stays an estimate. The knowledge base explains published procedures, while tool results provide the shipment facts. If a lookup fails, Nora must say so. If the customer needs help, the assistant prepares a request for human review. Pending review does not mean approved, transferred or released. The public visitor agent has a separate, read-only tool and a bounded trial window. The engineering workspace adds versioned scenarios, provider simulations and explicit failure cases. These results describe the tests that were run; they do not promise perfect future conversations. Explore the working demonstration, inspect the source and compare the evidence. HarborVoice brings voice, knowledge and human control into one transparent workflow.",
  },
  {
    id: "briefing-en",
    language: "en",
    voice: "EXAVITQu4vr4xnSDxMaL",
    text: "HarborVoice operations briefing. This is a fictional training example. Shipment HV two zero four eight has a recorded customs hold. The assistant can report the record and explain the published procedure. It cannot remove the hold. If a customer requests help, create a pending review request with the exact reference and a concrete reason. Check the tool result before describing its outcome. Never turn a proposed action into a completed one. Before demonstrating the system, verify the knowledge index, test the failure path and confirm the account budget. Good automation makes the next decision clearer.",
  },
];
const path = "var/elite/audio-receipts.json";
const receipts: Record<string, unknown> = existsSync(path)
  ? JSON.parse(readFileSync(path, "utf8"))
  : {};
for (const spec of specs) {
  if (receipts[spec.id]) continue;
  const key = "audio-" + spec.id;
  await governor.reserve(key, "voice", Math.ceil(spec.text.length * 1.1) + 100);
  receipts[spec.id] = { status: "pending" };
  writeFileSync(path, JSON.stringify(receipts, null, 2), { mode: 0o600 });
  await governor.update(key, { status: "pending" });
  try {
    const stream = await sdk.textToSpeech.convert(spec.voice, {
      text: spec.text,
      modelId: "eleven_v4",
      languageCode: spec.language,
      outputFormat: "mp3_44100_128",
    });
    const bytes = Buffer.from(await new Response(stream).arrayBuffer());
    const file = `elite/${spec.id}.mp3`;
    writeFileSync("public/" + file, bytes);
    const duration = Number(
      execFileSync("ffprobe", [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        "public/" + file,
      ]).toString(),
    );
    if (!(duration > 0)) throw Error("Audio invalid");
    receipts[spec.id] = {
      status: "completed",
      file,
      language: spec.language,
      text: spec.text,
      model: "eleven_v4",
      durationSeconds: duration,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
    await governor.update(key, { status: "completed" });
    console.log(spec.id + " completed");
  } catch (e) {
    await governor.update(key, {
      status: "failed",
      note: "Inspect private receipt; no retry.",
    });
    receipts[spec.id] = { status: "failed", message: (e as Error).message };
  }
  writeFileSync(path, JSON.stringify(receipts, null, 2), { mode: 0o600 });
}
writeFileSync(
  "public/elite/audio.json",
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      scope:
        "Real synthetic speech; scripts are authored localization, not automated dubbing. Native dubbing evidence is reported separately.",
      clips: Object.values(receipts),
    },
    null,
    2,
  ) + "\n",
);
