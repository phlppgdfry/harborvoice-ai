import { readFileSync } from "node:fs";
/** Explicit production code file wins over ambient preview configuration. Never log its value. */
export function loadOperatorCode(env: NodeJS.ProcessEnv = process.env) {
  const code = env.HARBORVOICE_OPERATOR_CODE_FILE
    ? readFileSync(env.HARBORVOICE_OPERATOR_CODE_FILE, "utf8").trim()
    : (env.OPERATOR_TOKEN || "").trim();
  if (
    code.length < 32 ||
    code.length > 300 ||
    /[\r\n]/.test(code) ||
    code.startsWith("OPERATOR_TOKEN=")
  )
    throw Error(
      "Configure a 32–300 character operator code. HARBORVOICE_OPERATOR_CODE_FILE must contain only the raw code; use HARBORVOICE_SMOKE_ENV for dotenv configuration. No code was sent.",
    );
  return code;
}
