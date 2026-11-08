import "../../server/environment.js";
import { client } from "../../server/elevenlabs.js";
import { governor } from "./governor.js";
import { createReadStream, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
const sdk = client();
if (!existsSync("docs/elite/streaming-speech.json")) {
  await governor.reserve("streaming-speech", "voice", 200);
  await governor.update("streaming-speech", { status: "pending" });
  const started = performance.now();
  try {
    const stream = await sdk.textToSpeech.stream("EXAVITQu4vr4xnSDxMaL", {
      text: "HarborVoice checks the recorded information and keeps consequential decisions with people.",
      modelId: "eleven_flash_v2_5",
      outputFormat: "mp3_44100_128",
    });
    const reader = stream.getReader(),
      chunks: Uint8Array[] = [];
    let firstByteMs: number | undefined;
    while (true) {
      const r = await reader.read();
      if (r.done) break;
      if (r.value.length) {
        firstByteMs ??= performance.now() - started;
        chunks.push(r.value);
      }
    }
    writeFileSync("public/elite/streaming-speech.mp3", Buffer.concat(chunks));
    const durationSeconds = Number(
      execFileSync("ffprobe", [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        "public/elite/streaming-speech.mp3",
      ]).toString(),
    );
    writeFileSync(
      "docs/elite/streaming-speech.json",
      JSON.stringify(
        {
          checkedAt: new Date().toISOString(),
          status: "VERIFIED LIVE",
          model: "eleven_flash_v2_5",
          firstByteMs,
          totalRequestMs: performance.now() - started,
          durationSeconds,
          file: "elite/streaming-speech.mp3",
          sampleCount: 1,
          scope:
            "One real HTTP streaming TTS request. First byte includes network/setup overhead; not voice-agent turn latency or a percentile benchmark.",
        },
        null,
        2,
      ) + "\n",
    );
    await governor.update("streaming-speech", { status: "completed" });
  } catch (e) {
    await governor.update("streaming-speech", { status: "failed" });
    throw e;
  }
}
if (!existsSync("docs/elite/diarization.json")) {
  await governor.reserve("dialogue-diarization", "transcription", 500);
  await governor.update("dialogue-diarization", { status: "pending" });
  try {
    const r = await sdk.speechToText.convert({
      file: createReadStream("public/academy/review-dialogue.mp3"),
      modelId: "scribe_v2",
      diarize: true,
      numSpeakers: 2,
    });
    const words = "words" in r ? r.words : [];
    const speakerIds = [
      ...new Set(words?.map((w: any) => w.speakerId).filter(Boolean)),
    ];
    const report = {
      checkedAt: new Date().toISOString(),
      status: "VERIFIED LIVE",
      model: "scribe_v2",
      input: "academy/review-dialogue.mp3",
      scope:
        "Real batch transcription and requested two-speaker diarization of an existing scripted synthetic dialogue. Speaker IDs are model clusters, not verified identities. Human transcript accuracy was not scored.",
      text: "text" in r ? r.text : "",
      speakerIds,
      wordCount: words?.length || 0,
      words,
    };
    writeFileSync(
      "docs/elite/diarization.json",
      JSON.stringify(report, null, 2) + "\n",
    );
    await governor.update("dialogue-diarization", { status: "completed" });
    console.log(
      JSON.stringify({
        speakerClusters: speakerIds.length,
        wordCount: report.wordCount,
      }),
    );
  } catch (e) {
    await governor.update("dialogue-diarization", { status: "failed" });
    throw e;
  }
}
