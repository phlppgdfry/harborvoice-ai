import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
const paths = [
  "public/academy",
  "public/elite",
  "public/experience",
  "public/recognition",
];
const files = paths
  .flatMap((dir) => readdirSync(dir).map((name) => dir + "/" + name))
  .filter((path) => /\.(mp3|mp4|m4b|epub|vtt|srt|jpg|png)$/.test(path));
const entries = files.map((path) => {
  const bytes = readFileSync(path);
  return {
    path,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
});
const manifest = "config/assets.json";
if (process.argv.includes("--record")) {
  writeFileSync(
    manifest,
    JSON.stringify(
      {
        version: "2.1.0",
        scope:
          "Project-owned generated and recorded media. Safe copies; no signed URLs. Original source assets remain native. Full render specs and provenance live in docs/elite.",
        files: entries,
      },
      null,
      2,
    ) + "\n",
  );
  console.log("Recorded " + entries.length + " asset hashes.");
} else {
  if (!existsSync(manifest))
    throw Error("No asset registry; explicitly record after review.");
  const expected = JSON.parse(readFileSync(manifest, "utf8")).files;
  for (const asset of expected) {
    const found = entries.find((a) => a.path === asset.path);
    if (!found || found.sha256 !== asset.sha256 || found.bytes !== asset.bytes)
      throw Error("Asset integrity mismatch: " + asset.path);
  }
  if (expected.length !== entries.length)
    throw Error("Unregistered assets require review.");
  console.log("Verified " + entries.length + " asset hashes.");
}
