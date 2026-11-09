import { cpSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
// Offline-only static bundle. No server, credentials, analytics or provider dispatch.
execFileSync(
  process.execPath,
  ["--import", "tsx", "scripts/phase3/benchmark.ts"],
  { stdio: "inherit" },
);
execFileSync(
  process.execPath,
  ["--import", "tsx", "scripts/final-mastery/contracts.ts"],
  { stdio: "inherit" },
);
execFileSync("npm", ["run", "build", "--prefix", "apps/agentproof"], {
  stdio: "inherit",
});
mkdirSync("dist/agentproof", { recursive: true });
cpSync("apps/agentproof/dist", "dist/agentproof", { recursive: true });
console.log("Static AgentProof bundled at /agentproof/.");
