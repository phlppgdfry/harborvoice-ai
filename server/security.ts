import { createHmac, timingSafeEqual } from "node:crypto";
export function equalSecret(a: string, b: string) {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function verifyWebhook(
  raw: Buffer,
  signature: string,
  secret: string,
  now = Date.now(),
) {
  const pieces = signature.split(",").map((p) => p.trim().split("="));
  const timestamp = pieces.find(([k]) => k === "t")?.[1];
  const signatures = pieces.filter(([k]) => k === "v0").map(([, v]) => v);
  if (
    !timestamp ||
    !/^\d+$/.test(timestamp) ||
    Math.abs(now / 1000 - Number(timestamp)) > 300
  )
    return false;
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.`)
    .update(raw)
    .digest("hex");
  return signatures.some((s) => !!s && equalSecret(s, expected));
}
