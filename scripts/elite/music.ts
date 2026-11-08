import "../../server/environment.js";
import { client } from "../../server/elevenlabs.js";
import { governor } from "./governor.js";
import { writeFileSync, existsSync } from "node:fs";
const file = "public/elite/original-score.mp3";
if (existsSync(file)) throw Error("Score exists; do not regenerate.");
await governor.reserve("original-score", "music", 3000);
await governor.update("original-score", { status: "pending" });
try {
  const audio = await client().music.compose({
    modelId: "music_v2_5",
    musicLengthMs: 90000,
    forceInstrumental: true,
    prompt:
      "Original restrained cinematic electronic score for an enterprise logistics voice-AI film. Muted analog synth pulse at 100 BPM, warm soft bass, delicate ticking percussion and a spacious teal-blue atmospheric texture. First six seconds tense and sparse, warm confident resolution at twelve seconds, measured momentum through sixty seconds, gentle lift toward a clean final cadence at ninety seconds. No vocals, no imitation of any artist, avoid busy lead melodies and leave room for spoken narration.",
  });
  writeFileSync(file, Buffer.from(await new Response(audio).arrayBuffer()));
  await governor.update("original-score", { status: "completed" });
  console.log("Original 90-second score completed.");
} catch (e) {
  await governor.update("original-score", {
    status: "failed",
    note: "Inspect response before any retry.",
  });
  throw e;
}
