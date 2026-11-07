import "../server/environment.js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { client } from "../server/elevenlabs.js";
type Reservation = {
  allowance: number;
  status: "started" | "completed" | "failed";
  note?: string;
};
const path = "var/academy-reservations.json";
export function reservations(): Record<string, Reservation> {
  return existsSync(path)
    ? JSON.parse(readFileSync(path, "utf8"))
    : {
        "creative-media": { allowance: 2300, status: "started" },
        "voice-design": { allowance: 1000, status: "completed" },
      };
}
export async function reserve(name: string, allowance: number) {
  const current = reservations();
  if (current[name])
    throw Error(
      `${name} was already attempted (${current[name].status}). Inspect existing output; no automatic paid retry.`,
    );
  const baseline = JSON.parse(readFileSync("var/academy-budget.json", "utf8"));
  const used =
    (await client().user.subscription.get()).characterCount -
    baseline.creditsUsed;
  if (
    Object.values(current).reduce((sum, r) => sum + r.allowance, 0) +
      allowance >
      baseline.maximumCredits ||
    used + allowance > baseline.maximumCredits
  )
    throw Error("Academy budget protection stopped this request.");
  current[name] = { allowance, status: "started" };
  writeFileSync(path, JSON.stringify(current, null, 2), { mode: 0o600 });
}
export function finish(
  name: string,
  status: "completed" | "failed",
  note?: string,
) {
  const current = reservations();
  current[name] = { ...current[name], status, ...(note ? { note } : {}) };
  writeFileSync(path, JSON.stringify(current, null, 2), { mode: 0o600 });
}
