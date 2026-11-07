export const guestMaxDurationSeconds = 60;
export const guestDailyLimit = 2;
export function guestPolicy(now = Date.now()) {
  const expiresAt = process.env.GUEST_VOICE_EXPIRES_AT || "";
  const expires = Date.parse(expiresAt);
  return {
    enabled:
      !!process.env.ELEVENLABS_GUEST_AGENT_ID &&
      Number.isFinite(expires) &&
      now < expires,
    expiresAt: Number.isFinite(expires) ? expiresAt : null,
    maxDurationSeconds: guestMaxDurationSeconds,
    dailyLimit: guestDailyLimit,
  };
}
