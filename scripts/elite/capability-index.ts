import { readFileSync, writeFileSync } from "node:fs";
const research = JSON.parse(
  readFileSync("docs/elite/capability-research.json", "utf8"),
);
const counts: Record<string, number> = {};
for (const c of research.capabilities)
  counts[c.finalStatus] = (counts[c.finalStatus] || 0) + 1;
const lines = [
  "# ElevenLabs capability matrix",
  "",
  `${research.capabilities.length} researched capabilities. All fourteen requested fields, plan restrictions, interface availability and exact coverage notes are preserved in the [machine-readable matrix](capability-research.json). A verified configuration read is not presented as a completed generation.`,
  "",
  "## Status counts",
  "",
  ...Object.entries(counts).map(([s, n]) => `- **${s}**: ${n}`),
  "",
  "## Capability index",
  "",
  "| Official capability | Family | Status | Evidence |",
  "| --- | --- | --- | --- |",
];
for (const c of research.capabilities) {
  const p = c.evidenceLocation,
    target = /^(docs|public|agent|config)\//.test(p) ? "../../" + p : p;
  lines.push(
    `| [${c.officialCapabilityName}](${c.documentationReference}) | ${c.productFamily} | ${c.finalStatus} | [${c.id}](${target}) |`,
  );
}
lines.push(
  "",
  "## Interpretation",
  "",
  "Saved synthetic voices remain private. Studio API allowlisting still applies. Creator-tier Pro-only services remain restricted. Optional unexecuted capabilities are PLANNED, never represented as successes. Native Studio keeps an editable earlier caption revision, while final delivery masters are synchronized as Flow assets. External messages, paid telephony, real voice cloning and LinkedIn were not performed. The final prompt received ten targeted passes, not a second complete52-case run.",
);
writeFileSync("docs/elite/capability-matrix.md", lines.join("\n") + "\n");
console.log(JSON.stringify(counts));
