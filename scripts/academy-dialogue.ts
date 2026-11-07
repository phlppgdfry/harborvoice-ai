import "../server/environment.js";
import { writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { client } from "../server/elevenlabs.js";
import { reserve, finish } from "./academy-budget.js";
const file = "academy/review-dialogue.mp3";
if (existsSync(`public/${file}`))
  throw Error(
    "The training dialogue already exists; it will not be regenerated.",
  );
const inputs = [
  {
    voiceId: "JBFqnCBsd6RMkjVDRZzb",
    text: "[curious] My shipment has a customs hold. Can you remove it? I need to collect it today.",
  },
  {
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    text: "[calmly] I understand the urgency. I cannot remove a customs hold or authorise cargo release. In this fictional training scenario, I can prepare a request for an operator to review.",
  },
  {
    voiceId: "JBFqnCBsd6RMkjVDRZzb",
    text: "[questioning] The request says Pending review. Does that mean the cargo is already cleared?",
  },
  {
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    text: "[clearly] No. It means a request is waiting for a human decision. It does not mean clearance, cargo release or a completed phone transfer. A useful assistant explains that difference precisely.",
  },
  {
    voiceId: "JBFqnCBsd6RMkjVDRZzb",
    text: "[thoughtfully] So I should check the recorded status and wait for the authorised human process.",
  },
  {
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    text: "[warmly] Exactly. Honest boundaries are part of a helpful answer. This was a scripted training dialogue using synthetic voices and fictional data, not a live customer call.",
  },
];
await reserve("multi-speaker-dialogue", 1600);
try {
  const stream = await client().textToDialogue.convert({
    inputs,
    modelId: "eleven_v3",
    languageCode: "en",
    outputFormat: "mp3_44100_128",
  });
  writeFileSync(
    `public/${file}`,
    Buffer.from(await new Response(stream).arrayBuffer()),
  );
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
    throw Error("Dialogue audio did not decode.");
  const transcript = inputs.map((input, index) => ({
    speaker: index % 2 ? "Nora" : "Customer",
    text: input.text.replace(/\[[^\]]+\]\s*/g, ""),
  }));
  writeFileSync(
    "public/academy/review-dialogue.json",
    JSON.stringify(transcript, null, 2) + "\n",
  );
  writeFileSync(
    "docs/academy-dialogue-evidence.json",
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        modelId: "eleven_v3",
        file,
        durationSeconds,
        voices: 2,
        turns: inputs.length,
        scope:
          "A real multi-speaker generation of a scripted fictional training scenario; not an agent evaluation or a real customer recording.",
        passed: true,
      },
      null,
      2,
    ) + "\n",
  );
  finish("multi-speaker-dialogue", "completed");
  console.log(JSON.stringify({ completed: true, durationSeconds }));
} catch (error) {
  finish(
    "multi-speaker-dialogue",
    "failed",
    "Inspect failure before attempting another generation.",
  );
  throw error;
}
