#!/usr/bin/env node
import { readFileSync, statSync } from "node:fs";
import {
  inspect,
  diff,
  validate,
  budget,
  report,
  type Config,
  type Report,
  type BudgetPolicy,
} from "./index.js";
try {
  const [command, a, b] = process.argv.slice(2);
  const read = (p: string | undefined): unknown => {
    if (!p) throw Error("A JSON file path is required.");
    if (statSync(p).size > 2_000_000) throw Error("Input exceeds 2 MB.");
    const s = readFileSync(p, "utf8");
    if (Buffer.byteLength(s) > 2_000_000) throw Error("Input exceeds 2 MB.");
    return JSON.parse(s);
  };
  let output: unknown;
  switch (command) {
    case "inspect":
      output = inspect(read(a) as Config);
      break;
    case "diff":
    case "drift":
      output = diff(read(a) as Config, read(b) as Config);
      break;
    case "validate": {
      const f = validate(read(a) as Config);
      output = f;
      if (f.some((x) => x.severity === "high")) process.exitCode = 2;
      break;
    }
    case "budget":
      output = budget(read(a) as BudgetPolicy);
      break;
    case "report": {
      if (b && !["json", "markdown", "html"].includes(b))
        throw Error("Format must be json, markdown or html.");
      process.stdout.write(
        report(
          read(a) as Report,
          (b ?? "json") as "json" | "markdown" | "html",
        ),
      );
      break;
    }
    default:
      throw Error(
        "Usage: agentops inspect|validate config.json; diff|drift before.json after.json; budget policy.json; report evidence.json [json|markdown|html]. Tests use evaluate() with an explicit transport.",
      );
  }
  if (output !== undefined) console.log(JSON.stringify(output, null, 2));
} catch {
  console.error(
    "AgentOps failed: check command, valid JSON, file paths, size and policy. No provider requests were made.",
  );
  process.exitCode = 1;
}
