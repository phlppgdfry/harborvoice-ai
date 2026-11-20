// Anonymous production probe: public routes answer, private routes stay closed.
// No credentials, no writes, no paid calls. Exits 1 on any mismatch.
// Usage: node scripts/ops/check-production.mjs [base-url]
const base = (process.argv[2] ?? "https://harborvoice-ai.vercel.app").replace(
  /\/$/,
  "",
);
const checks = [
  { path: "/", expect: 200 },
  {
    path: "/api/health",
    expect: 200,
    json: (b) => b.status === "ok" && b.database === "reachable",
  },
  { path: "/api/status", expect: 200 },
  { path: "/api/state", expect: 401 },
  { path: "/api/conversations", expect: 401 },
];
const results = [];
for (const check of checks) {
  const started = Date.now();
  let status = 0;
  let ok = false;
  let note = "";
  try {
    const response = await fetch(base + check.path, {
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });
    status = response.status;
    ok = status === check.expect;
    if (ok && check.json) {
      ok = check.json(await response.json());
      if (!ok) note = "unexpected health body";
    }
  } catch (error) {
    note = String(error.message ?? error);
  }
  results.push({
    path: check.path,
    expect: check.expect,
    status,
    ok,
    ms: Date.now() - started,
    ...(note && { note }),
  });
}
const failed = results.filter((r) => !r.ok);
console.log(
  JSON.stringify(
    {
      base,
      checkedAt: new Date().toISOString(),
      allOk: failed.length === 0,
      results,
    },
    null,
    2,
  ),
);
if (failed.length) process.exit(1);
