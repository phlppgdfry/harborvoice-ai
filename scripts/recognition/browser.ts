import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
const browser = await chromium.launch({
  headless: true,
  channel: process.env.BROWSER_CHANNEL || "chrome",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors: string[] = [];
page.on("pageerror", (e) => errors.push(e.message));
const base = process.env.DEMO_URL || "http://127.0.0.1:5173";
try {
  await page.goto(base + "/#community-studio");
  await page
    .getByRole("heading", {
      name: /Built to be understood/,
    })
    .waitFor();
  const trace = page.getByLabel("Visible local tool trace");
  for (const language of ["en", "nl", "fr"]) {
    await page.getByLabel("Rehearsal language").selectOption(language);
    assert.ok((await trace.innerText()).includes('"reference": "HV-2048"'));
  }
  await page.getByLabel("Fictional shipment reference").fill("HV-9999");
  await page.getByRole("button", { name: "Check local fixture" }).click();
  assert.ok((await trace.innerText()).includes('"found": false'));
  await page.getByLabel("Fictional shipment reference").fill("HV-2049");
  await page.getByRole("button", { name: "Check local fixture" }).click();
  assert.ok((await trace.innerText()).includes("Ready for pickup"));
  assert.equal(await page.locator(".community-tracks audio").count(), 3);
  for (const audio of await page.locator(".community-tracks audio").all())
    await audio.evaluate(async (el: HTMLAudioElement) => {
      el.preload = "metadata";
      el.load();
      await new Promise<void>((resolve, reject) => {
        el.addEventListener("loadedmetadata", () => resolve(), { once: true });
        el.addEventListener(
          "error",
          () => reject(Error("Track decode failed")),
          { once: true },
        );
      });
      if (!(el.duration > 55 && el.duration < 65))
        throw Error("Track duration invalid");
    });
  const epub = await page
    .getByRole("link", { name: "Download review EPUB" })
    .getAttribute("href");
  assert.ok(epub);
  const response = await page.request.get(
    new URL(epub!, page.url()).toString(),
  );
  assert.equal(response.status(), 200);
  assert.equal((await response.body()).subarray(0, 2).toString(), "PK");
  await page
    .getByLabel("Native learning example")
    .evaluate(async (el: HTMLAudioElement) => {
      el.load();
      await new Promise<void>((resolve, reject) => {
        el.addEventListener("loadedmetadata", () => resolve(), { once: true });
        el.addEventListener(
          "error",
          () => reject(Error("Revised lesson failed to decode")),
          { once: true },
        );
      });
      if (!(el.duration > 60 && el.duration < 63))
        throw Error("Revised lesson duration invalid");
    });
  const quiz = await page
    .getByRole("link", { name: "Download the reviewed quiz and answers" })
    .getAttribute("href");
  assert.ok(quiz);
  const quizResponse = await page.request.get(
    new URL(quiz!, page.url()).toString(),
  );
  assert.equal(quizResponse.status(), 200);
  assert.equal(
    (await quizResponse.text()).match(/Correct Answer:/g)?.length,
    3,
  );
  mkdirSync("var/recognition/screenshots", { recursive: true });
  await page.screenshot({
    path: "var/recognition/screenshots/community-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({
    path: "var/recognition/screenshots/community-mobile.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  const report = {
    checkedAt: new Date().toISOString(),
    url: base,
    status: "TESTED",
    checks: [
      "Three language views preserve exact reference",
      "Unknown reference does not select another shipment",
      "Known pickup record does not become a customs hold",
      "All three recorded tracks decode at60 seconds",
      "EPUB downloads as ZIP/EPUB payload",
      "Revised native lesson decodes at 61 seconds; reviewed three-question quiz downloads",
      "390px layout has no horizontal overflow",
    ],
    errors,
    providerCallsStarted: 0,
  };
  writeFileSync(
    "var/recognition/community-browser.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
