export function productionMode() {
  return (
    process.env.APP_MODE === "production" ||
    (process.env.NODE_ENV === "production" && process.env.APP_MODE !== "demo")
  );
}
export function validateRuntime(hosted = false) {
  if (!productionMode()) return;
  if ((process.env.OPERATOR_TOKEN || "").length < 32)
    throw new Error(
      "Production requires an OPERATOR_TOKEN of at least 32 characters.",
    );
  if (!process.env.ELEVENLABS_API_KEY || !process.env.ELEVENLABS_AGENT_ID)
    throw new Error(
      "Production requires ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID.",
    );
  const origin = new URL(process.env.PUBLIC_ORIGIN || "http://invalid");
  if (
    origin.protocol !== "https:" ||
    origin.origin !== process.env.PUBLIC_ORIGIN
  )
    throw new Error(
      "PUBLIC_ORIGIN must be the exact production HTTPS origin (no trailing slash).",
    );
  if (hosted && !process.env.DATABASE_URL)
    throw new Error(
      "Production gateway requires DATABASE_URL; browser storage is not a production database.",
    );
}
