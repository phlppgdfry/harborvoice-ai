import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const matrix = JSON.parse(
  readFileSync("docs/final-mastery/capability-matrix.json", "utf8"),
);
const urls = [
  ...new Set(matrix.capabilities.map((c) => c.officialDocumentation)),
];
const results = [];
let next = 0;
async function worker() {
  while (next < urls.length) {
    const url = urls[next++];
    const parsed = new URL(url);
    if (
      parsed.hostname !== "elevenlabs.io" ||
      !parsed.pathname.startsWith("/docs/")
    ) {
      results.push({ url, status: "outside-documentation-scope" });
      continue;
    }
    try {
      const response = await fetch(url + ".md", {
        signal: AbortSignal.timeout(20000),
      });
      const body = await response.text();
      results.push({
        url,
        fetchedUrl: response.url,
        status: response.status,
        sha256: createHash("sha256").update(body).digest("hex"),
        bytes: Buffer.byteLength(body),
        headings: body
          .split("\n")
          .filter((l) => /^#{1,3} /.test(l))
          .slice(0, 20),
        scope:
          "Current documentation content fetched and indexed; not a provider execution or blanket plan-entitlement confirmation.",
      });
    } catch (error) {
      results.push({ url, status: "request-failed", errorType: error.name });
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
results.sort((a, b) => a.url.localeCompare(b.url));
writeFileSync(
  "docs/final-excellence/documentation-audit.json",
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      capabilityRows: matrix.capabilities.length,
      uniqueUrls: urls.length,
      results,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify(
    {
      capabilities: matrix.capabilities.length,
      urls: urls.length,
      success: results.filter((r) => r.status === 200).length,
      unavailable: results
        .filter((r) => r.status !== 200)
        .map((r) => ({ url: r.url, status: r.status })),
    },
    null,
    2,
  ),
);
