import "../../server/environment.js";
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { governor } from "./governor.js";
const require = createRequire(import.meta.url),
  WebSocket = require("ws");
const reportPath = "docs/elite/realtime-scribe.json";
if (existsSync(reportPath))
  throw Error(
    "A realtime session was already attempted; inspect evidence rather than reconnecting automatically.",
  );
execFileSync("ffmpeg", [
  "-y",
  "-v",
  "error",
  "-i",
  "public/elite/commercial-en.mp3",
  "-t",
  "6",
  "-ac",
  "1",
  "-ar",
  "16000",
  "-f",
  "s16le",
  "var/elite/scribe-input.pcm",
]);
await governor.reserve("realtime-scribe", "transcription", 300);
await governor.update("realtime-scribe", { status: "pending" });
const events: { type: string; elapsedMs: number; text?: string }[] = [],
  started = Date.now();
try {
  await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(
      "wss://api.elevenlabs.io/v1/speech-to-text/realtime?model_id=scribe_v2_realtime&audio_format=pcm_16000&commit_strategy=manual&include_timestamps=true",
      { headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY } },
    );
    const timer = setTimeout(() => {
      ws.close();
      reject(Error("Bounded session timed out after 25 seconds."));
    }, 25000);
    ws.on("message", async (raw: Buffer) => {
      try {
        const d = JSON.parse(raw.toString());
        events.push({
          type: d.message_type,
          elapsedMs: Date.now() - started,
          ...(typeof d.text === "string" ? { text: d.text } : {}),
        });
        if (d.message_type === "session_started") {
          const pcm = readFileSync("var/elite/scribe-input.pcm");
          for (let i = 0; i < pcm.length; i += 32000) {
            if (ws.readyState !== 1) break;
            ws.send(
              JSON.stringify({
                message_type: "input_audio_chunk",
                audio_base_64: pcm.subarray(i, i + 32000).toString("base64"),
                commit: false,
                sample_rate: 16000,
              }),
            );
            await new Promise((r) => setTimeout(r, 1000));
          }
          if (ws.readyState === 1)
            ws.send(
              JSON.stringify({
                message_type: "input_audio_chunk",
                audio_base_64: "",
                commit: true,
                sample_rate: 16000,
              }),
            );
        }
        if (
          d.message_type === "committed_transcript_with_timestamps" ||
          d.message_type === "committed_transcript"
        ) {
          if (d.text) {
            clearTimeout(timer);
            ws.close();
            resolve();
          }
        }
        if (/error/.test(d.message_type)) {
          clearTimeout(timer);
          ws.close();
          reject(Error(String(d.error || d.message_type)));
        }
      } catch (e) {
        clearTimeout(timer);
        ws.close();
        reject(e);
      }
    });
    ws.on("error", (e: Error) => {
      clearTimeout(timer);
      reject(e);
    });
  });
  await governor.update("realtime-scribe", { status: "completed" });
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        status: "VERIFIED LIVE",
        input: "First six seconds of the synthetic English product narration",
        scope:
          "Real Scribe v2 realtime session with recorded PCM streamed at real-time pace, not a human microphone or agent voice conversation.",
        events,
      },
      null,
      2,
    ) + "\n",
  );
  console.log("Realtime Scribe transcription completed.");
} catch (e) {
  await governor.update("realtime-scribe", { status: "failed" });
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        status: "FAILED",
        message: (e as Error).message.replaceAll(
          process.env.ELEVENLABS_API_KEY || "__none__",
          "[redacted]",
        ),
        events,
      },
      null,
      2,
    ) + "\n",
  );
  throw e;
}
