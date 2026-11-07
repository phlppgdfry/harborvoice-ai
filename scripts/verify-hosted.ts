import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { LIVE_APP_URL } from "../src/deployment.js";

const base = process.env.HOSTED_URL || LIVE_APP_URL;
const token =
  process.env.HARBORVOICE_ACCESS_CODE ||
  JSON.parse(readFileSync("var/hosted-operator.json", "utf8")).token;
const browser = await chromium.launch({
  headless: true,
  channel: process.env.BROWSER_CHANNEL || "chrome",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors: string[] = [];
page.on("pageerror", (error) => errors.push(error.message));
page.setDefaultTimeout(30000);
try {
  await page.goto(base + "/#settings");
  await page.getByText("Connected · hosted API", { exact: true }).waitFor();
  await page.getByText("Nora is configured", { exact: true }).waitFor();
  const denied = await page.request.post(base + "/api/agent/session", {
    data: {},
  });
  assert.equal(denied.status(), 401);
  await page.getByLabel("Operator access code", { exact: true }).fill(token);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page
    .getByText("Your operator session is active.", { exact: false })
    .waitFor();
  const cookie = (await page.context().cookies()).find(
    (cookie) => cookie.name === "hv_operator",
  );
  assert.ok(cookie?.httpOnly && cookie.secure && cookie.sameSite === "Strict");
  await page
    .getByRole("button", { name: "Verify ElevenLabs connection", exact: true })
    .click();
  await page.getByText(/voices available\./).waitFor();
  mkdirSync("docs/screenshots", { recursive: true });
  await page.screenshot({
    path: "docs/screenshots/live-settings.png",
    fullPage: true,
  });
  const signed = await page.request.post(base + "/api/agent/session", {
    data: {},
  });
  assert.equal(signed.status(), 200);
  assert.ok((await signed.json()).signedUrl);
  await page
    .getByRole("button", { name: "Portfolio evidence", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Real agent evaluation", exact: true })
    .waitFor();
  await page.getByText("6/6 passed", { exact: true }).waitFor();
  let audioGenerated = false;
  if (process.argv.includes("--audio")) {
    await page
      .getByRole("button", { name: "Audio studio", exact: true })
      .click();
    await page
      .getByRole("textbox", { name: "Your script" })
      .fill("HarborVoice is connected.");
    await page
      .getByRole("button", { name: "Generate with ElevenLabs" })
      .click();
    await page
      .getByRole("link", { name: "Download audio", exact: true })
      .waitFor();
    const seconds = await page
      .locator("audio")
      .evaluate(async (element: HTMLAudioElement) => {
        if (element.readyState < 1)
          await new Promise<void>((resolve, reject) => {
            element.addEventListener("loadedmetadata", () => resolve(), {
              once: true,
            });
            element.addEventListener(
              "error",
              () => reject(new Error("Generated audio could not be decoded")),
              { once: true },
            );
          });
        return element.duration;
      });
    assert.ok(Number.isFinite(seconds) && seconds > 0);
    await page.screenshot({
      path: "docs/screenshots/live-speech.png",
      fullPage: true,
    });
    audioGenerated = true;
  }
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.goto(base + "/#settings");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.getByLabel("Operator access code", { exact: true }).waitFor();
  assert.deepEqual(errors, []);
  const report = {
    checkedAt: new Date().toISOString(),
    url: base,
    checks: [
      "Hosted configuration shown correctly",
      "Unauthenticated paid route rejected",
      "Operator login and secure HttpOnly cookie",
      "Real ElevenLabs voice-library access",
      "Authenticated signed-session URL issued (not opened)",
      "Six real evaluation results rendered",
      "Mobile layout within viewport",
      "Operator logout",
    ],
    audioGenerated,
    audioScope: audioGenerated
      ? "One short real text-to-speech request through the hosted browser and API; media metadata decoded successfully. Other audio products and microphone conversations remain unverified end to end."
      : "No audio generation requested.",
    errors,
  };
  writeFileSync(
    "docs/hosted-verification.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
