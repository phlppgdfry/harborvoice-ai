import { createHmac, randomBytes } from "node:crypto";
import { equalSecret } from "./security.js";
const lifetime = 8 * 60 * 60;
export const rememberedLifetime = 30 * 24 * 60 * 60;
export function issueOperatorSession(
  secret: string,
  now = Date.now(),
  remember = false,
) {
  const expires =
    Math.floor(now / 1000) + (remember ? rememberedLifetime : lifetime);
  const nonce = randomBytes(24).toString("hex");
  const signature = createHmac("sha256", secret)
    .update(`harborvoice-session:${expires}:${nonce}`)
    .digest("hex");
  return `${expires}.${nonce}.${signature}`;
}
export function validOperatorSession(
  cookie: string | undefined,
  secret: string,
  now = Date.now(),
) {
  const raw = cookie
    ?.split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith("hv_operator="))
    ?.slice("hv_operator=".length);
  if (!raw) return false;
  const [expiry, nonce, signature, ...rest] = raw.split(".");
  if (
    rest.length ||
    !/^\d+$/.test(expiry) ||
    !/^[a-f0-9]{48}$/.test(nonce || "") ||
    !signature
  )
    return false;
  const expires = Number(expiry),
    current = Math.floor(now / 1000);
  if (expires <= current || expires > current + rememberedLifetime + 30)
    return false;
  const expected = createHmac("sha256", secret)
    .update(`harborvoice-session:${expires}:${nonce}`)
    .digest("hex");
  return equalSecret(signature, expected);
}
export function isOperator(
  headers: { authorization?: string; cookie?: string },
  secret: string | undefined,
) {
  return (
    !secret ||
    equalSecret(headers.authorization || "", `Bearer ${secret}`) ||
    validOperatorSession(headers.cookie, secret)
  );
}
