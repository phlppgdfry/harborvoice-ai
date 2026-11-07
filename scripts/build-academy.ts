import "../server/environment.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { courses } from "../agent/academy-content.js";
import { client } from "../server/elevenlabs.js";
import { reserve, finish, reservations } from "./academy-budget.js";
const sdk = client(),
  voiceId = "EXAVITQu4vr4xnSDxMaL";
mkdirSync("public/academy", { recursive: true });
type Receipt = {
  status: string;
  durationSeconds?: number;
  file?: string;
  sha256?: string;
  note?: string;
};
const path = "var/academy-audio.json";
const receipts: Record<string, Receipt> = existsSync(path)
  ? JSON.parse(readFileSync(path, "utf8"))
  : {};
const save = () =>
  writeFileSync(path, JSON.stringify(receipts, null, 2), { mode: 0o600 });
const run = process.argv.includes("--run");
for (const course of courses)
  for (const lesson of course.lessons) {
    const id = `${course.language}-${lesson.id}`;
    writeFileSync(
      `public/academy/${id}.txt`,
      lesson.title + "\n\n" + lesson.text + "\n",
    );
    if (!run || receipts[id]) continue;
    await reserve(id, Math.ceil(lesson.text.length * 1.05) + 20);
    receipts[id] = { status: "started" };
    save();
    try {
      const stream = await sdk.textToSpeech.convert(voiceId, {
        text: lesson.text,
        modelId: "eleven_v4",
        languageCode: course.language,
        outputFormat: "mp3_44100_128",
      });
      const bytes = Buffer.from(await new Response(stream).arrayBuffer());
      const file = `academy/${id}.mp3`;
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
        throw Error("Audio did not decode.");
      receipts[id] = {
        status: "completed",
        durationSeconds,
        file,
        sha256: createHash("sha256").update(bytes).digest("hex"),
      };
      finish(id, "completed");
    } catch (error) {
      receipts[id] = {
        status: "failed",
        note: error instanceof Error ? error.message : "Provider error",
      };
      finish(id, "failed", "See private receipt; no automatic retry.");
    }
    save();
    console.log(`${id}: ${receipts[id].status}`);
  }
const catalog = {
  generatedAt: new Date().toISOString(),
  title: "HarborVoice Academy",
  scope:
    "Independent practice using fictional logistics data. Audio generated with Eleven v4. Quiz progress is local to this browser and is not a certification.",
  courses: courses.map((course) => ({
    ...course,
    lessons: course.lessons.map((lesson) => ({
      ...lesson,
      audio: receipts[`${course.language}-${lesson.id}`] || {
        status: "not-generated",
      },
    })),
  })),
};
writeFileSync(
  "public/academy/catalog.json",
  JSON.stringify(catalog, null, 2) + "\n",
);
writeFileSync(
  "docs/academy-audio-evidence.json",
  JSON.stringify(
    {
      generatedAt: catalog.generatedAt,
      model: "eleven_v4",
      scope:
        "One real API generation per completed lesson. Media metadata decoded; linguistic and subjective audio quality were not independently scored.",
      lessons: Object.entries(receipts).map(([id, value]) => ({
        id,
        ...value,
      })),
      reservedCredits: Object.values(reservations()).reduce(
        (sum, r) => sum + r.allowance,
        0,
      ),
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify({
    completed: Object.values(receipts).filter((r) => r.status === "completed")
      .length,
    failed: Object.values(receipts).filter((r) => r.status === "failed").length,
  }),
);
