import "../../server/environment.js";
import { client } from "../../server/elevenlabs.js";
import { governor } from "./governor.js";
import {
  createReadStream,
  readFileSync,
  writeFileSync,
  existsSync,
} from "node:fs";
const clips = JSON.parse(readFileSync("public/elite/audio.json", "utf8")).clips;
const time = (seconds: number) => {
  const n = Math.max(0, Math.round(seconds * 1000));
  return `${Math.floor(n / 3600000)
    .toString()
    .padStart(
      2,
      "0",
    )}:${Math.floor(n / 60000) % 60 < 10 ? "0" : ""}${Math.floor(n / 60000) % 60}:${Math.floor(n / 1000) % 60 < 10 ? "0" : ""}${Math.floor(n / 1000) % 60}.${(n % 1000).toString().padStart(3, "0")}`;
};
for (const clip of clips) {
  const base = clip.file.replace(/\.mp3$/, "");
  if (existsSync("public/" + base + ".vtt")) continue;
  const id = "align-" + base.split("/").at(-1);
  await governor.reserve(id, "captions", 150);
  await governor.update(id, { status: "pending" });
  try {
    const r = await client().forcedAlignment.create({
      file: createReadStream("public/" + clip.file),
      text: clip.text,
    });
    const words = r.words || [];
    if (!words.length) throw Error("Alignment returned no words");
    const cues = [];
    for (let i = 0; i < words.length; i += 6) {
      const w = words.slice(i, i + 6);
      cues.push({
        start: w[0].start,
        end: w.at(-1)!.end,
        text: w.map((x: any) => x.text).join(" "),
      });
    }
    writeFileSync(
      "public/" + base + ".vtt",
      "WEBVTT\n\n" +
        cues
          .map((c: any) => `${time(c.start)} --> ${time(c.end)}\n${c.text}`)
          .join("\n\n") +
        "\n",
    );
    writeFileSync(
      "public/" + base + "-alignment.json",
      JSON.stringify(
        {
          scope:
            "Real forced alignment against authored speech script. Timings are model output and require review.",
          words: r.words,
        },
        null,
        2,
      ) + "\n",
    );
    await governor.update(id, { status: "completed" });
    console.log("Aligned " + clip.file);
  } catch (e) {
    await governor.update(id, { status: "failed" });
    throw e;
  }
}
