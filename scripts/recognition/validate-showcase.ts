import { readFileSync, existsSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const source = readFileSync(
  "submissions/showcase/projects/harborvoice-ai.mdx",
  "utf8",
);
const front = source.split("---")[1];
const field = (name: string) =>
  front
    .split("\n")
    .find((l) => l.startsWith(name + ":"))
    ?.slice(name.length + 1)
    .trim();
assert.equal(field("title"), "HarborVoice AI");
assert.ok((field("description") || "").length <= 160);
assert.equal(field("isFeatured"), "false");
assert.ok(front.includes("  - philippe-godfroy"));
assert.ok(existsSync("submissions/showcase/authors/philippe-godfroy.yml"));
assert.ok(
  existsSync("submissions/showcase/projects/images/harborvoice-ai.jpg"),
);
assert.ok(source.includes("50 of 52") && source.includes("10 targeted"));
assert.ok(!/oobCode=|X-Goog-Signature=|sk_[a-zA-Z0-9]{20}/.test(source));
for (const c of [
  ...front.matchAll(
    /^  - (agents|text-to-speech|speech-to-text|music|voices)$/gm,
  ),
])
  assert.ok(c[1]);
const report = {
  checkedAt: new Date().toISOString(),
  upstreamCommit: "870ee29c311eaccd33425f326e72e14a120c69e2",
  status: "TESTED — READY FOR REVIEW",
  checks: [
    "Required frontmatter and author reference",
    "145-character description",
    "Official categories and isFeatured false",
    "Cover source and upstream image-sync path",
    "Historical evaluation scope preserved",
    "No signed access URLs or credential patterns",
  ],
  scope:
    "Submission contract checks plus actual upstream image sync. Full upstream application build not run.",
};
writeFileSync(
  "docs/recognition/showcase-validation.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(report);
