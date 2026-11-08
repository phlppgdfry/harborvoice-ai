import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { courses } from "../agent/academy-content.js";
const browser = await chromium.launch({
  headless: true,
  channel: process.env.BROWSER_CHANNEL || "chrome",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors: string[] = [],
  checks: string[] = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.route("**/api/status", (route) =>
  route.fulfill({
    json: { mode: "demo", configured: false, agentReady: false },
  }),
);
const url =
  (process.env.DEMO_URL || "http://127.0.0.1:5173").replace(/\/$/, "") +
  "/#academy";
try {
  await page.goto(url);
  await page
    .getByRole("heading", { name: "Build trust into the conversation." })
    .waitFor();
  for (const course of courses) {
    await page
      .getByRole("combobox", { name: "Course language" })
      .selectOption(course.language);
    for (const lesson of course.lessons) {
      await page
        .getByRole("navigation", { name: "Training lessons" })
        .getByRole("button", {
          name: new RegExp(lesson.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        })
        .click();
      const player = page.getByLabel("Lesson audio");
      await player.evaluate(async (e: HTMLAudioElement) => {
        if (e.readyState < 1)
          await new Promise<void>((resolve, reject) => {
            e.addEventListener("loadedmetadata", () => resolve(), {
              once: true,
            });
            e.addEventListener(
              "error",
              () => reject(Error("Lesson failed to decode")),
              { once: true },
            );
          });
        if (!(e.duration > 0)) throw Error("Invalid duration");
      });
    }
  }
  checks.push("All twelve real lesson audio files decode in four languages");
  await page
    .getByRole("combobox", { name: "Course language" })
    .selectOption("en");
  await page.getByRole("radio").nth(0).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page.getByText(/Try again\./).waitFor();
  for (let i = 0; i < 3; i++) {
    await page.getByRole("radio").nth(courses[0].lessons[i].answer).check();
    await page
      .getByRole("button", { name: "Check answer", exact: true })
      .click();
    await page.getByText(/Practice check completed\./).waitFor();
    if (i < 2) await page.getByRole("button", { name: "Next lesson" }).click();
  }
  await page.getByText("3 / 3 practice checks completed").waitFor();
  await page.reload();
  await page.getByText("3 / 3 practice checks completed").waitFor();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export practice record" }).click();
  const download = await pending;
  const record = JSON.parse(readFileSync((await download.path())!, "utf8"));
  assert.match(
    record.scope,
    /No identity verification.*official certification/,
  );
  assert.equal(
    Object.values(record.progress).filter((p: any) => p.passed).length,
    3,
  );
  checks.push(
    "Incorrect-answer feedback, all English checks, persistence and scoped JSON export",
  );
  for (const label of [
    "Native Audiobooks export",
    "Training dialogue",
    "Voice design preview 1",
    "Voice design preview 2",
    "Voice design preview 3",
    "Original pronunciation",
    "Pronunciation with aliases",
    "Fictional harbor video",
  ]) {
    await page
      .getByLabel(label, { exact: true })
      .evaluate(async (e: HTMLMediaElement) => {
        if (e.readyState < 1)
          await new Promise<void>((resolve, reject) => {
            e.addEventListener("loadedmetadata", () => resolve(), {
              once: true,
            });
            e.addEventListener(
              "error",
              () => reject(Error("Media decode failed")),
              { once: true },
            );
          });
        if (!(e.duration > 0)) throw Error("Invalid media duration");
      });
  }
  await page
    .getByLabel("Training dialogue", { exact: true })
    .evaluate((e: HTMLAudioElement) => e.play());
  await page
    .getByLabel("Voice design preview 1", { exact: true })
    .evaluate((e: HTMLAudioElement) => e.play());
  assert.ok(
    await page
      .getByLabel("Training dialogue", { exact: true })
      .evaluate((e: HTMLAudioElement) => e.paused),
  );
  await page
    .getByLabel("Voice design preview 1", { exact: true })
    .evaluate((e: HTMLAudioElement) => e.pause());
  checks.push(
    "Native audiobook, dialogue, three voice previews, terminology comparison and video decode; playback is exclusive",
  );
  mkdirSync("var/browser-evidence", { recursive: true });
  await page.screenshot({
    path: "var/browser-evidence/academy-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Mobile horizontal overflow",
  );
  await page.screenshot({
    path: "var/browser-evidence/academy-mobile.png",
    fullPage: true,
  });
  await page.evaluate(() =>
    localStorage.setItem("harborvoice-academy-v1", "{invalid"),
  );
  await page.reload();
  await page.getByText("0 / 3 practice checks completed").waitFor();
  checks.push(
    "Mobile layout has no horizontal overflow; malformed local progress recovers safely",
  );
  assert.deepEqual(errors, []);
  writeFileSync(
    "var/browser-evidence/academy-browser-verification.json",
    JSON.stringify(
      {
        at: new Date().toISOString(),
        url,
        browserPlugin: "Browser plugin not available; Playwright Chrome used",
        checks,
        errors,
        liveGeneration: false,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(JSON.stringify({ checks, errors }, null, 2));
} finally {
  await browser.close();
}
