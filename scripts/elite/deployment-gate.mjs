// Public, read-only GitHub check. No credentials are used or logged.
const sha = process.env.VERCEL_GIT_COMMIT_SHA;
if (!sha || !/^[a-f0-9]{40}$/.test(sha))
  throw Error(
    "Production publication requires an exact Git commit and successful Verify workflow.",
  );
const deadline = Date.now() + 8 * 60_000;
while (Date.now() < deadline) {
  const response = await fetch(
    `https://api.github.com/repos/phlppgdfry/harborvoice-ai/actions/runs?head_sha=${sha}&per_page=20`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "harborvoice-deployment-gate",
      },
    },
  );
  if (!response.ok)
    throw Error(
      `Cannot verify CI safely (${response.status}); publication stopped.`,
    );
  const body = await response.json();
  const runs = body.workflow_runs
    .filter(
      (r) => r.name === "Verify" && r.head_sha === sha && r.event === "push",
    )
    .sort((a, b) => b.run_attempt - a.run_attempt || b.id - a.id);
  const run = runs[0];
  if (run?.status === "completed") {
    if (run.conclusion !== "success")
      throw Error("Verify did not pass; publication stopped.");
    console.log(`Verified GitHub CI for ${sha}.`);
    process.exit(0);
  }
  console.log("Waiting for required Verify workflow.");
  await new Promise((resolve) => setTimeout(resolve, 15000));
}
throw Error("CI verification timed out; publication stopped.");
