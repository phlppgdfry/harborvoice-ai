import "../server/environment.js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { client } from "../server/elevenlabs.js";
const sdk = client();
const ledgerPath = "var/audio-exercises.json";
type Entry = {
  status: string;
  file?: string;
  jobId?: string;
  model?: string;
  note?: string;
  observedAccountCreditDelta?: number;
  sha256?: string;
  durationSeconds?: number;
};
const ledger: Record<string, Entry> = existsSync(ledgerPath)
  ? JSON.parse(readFileSync(ledgerPath, "utf8"))
  : {};
const save = () =>
  writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2), { mode: 0o600 });
const baseline = JSON.parse(readFileSync("var/experience-budget.json", "utf8"));
const inputPath = "public/experience/eleven_v4-1.mp3";
const source = () =>
  new File([readFileSync(inputPath)], "harborvoice-introduction.mp3", {
    type: "audio/mpeg",
  });
const transcript =
  "Welcome to HarborVoice. I'm Nora, your AI terminal assistant. Explore shipment questions, multilingual support and human review, using fictional logistics data. Listen to the examples, or try a short live conversation.";
async function creditCheck(reserve: number) {
  const subscription = await sdk.user.subscription.get();
  if (
    subscription.characterCount - baseline.creditsUsed + reserve >
    baseline.taskBudget - baseline.guestReserve
  )
    throw Error(
      "Task budget protection stopped generation; guest reserve remains untouched.",
    );
  return subscription.characterCount;
}
async function perform(
  name: string,
  model: string,
  reserve: number,
  run: () => Promise<ReadableStream<Uint8Array> | object>,
) {
  if (ledger[name]) {
    console.log(`${name}: ${ledger[name].status} (not repeated)`);
    return;
  }
  const before = await creditCheck(reserve);
  ledger[name] = { status: "started", model };
  save();
  try {
    const result = await run();
    let file: string;
    if (result instanceof ReadableStream) {
      file = `experience/${name}.mp3`;
      const bytes = Buffer.from(await new Response(result).arrayBuffer());
      writeFileSync(`public/${file}`, bytes);
      const duration = Number(
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
      if (!Number.isFinite(duration) || duration <= 0)
        throw Error("Returned audio could not be decoded.");
      ledger[name].sha256 = createHash("sha256").update(bytes).digest("hex");
      ledger[name].durationSeconds = duration;
    } else {
      file = `experience/${name}.json`;
      writeFileSync(`public/${file}`, JSON.stringify(result, null, 2) + "\n");
    }
    ledger[name] = {
      ...ledger[name],
      status: "passed",
      file,
      observedAccountCreditDelta:
        (await sdk.user.subscription.get()).characterCount - before,
    };
  } catch (error) {
    ledger[name].status = "failed";
    ledger[name].note =
      error instanceof Error ? error.message : "Provider error";
  }
  save();
  console.log(JSON.stringify({ operation: name, ...ledger[name] }));
}
const selected = process.argv[2];
if (!selected)
  throw Error(
    "Select exactly one operation: effects-v3, transcribe, align, change, isolate, dubbing, or refresh-dubbing. No suite runs implicitly.",
  );
if (selected === "guest-question")
  await perform("guest-question", "eleven_flash_v2_5", 200, () =>
    sdk.textToSpeech.convert("EXAVITQu4vr4xnSDxMaL", {
      text: "Please look up shipment H V dash two zero four eight. What is its current status?",
      modelId: "eleven_flash_v2_5",
      outputFormat: "mp3_44100_128",
    }),
  );
else if (selected === "effects-v3")
  await perform("effects-v3", "eleven_text_to_sound_v3", 100, () =>
    sdk.textToSoundEffects.convert({
      text: "Two soft rounded glass notification notes, gently ascending, short clean decay, no alarm, no speech.",
      modelId: "eleven_text_to_sound_v3",
      durationSeconds: 2,
    }),
  );
else if (selected === "transcribe")
  await perform("transcribe", "scribe_v1", 500, () =>
    sdk.speechToText.convert({
      file: source(),
      modelId: "scribe_v1",
      diarize: true,
    }),
  );
else if (selected === "align")
  await perform("align", "forced-alignment", 500, () =>
    sdk.forcedAlignment.create({ file: source(), text: transcript }),
  );
else if (selected === "change")
  await perform("change", "eleven_multilingual_sts_v2", 1500, () =>
    sdk.speechToSpeech.convert("Xb7hH8MSUJpSbSDYk0k2", {
      audio: source(),
      modelId: "eleven_multilingual_sts_v2",
      outputFormat: "mp3_44100_128",
    }),
  );
else if (selected === "isolate") {
  const noisy = "var/noisy-introduction.wav";
  if (!existsSync(noisy))
    execFileSync("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      inputPath,
      "-f",
      "lavfi",
      "-i",
      "anoisesrc=color=pink:amplitude=0.035:duration=15",
      "-filter_complex",
      "[0:a][1:a]amix=inputs=2:duration=first:normalize=0",
      "-ar",
      "44100",
      noisy,
    ]);
  await perform("isolate", "audio-isolation", 1500, () =>
    sdk.audioIsolation.convert({
      audio: new File([readFileSync(noisy)], "synthetic-noise-example.wav", {
        type: "audio/wav",
      }),
    }),
  );
  if (ledger.isolate?.status === "passed") {
    execFileSync("ffmpeg", [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      noisy,
      "public/experience/isolate-before.mp3",
    ]);
  }
} else if (selected === "dubbing") {
  if (ledger.dubbing)
    console.log(`dubbing: ${ledger.dubbing.status} (not repeated)`);
  else {
    await creditCheck(3000);
    ledger.dubbing = { status: "started", model: "automatic-dubbing" };
    save();
    try {
      const job = await sdk.dubbing.create({
        file: source(),
        targetLang: "nl",
        sourceLang: "en",
        name: "HarborVoice · Dutch introduction",
        numSpeakers: 1,
        watermark: true,
      });
      ledger.dubbing = {
        ...ledger.dubbing,
        status: "pending",
        jobId: job.dubbingId,
      };
      save();
      console.log("Dubbing job submitted once. Refresh without regenerating.");
    } catch (error) {
      ledger.dubbing.status = "failed";
      ledger.dubbing.note =
        error instanceof Error ? error.message : "Provider error";
      save();
      console.log(ledger.dubbing.note);
    }
  }
} else if (selected === "refresh-dubbing") {
  const entry = ledger.dubbing;
  if (!entry?.jobId) throw Error("No submitted dubbing job.");
  const job = await sdk.dubbing.get(entry.jobId);
  console.log(`Dubbing status: ${job.status}`);
  if (job.status === "dubbed" && entry.status !== "passed") {
    const response = await sdk.dubbing.audio.get(entry.jobId, "nl");
    const bytes = Buffer.from(await new Response(response).arrayBuffer());
    const file = "experience/dubbing.mp3";
    writeFileSync(`public/${file}`, bytes);
    const duration = Number(
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
    if (!Number.isFinite(duration) || duration <= 0)
      throw Error("Dub could not be decoded.");
    ledger.dubbing = {
      ...entry,
      status: "passed",
      file,
      durationSeconds: duration,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
    save();
  } else if (job.status === "failed") {
    entry.status = "failed";
    entry.note = "Provider dubbing failed.";
    save();
  }
} else throw Error("Unknown operation.");
writeFileSync(
  "docs/audio-live-evidence.json",
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      scope:
        "Real SDK requests using a synthetic Eleven v4 introduction; media decoding is technical validation, not a subjective quality score. Account credit deltas may include other activity or delayed billing.",
      operations: Object.entries(ledger)
        .filter(([name]) => name !== "guest-question")
        .map(([name, { jobId, ...entry }]) => ({
          name,
          ...entry,
        })),
    },
    null,
    2,
  ) + "\n",
);
