// Read-only provider audit. No mutations, retries, transcripts or signed URLs.
// Run with Node 24 and an existing server-side ELEVENLABS_API_KEY.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
const directory = "docs/final-excellence";
mkdirSync(directory, { recursive: true });
const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw Error("Existing server-side credential required.");
const select = (value, fields) =>
  Object.fromEntries(
    fields.filter((f) => f in value).map((f) => [f, value[f]]),
  );
async function read(path, project) {
  const response = await fetch(`https://api.elevenlabs.io${path}`, {
    method: "GET",
    headers: { "xi-api-key": key },
    signal: AbortSignal.timeout(30000),
    redirect: "error",
  });
  if (!response.ok) return { path, status: response.status };
  return {
    path,
    status: response.status,
    data: project(await response.json()),
  };
}
const subscription = await read("/v1/user/subscription", (s) => ({
  ...select(s, [
    "tier",
    "status",
    "character_count",
    "character_limit",
    "max_credit_limit_extension",
    "can_extend_character_limit",
    "allowed_to_extend_character_limit",
    "current_overage",
    "next_character_count_reset_unix",
    "billing_period",
    "character_refresh_period",
    "has_open_invoices",
  ]),
  remaining: s.character_limit - s.character_count,
}));
const result = {
  checkedAt: new Date().toISOString(),
  subscription,
  resources: [],
  hosted: [],
  scope:
    "GET only; metadata projections; no per-job cost attribution, full pending-job enumeration or paid dispatch.",
};
for (const [path, project] of [
  [
    "/v1/flows/templates",
    (s) => ({ keys: Object.keys(s), count: (s.templates || []).length }),
  ],
  [
    "/v1/studio/projects",
    (s) => ({
      projects: (s.projects || []).map((p) =>
        select(p, ["project_id", "name", "state"]),
      ),
    }),
  ],
  [
    "/v1/convai/agents?page_size=100",
    (s) => ({
      agents: s.agents.map((a) => select(a, ["agent_id", "name", "archived"])),
      has_more: s.has_more,
    }),
  ],
  [
    "/v1/models",
    (s) =>
      s.map((m) =>
        select(m, [
          "model_id",
          "name",
          "can_do_text_to_speech",
          "can_do_voice_conversion",
        ]),
      ),
  ],
])
  result.resources.push(await read(path, project));
const registry = JSON.parse(readFileSync("config/resources.json", "utf8"));
for (const resource of registry.resources.filter((r) =>
  ["voice", "knowledge"].includes(r.type),
)) {
  const path =
    resource.type === "voice"
      ? `/v1/voices/${resource.identifier}`
      : `/v1/convai/knowledge-base/${resource.identifier}`;
  result.resources.push({
    name: resource.displayName,
    ...(await read(path, () => ({ exists: true }))),
  });
}
for (const path of [
  "/api/status",
  "/api/state",
  "/api/conversations",
  "/api/agents",
]) {
  const response = await fetch(`https://harborvoice-ai.vercel.app${path}`, {
    signal: AbortSignal.timeout(30000),
    redirect: "error",
  });
  const row = {
    path,
    status: response.status,
    cacheControl: response.headers.get("cache-control"),
  };
  if (path === "/api/status" && response.ok) {
    const s = await response.json();
    row.runtime = select(s, [
      "production",
      "workspaceStorage",
      "operatorRequired",
      "operatorAuthenticated",
      "guestEnabled",
      "deployment",
    ]);
  }
  result.hosted.push(row);
}
writeFileSync(
  `${directory}/provider-readonly.json`,
  JSON.stringify(result, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    {
      checkedAt: result.checkedAt,
      subscriptionStatus: subscription.status,
      remaining: subscription.data?.remaining,
      resourceStatuses: result.resources.map((r) => ({
        path: r.path,
        status: r.status,
      })),
      hosted: result.hosted,
    },
    null,
    2,
  ),
);
