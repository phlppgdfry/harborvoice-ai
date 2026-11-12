// Checks the deployed Learn pages over HTTP and writes a dated receipt.
// Usage: node scripts/creative-community/verify-live.mjs [output.json]
import { writeFileSync } from "node:fs";

const base = "https://phlppgdfry.github.io/harborvoice-ai/";
const targets = [
  ["learn/", "Learn to build voice agents you can check"],
  ["learn/reliable-voice-agents.html", "Tools, Grounding and Human Approval"],
  ["learn/testing-voice-agents.html", "AgentProof and AgentOps Kit"],
  ["learn/narrated-product-film-flow.html", "A narrated product film"],
  ["learn/workshop.html", "Build Reliable Multilingual Voice AI Agents"],
  ["learn/learn.css", null],
  ["learn/learn.js", null],
  ["learn/img/agentproof-desktop.jpg", null],
  ["learn/img/flow-before.jpg", null],
  ["learn/img/flow-after.jpg", null],
  ["learn/media/product-film-example.mp4", null],
  ["learn/media/product-film-voice-over.mp3", null],
  ["learn/media/demo-footage.mp4", null],
  ["", null],
  ["agentproof/", null],
  ["build-info.json", null],
];
const results = [];
for (const [path, expectText] of targets) {
  const response = await fetch(base + path, { redirect: "follow" });
  const body = Buffer.from(await response.arrayBuffer());
  const entry = {
    url: base + path,
    status: response.status,
    contentType: response.headers.get("content-type"),
    bytes: body.length,
  };
  if (expectText)
    entry.containsTitle = body.toString("utf8").includes(expectText);
  if (path === "build-info.json")
    entry.build = JSON.parse(body.toString("utf8"));
  results.push(entry);
}
const failed = results.filter(
  (r) => r.status !== 200 || r.containsTitle === false,
);
const receipt = {
  checkedAt: new Date().toISOString(),
  allOk: failed.length === 0,
  results,
};
if (process.argv[2])
  writeFileSync(process.argv[2], JSON.stringify(receipt, null, 2) + "\n");
console.log(
  JSON.stringify(
    { checkedAt: receipt.checkedAt, allOk: receipt.allOk, failed },
    null,
    2,
  ),
);
process.exit(failed.length ? 1 : 0);
