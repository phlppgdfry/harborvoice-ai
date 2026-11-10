import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { config as load } from "dotenv";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { client } from "../server/elevenlabs.js";
load({
  path: [
    ".env.operator.local",
    ".env.development.local",
    process.env.HARBORVOICE_SMOKE_ENV || ".env.smoke.local",
    ".env",
  ],
  quiet: true,
});
const base = process.env.HOSTED_URL;
if (!base?.startsWith("https://"))
  throw Error("Set HOSTED_URL to the exact candidate HTTPS origin.");
const token = process.env.OPERATOR_TOKEN;
if (!token || token.length < 32)
  throw Error("Configure the candidate operator secret privately.");
const live = process.argv.includes("--live"),
  marker = "var/production-live-attempt.json";
if (live && existsSync(marker))
  throw Error(
    "Live call already attempted; inspect evidence rather than retrying.",
  );
mkdirSync("var", { recursive: true });
const args = [
  "--use-fake-ui-for-media-stream",
  "--use-fake-device-for-media-stream",
];
let before: number | undefined;
if (live) {
  const subscription = await client().user.subscription.get();
  if (subscription.characterLimit - subscription.characterCount < 1000)
    throw Error("Insufficient included credits; no call started.");
  before = subscription.characterCount;
  execFileSync("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    "public/experience/guest-question.mp3",
    "-af",
    "adelay=7000:all=1,apad=whole_dur=30",
    "-ar",
    "44100",
    "-ac",
    "1",
    "-c:a",
    "pcm_s16le",
    "var/production-input.wav",
  ]);
  args.push(
    `--use-file-for-fake-audio-capture=${resolve("var/production-input.wav")}`,
  );
}
const browser = await chromium.launch({
  headless: true,
  channel: process.env.BROWSER_CHANNEL || "chrome",
  args,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  permissions: ["microphone"],
});
const page = await context.newPage();
page.setDefaultTimeout(20000);
const origin = new URL(base).origin;
await page.route(`${origin}/**`, async (route) => {
  const headers = { ...route.request().headers() };
  if (process.env.VERCEL_OIDC_TOKEN)
    headers["x-vercel-trusted-oidc-idp-token"] = process.env.VERCEL_OIDC_TOKEN;
  await route.continue({ headers });
});
const checks: string[] = [],
  errors: string[] = [];
let audioFrames = 0,
  timer: ReturnType<typeof setTimeout> | undefined;
page.on("pageerror", (e) => errors.push(e.message));
page.on("websocket", (socket) =>
  socket.on("framereceived", (frame) => {
    try {
      if (JSON.parse(frame.payload.toString()).type === "audio") audioFrames++;
    } catch {
      /* non-JSON transport frame */
    }
  }),
);
const api = (path: string, method = "GET", body?: unknown) =>
  page.evaluate(
    async ({ path, method, body }) => {
      const r = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      return {
        status: r.status,
        data: r.status === 204 ? null : await r.json(),
      };
    },
    { path: `/api${path}`, method, body },
  );
try {
  await page.goto(base + "/#settings");
  await page.getByLabel("Operator access code", { exact: true }).fill(token);
  assert.equal((await api("/state")).status, 401);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByRole("button", { name: "Sign out", exact: true }).waitFor();
  const cookie = (await context.cookies()).find(
    (c) => c.name === "hv_operator",
  );
  assert.ok(cookie?.secure && cookie.httpOnly && cookie.sameSite === "Strict");
  checks.push(
    "HTTPS operator sign-in; secure HttpOnly Strict cookie; anonymous workspace denied",
  );
  const health = await api("/health"),
    status = await api("/status"),
    readiness = await api("/readiness");
  assert.equal(health.data.database, "reachable");
  assert.equal(status.data.workspaceStorage, "postgres");
  assert.equal(status.data.production, true);
  assert.equal(status.data.demoEnabled, false);
  assert.equal(readiness.status, 200);
  assert.equal(readiness.data.agent.status, "available");
  assert.equal((await api("/demo/chat", "POST", {})).status, 409);
  checks.push(
    "Real remote PostgreSQL and authenticated ElevenLabs agent readiness; production demo rejected",
  );
  await page
    .getByRole("button", { name: "Verify ElevenLabs connection", exact: true })
    .click();
  await page
    .getByText(
      "Database and authenticated agent verified. No conversation was started.",
      { exact: true },
    )
    .waitFor();
  await page.screenshot({
    path: "var/production-settings.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Voice agents", exact: true }).click();
  await page.getByRole("combobox", { name: "Voice agent" }).waitFor();
  checks.push(
    "Real configured-agent selection and read-only provider verification render",
  );
  if (live) {
    writeFileSync(
      marker,
      JSON.stringify({
        at: new Date().toISOString(),
        origin,
        maximumSeconds: 30,
      }),
      { mode: 0o600 },
    );
    timer = setTimeout(() => {
      void context.close();
    }, 29500);
    await page
      .getByRole("button", { name: "Start live voice", exact: true })
      .click();
    await page
      .getByText("You are speaking with an AI assistant.", { exact: true })
      .waitFor({ timeout: 10000 });
    await page
      .locator(".transcript .message.user")
      .first()
      .waitFor({ timeout: 15000 });
    await page
      .locator(".transcript .message.agent p")
      .filter({ hasText: /customs.*hold|held.*customs/i })
      .first()
      .waitFor({ timeout: 8000 });
    const saved = page.waitForResponse(
      (r) =>
        new URL(r.url()).pathname === "/api/sessions" &&
        r.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "End voice session", exact: true })
      .click();
    assert.equal((await saved).status(), 200);
    clearTimeout(timer);
    await page
      .getByRole("button", { name: "Start live voice", exact: true })
      .waitFor();
    assert.ok(audioFrames > 0);
    checks.push(
      "One real capped WebSocket call: synthetic microphone ASR, grounded answer and incoming audio",
    );
    const history = await api("/conversations");
    assert.ok(
      history.data.conversations.some(
        (s: { mode: string; providerConversationId?: string }) =>
          s.mode === "live" && s.providerConversationId,
      ),
    );
    await page.reload();
    assert.equal((await api("/conversations")).status, 200);
    checks.push(
      "Live conversation metadata persisted through real API and survives refresh",
    );
    await page.screenshot({ path: "var/production-voice.png", fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  checks.push("Hosted mobile view has no horizontal overflow");
  await page.goto(base + "/#settings");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.getByLabel("Operator access code", { exact: true }).waitFor();
  assert.equal((await api("/state")).status, 401);
  checks.push("Hosted logout denies subsequent workspace access");
  assert.deepEqual(errors, []);
  const after = live
    ? (await client().user.subscription.get()).characterCount
    : undefined;
  const report = {
    checkedAt: new Date().toISOString(),
    url: base,
    live,
    audioFrames,
    observedAccountCreditDelta: before === undefined ? null : after! - before,
    checks,
    errors,
    passed: true,
    limitations:
      "Synthetic prerecorded microphone; physical device permissions and subjective speech quality not assessed. Account delta can include concurrent usage/delayed billing.",
  };
  writeFileSync(
    `var/production-hosted${live ? "-live" : ""}.json`,
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  const report = {
    checkedAt: new Date().toISOString(),
    url: base,
    live,
    audioFrames,
    checks,
    errors,
    passed: false,
    failure: (error as Error).message,
  };
  writeFileSync(
    `var/production-hosted${live ? "-live" : ""}.json`,
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
  throw error;
} finally {
  if (timer) clearTimeout(timer);
  await browser.close();
}
