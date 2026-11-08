import { createHash } from "node:crypto";
export type SyncStatus =
  | "IN SYNC"
  | "LOCAL CHANGES"
  | "REMOTE CHANGES"
  | "CONFLICT"
  | "PERMISSION BLOCKED"
  | "MANUAL ACTION REQUIRED"
  | "UNSUPPORTED"
  | "FAILED";
export function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, canonical(v)]),
    );
  return value;
}
export const contentHash = (value: unknown) =>
  createHash("sha256")
    .update(JSON.stringify(canonical(value)))
    .digest("hex");
export function projectManaged(remote: any, desired: any): any {
  if (Array.isArray(desired))
    return Array.isArray(remote)
      ? remote.map((v, i) =>
          i < desired.length ? projectManaged(v, desired[i]) : v,
        )
      : remote;
  if (desired && typeof desired === "object")
    return Object.fromEntries(
      Object.entries(desired)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, projectManaged(remote?.[k], v)]),
    );
  return remote;
}
export function classifyDrift(
  local: string,
  remote: string,
  base?: { local: string; remote: string },
): SyncStatus {
  if (!base) return "MANUAL ACTION REQUIRED";
  const l = local !== base.local,
    r = remote !== base.remote;
  return l && r
    ? "CONFLICT"
    : l
      ? "LOCAL CHANGES"
      : r
        ? "REMOTE CHANGES"
        : "IN SYNC";
}
export function assertSafeApply(
  expected: string | undefined,
  current: string,
  status: SyncStatus,
) {
  if (!expected || expected !== current)
    throw Error(
      "Remote snapshot changed or expected hash missing; preview again.",
    );
  if (status !== "LOCAL CHANGES" && status !== "IN SYNC")
    throw Error(
      "Remote changes require manual reconciliation; no overwrite performed.",
    );
}
