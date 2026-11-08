import "../../server/environment.js";
import { client } from "../../server/elevenlabs.js";
import { writeFileSync } from "node:fs";
const sdk = client();
const probes = [
  ["voices", () => sdk.voices.getAll()],
  ["models", () => sdk.models.list()],
  ["subscription", () => sdk.user.subscription.get()],
  ["studio", () => sdk.studio.projects.list()],
] as const;
const results = [];
for (const [capability, probe] of probes) {
  try {
    await probe();
    results.push({ capability, status: "VERIFIED LIVE" });
  } catch (e) {
    results.push({
      capability,
      status:
        (e as any).statusCode === 403
          ? "PLAN RESTRICTED"
          : "PERMISSION BLOCKED",
      httpStatus: (e as any).statusCode,
    });
  }
}
writeFileSync(
  "docs/elite/permissions.json",
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      scope:
        "Read-only probes establish these specific operations only. No key permission changes or scope expansion.",
      results,
    },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify(results));
