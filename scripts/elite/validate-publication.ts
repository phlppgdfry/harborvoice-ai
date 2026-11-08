import "../../server/environment.js";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
const files = execFileSync("git", [
  "ls-files",
  "--cached",
  "--others",
  "--exclude-standard",
  "-z",
])
  .toString()
  .split("\0")
  .filter(Boolean);
const problems = [];
const operator = existsSync("var/hosted-operator.json")
  ? JSON.parse(readFileSync("var/hosted-operator.json", "utf8")).token
  : undefined;
for (const path of files) {
  if (path.startsWith(".env") && path !== ".env.example")
    problems.push(path + ": env file");
  if (!/\.(ts|tsx|js|mjs|json|md|ya?ml|html|css|txt)$/.test(path)) continue;
  const text = readFileSync(path, "utf8");
  if (operator && text.includes(operator))
    problems.push(path + ": operator secret");
  if (/[?&](?:oobCode|X-Amz-Signature|Signature)=/.test(text))
    problems.push(path + ": temporary signed link");
  if (/sk_[a-zA-Z0-9]{28,}/.test(text))
    problems.push(path + ": possible ElevenLabs key");
  for (const name of ["ELEVENLABS_API_KEY", "OPERATOR_TOKEN"]) {
    const value = process.env[name];
    if (value && text.includes(value)) problems.push(path + ": secret value");
  }
}
if (problems.length)
  throw Error("Publication validation failed: " + problems.join(", "));
console.log(
  "Public files checked: " +
    files.length +
    "; no secret-pattern or signed-URL findings.",
);
