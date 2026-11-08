import "../../server/environment.js";
import { client } from "../../server/elevenlabs.js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const path = "var/elite/saved-voices.json";
const saved: Record<string, { id: string; name: string }> = existsSync(path)
  ? JSON.parse(readFileSync(path, "utf8"))
  : {};
const previews = JSON.parse(
  readFileSync("var/academy-voice-previews.json", "utf8"),
) as { id: string; index: number }[];
const sdk = client();
for (const p of previews) {
  if (saved[String(p.index)]) continue;
  const name = `HarborVoice · Dutch Training ${p.index}`;
  const existing = (await sdk.voices.getAll()).voices.filter(
    (v) => v.name === name,
  );
  if (existing.length > 1)
    throw Error("Duplicate voice names require manual reconciliation.");
  const voice =
    existing[0] ||
    (await sdk.textToVoice.create({
      voiceName: name,
      voiceDescription:
        "Original fictional warm, clear Dutch female training voice. Designed for HarborVoice; no real person cloned.",
      generatedVoiceId: p.id,
      labels: { language: "nl", use_case: "educational" },
    }));
  saved[String(p.index)] = { id: voice.voiceId, name: voice.name || name };
  writeFileSync(path, JSON.stringify(saved, null, 2), { mode: 0o600 });
  console.log(`Saved training voice ${p.index}.`);
}
writeFileSync(
  "docs/elite/voice-engineering.json",
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      savedVoices: Object.entries(saved).map(([preview, v]) => ({
        preview: Number(preview),
        name: v.name,
        url: `https://elevenlabs.io/app/voice-lab?voiceId=${v.id}`,
        voiceId: v.id,
      })),
      scope:
        "Existing fictional Voice Design previews saved privately with owner authorization. No real voice cloning, public Voice Library publication or production-agent voice replacement.",
    },
    null,
    2,
  ) + "\n",
);
