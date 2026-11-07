import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";
const base = process.env.HOSTED_URL || "https://harborvoice-ai.vercel.app";
if (!process.argv.includes("--live"))
  throw Error(
    "Use --live to explicitly authorize one real billable visitor voice conversation.",
  );
const marker = "var/visitor-voice-attempt.json";
if (existsSync(marker))
  throw Error(
    "A live visitor test has already been attempted. Inspect its evidence instead of automatically consuming another visitor slot.",
  );
execFileSync("ffmpeg", [
  "-y",
  "-hide_banner",
  "-loglevel",
  "error",
  "-i",
  "public/experience/guest-question.mp3",
  "-af",
  "adelay=12000:all=1,apad=whole_dur=36",
  "-ar",
  "44100",
  "-ac",
  "1",
  "-c:a",
  "pcm_s16le",
  "var/visitor-input.wav",
]);
writeFileSync(
  marker,
  JSON.stringify({ at: new Date().toISOString(), origin: base }),
  { mode: 0o600 },
);
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "chrome",
  headless: true,
  args: [
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    `--use-file-for-fake-audio-capture=${resolve("var/visitor-input.wav")}`,
  ],
});
const context = await browser.newContext({
  permissions: ["microphone"],
  viewport: { width: 1440, height: 1100 },
});
const page = await context.newPage();
page.setDefaultTimeout(45000);
const errors: string[] = [];
const lookups: { status: number; found: boolean }[] = [];
let audioFrames = 0;
page.on("pageerror", (error) => errors.push(error.message));
page.on("websocket", (socket) =>
  socket.on("framereceived", (event) => {
    try {
      const data = JSON.parse(event.payload.toString());
      if (data.type === "audio") audioFrames++;
    } catch {}
  }),
);
page.on("response", async (response) => {
  if (response.url().endsWith("/api/guest/lookup")) {
    const result = await response.json();
    lookups.push({ status: response.status(), found: result.found });
  }
});
try {
  await page.goto(base + "/#voice-agents");
  await page
    .getByRole("button", { name: "Try visitor voice", exact: true })
    .click();
  await page
    .getByText("You are speaking with an AI assistant.", { exact: true })
    .waitFor();
  await page.locator(".transcript .message.user").first().waitFor();
  await page
    .locator(".transcript .message.agent p")
    .filter({ hasText: /customs hold|customs.*hold|held.*customs/i })
    .first()
    .waitFor();
  await page
    .getByRole("button", { name: "End voice session", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start live voice", exact: true })
    .waitFor();
  const messages = await page
    .locator(".transcript .message")
    .evaluateAll((elements) =>
      elements.map((element) => ({
        role: element.classList.contains("user") ? "user" : "agent",
        text: element.querySelector("p")?.textContent || "",
      })),
    );
  assert.ok(lookups.some((lookup) => lookup.status === 200 && lookup.found));
  assert.ok(audioFrames > 0);
  assert.deepEqual(errors, []);
  await page.getByRole("status").waitFor({ state: "hidden" });
  await page.screenshot({
    path: "docs/screenshots/visitor-voice.png",
    fullPage: true,
  });
  const report = {
    checkedAt: new Date().toISOString(),
    url: base,
    scope:
      "One real public visitor WebSocket conversation with a synthetic prerecorded microphone question; actual ASR, agent response, read-only shipment tool and incoming speech audio. A human microphone and subjective voice quality were not assessed.",
    authenticatedOperator: false,
    lookups,
    incomingAudioFrames: audioFrames,
    messages,
    errors,
    passed: true,
  };
  writeFileSync(
    "docs/visitor-voice-verification.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  await page.screenshot({
    path: "var/visitor-voice-failure.png",
    fullPage: true,
  });
  console.log(
    JSON.stringify(
      {
        incomingAudioFrames: audioFrames,
        lookups,
        errors,
        transcript: await page
          .locator(".transcript")
          .innerText()
          .catch(() => "No transcript"),
      },
      null,
      2,
    ),
  );
  throw error;
} finally {
  await browser.close();
}
