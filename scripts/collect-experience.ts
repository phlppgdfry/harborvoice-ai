import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
const source = JSON.parse(
  readFileSync("var/creative-downloads.json", "utf8"),
) as {
  flowId: string;
  generations: {
    id: string;
    model: string;
    url: string;
    credits: number;
    duration: number;
    prompt: string;
  }[];
};
mkdirSync("public/experience", { recursive: true });
const takes: Record<string, number> = {};
const assets = [];
for (const generation of source.generations) {
  const take = (takes[generation.model] || 0) + 1;
  takes[generation.model] = take;
  const category = generation.model.includes("music")
    ? "Music"
    : generation.model.includes("sound")
      ? "Sound effects"
      : "Voiceover";
  const filename = `${generation.model}-${take}.mp3`;
  const response = await fetch(generation.url);
  if (!response.ok)
    throw Error(
      `Download failed for ${generation.id}: ${response.status}. Refresh the existing generation, do not regenerate.`,
    );
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 100) throw Error("Audio download was empty.");
  writeFileSync(`public/experience/${filename}`, bytes);
  assets.push({
    id: `${generation.model}-${take}`,
    category,
    model: generation.model,
    take,
    durationSeconds: generation.duration,
    credits: generation.credits,
    file: `experience/${filename}`,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    prompt: generation.prompt,
  });
}
const report = {
  createdAt: new Date().toISOString(),
  flowUrl: `https://elevenlabs.io/app/flows/${source.flowId}`,
  scope:
    "Real account generations. Public playback uses static files and spends no additional ElevenLabs credits.",
  assets,
};
writeFileSync(
  "public/experience/catalog.json",
  JSON.stringify(report, null, 2) + "\n",
);
writeFileSync(
  "docs/creative-evidence.json",
  JSON.stringify(
    { ...report, assets: assets.map(({ prompt, ...asset }) => asset) },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify(
    {
      downloaded: assets.length,
      credits: assets.reduce((sum, a) => sum + a.credits, 0),
      models: Object.keys(takes),
    },
    null,
    2,
  ),
);
