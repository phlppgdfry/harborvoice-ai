import "../../server/environment.js";
import type { ElevenLabs } from "@elevenlabs/elevenlabs-js";
import { client } from "../../server/elevenlabs.js";
import { governor } from "./governor.js";
import { existsSync, writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
const specs = [
  {
    id: "future-systems",
    title: "Future Systems",
    description:
      "Precise cinematic electronics for product launches: measured momentum, spacious narration bed and a resolved ending.",
    styles: [
      "cinematic electronic instrumental",
      "104 BPM",
      "warm analog bass",
      "muted arpeggios",
      "restrained percussion",
    ],
    sections: [
      "Sparse anticipation and ticking pulse",
      "Confident expanding harmony with precise rhythmic movement",
      "Warm resolved final cadence, complete ending",
    ],
  },
  {
    id: "northern-lights",
    title: "Northern Lights",
    description:
      "Atmospheric premium corporate score: airy textures, delicate piano and a calm luminous resolution.",
    styles: [
      "ambient cinematic instrumental",
      "76 BPM",
      "felt piano",
      "shimmering pads",
      "soft bowed textures",
    ],
    sections: [
      "Airy quiet piano invitation",
      "Wide luminous harmony, delicate evolving textures",
      "Graceful piano resolution with natural sustained tail",
    ],
  },
  {
    id: "human-intelligence",
    title: "Human Intelligence",
    description:
      "Uplifting human-centred technology score: tactile acoustic motion, warm strings and an optimistic finish.",
    styles: [
      "uplifting documentary instrumental",
      "92 BPM",
      "organic acoustic plucks",
      "warm chamber strings",
      "gentle hand percussion",
    ],
    sections: [
      "Intimate hopeful acoustic motif",
      "Collaborative energetic lift, open harmonic movement",
      "Optimistic resolved ending and natural decay",
    ],
  },
];
mkdirSync("public/recognition", { recursive: true });
const receiptFile = "var/recognition/music.json";
const receipts: Record<string, unknown> = existsSync(receiptFile)
  ? JSON.parse(readFileSync(receiptFile, "utf8"))
  : {};
for (const s of specs) {
  const file = `public/recognition/${s.id}.mp3`;
  if (receipts[s.id] || existsSync(file)) continue;
  const key = "music-chunks-" + s.id;
  await governor.reserve(key, "music-collection", 2500);
  await governor.update(key, { status: "pending" });
  try {
    const request: ElevenLabs.BodyComposeMusicV1MusicPost = {
      modelId: "music_v2_5",
      storeForInpainting: true,
      compositionPlan: {
        chunks: s.sections.map((direction, i) => ({
          text: `[${["Opening", "Development", "Resolution"][i]}] {instrumental}`,
          durationMs: 20000,
          positiveStyles: [
            ...s.styles,
            direction,
            "space for narration",
            "professional restrained mix",
          ],
          negativeStyles: ["vocals", "artist imitation", "distorted clipping"],
          contextAdherence: "high",
        })),
      },
    };
    writeFileSync(
      `var/recognition/${s.id}-spec.json`,
      JSON.stringify(request, null, 2),
      { mode: 0o600 },
    );
    const { data, rawResponse } = await client()
      .music.compose(request, { maxRetries: 0 })
      .withRawResponse();
    const requestId =
      rawResponse.headers.get("song-id") ||
      rawResponse.headers.get("request-id") ||
      rawResponse.headers.get("x-request-id");
    if (requestId)
      await governor.update(key, {
        status: "pending",
        providerIds: [requestId],
      });
    const bytes = Buffer.from(await new Response(data).arrayBuffer());
    writeFileSync(file, bytes);
    const duration = Number(
      execFileSync("ffprobe", [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        file,
      ]).toString(),
    );
    if (duration < 55 || duration > 65)
      throw Error("Unexpected music duration; review before retry.");
    const reported = Number(rawResponse.headers.get("character-cost"));
    await governor.update(key, {
      status: "completed",
      ...(reported > 0 ? { reportedCredits: reported } : {}),
    });
    receipts[s.id] = {
      id: s.id,
      title: s.title,
      description: s.description,
      file: `recognition/${s.id}.mp3`,
      durationSeconds: duration,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      model: "music_v2_5",
      method:
        "Three explicit 20-second composed sections; original instrumental, no external audio reference.",
      status: "CREATED",
      marketplace: "NOT SUBMITTED",
      tags: ["cinematic", "technology", "instrumental", ...s.styles.slice(1)],
      checkedAt: new Date().toISOString(),
    };
    console.log(s.title + " completed");
  } catch (e) {
    await governor.update(key, {
      status: "failed",
      note: "No retry: inspect recorded request and provider state.",
    });
    writeFileSync(receiptFile, JSON.stringify(receipts, null, 2), {
      mode: 0o600,
    });
    throw e;
  }
  writeFileSync(receiptFile, JSON.stringify(receipts, null, 2), {
    mode: 0o600,
  });
}
writeFileSync(
  "docs/recognition/music-collection.json",
  JSON.stringify(
    {
      collection: "Cinematic Technology Soundtracks",
      publication: "READY FOR OWNER REVIEW; NOT SUBMITTED",
      tracks: Object.values(receipts),
    },
    null,
    2,
  ) + "\n",
);
