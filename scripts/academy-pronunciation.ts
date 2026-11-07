import "../server/environment.js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { client } from "../server/elevenlabs.js";
import { reserve, finish } from "./academy-budget.js";
const sdk = client(),
  manifest = JSON.parse(readFileSync("var/academy-resources.json", "utf8"));
if (!manifest.dictionary)
  throw Error("Create the project pronunciation dictionary first.");
if (existsSync("docs/academy-pronunciation-evidence.json"))
  throw Error("The comparison already exists and will not be regenerated.");
const text =
  "In this fictional exercise, check the ETA in the TMS for shipment HV-2048. An estimated arrival is not a guarantee. If the lookup fails, explain the limitation and ask an operator to review the request.";
await reserve("pronunciation-comparison", 900);
const samples = [];
try {
  for (const aliases of [false, true]) {
    const id = aliases ? "pronunciation-aliases" : "pronunciation-original",
      file = `academy/${id}.mp3`;
    const stream = await sdk.textToSpeech.convert("EXAVITQu4vr4xnSDxMaL", {
      text,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
      ...(aliases
        ? {
            pronunciationDictionaryLocators: [
              {
                pronunciationDictionaryId: manifest.dictionary.id,
                versionId: manifest.dictionary.versionId,
              },
            ],
          }
        : {}),
    });
    const bytes = Buffer.from(await new Response(stream).arrayBuffer());
    writeFileSync(`public/${file}`, bytes);
    const durationSeconds = Number(
      execFileSync("ffprobe", [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        `public/${file}`,
      ]).toString(),
    );
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0)
      throw Error("Comparison media did not decode.");
    const transcript = await sdk.speechToText.convert({
      file: new File([bytes], `${id}.mp3`, { type: "audio/mpeg" }),
      modelId: "scribe_v1",
    });
    samples.push({
      aliases,
      file,
      durationSeconds,
      transcript: transcript.text,
    });
  }
  const report = {
    checkedAt: new Date().toISOString(),
    modelId: "eleven_multilingual_v2",
    text,
    scope:
      "Two real generations of the same short synthetic script, without and with the project dictionary, then real Scribe transcription. Transcription is model output, not an independent pronunciation quality assessment.",
    samples,
    aliasExpansionObserved: /transport management system/i.test(
      samples[1].transcript,
    ),
    completed: true,
  };
  writeFileSync(
    "docs/academy-pronunciation-evidence.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  finish("pronunciation-comparison", "completed");
  console.log(
    JSON.stringify({
      completed: true,
      aliasExpansionObserved: report.aliasExpansionObserved,
    }),
  );
} catch (error) {
  finish(
    "pronunciation-comparison",
    "failed",
    "Do not automatically regenerate a partly completed comparison.",
  );
  throw error;
}
