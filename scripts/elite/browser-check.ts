import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
const browser = await chromium.launch({
    headless: true,
    channel: process.env.BROWSER_CHANNEL || "chrome",
  }),
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors: string[] = [],
  checks: string[] = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.route("**/api/status", (r) =>
  r.fulfill({ json: { mode: "demo", configured: false, agentReady: false } }),
);
const url = process.env.DEMO_URL || "http://127.0.0.1:5173";
try {
  await page.goto(url + "/#elite-studio");
  await page.getByRole("heading", { name: "An answer is waiting." }).waitFor();
  await page
    .getByRole("tab", { name: "Productions", exact: true })
    .press("ArrowRight");
  assert.equal(
    await page
      .getByRole("tab", { name: "Automation", exact: true })
      .getAttribute("aria-selected"),
    "true",
  );
  await page
    .getByRole("tab", { name: "Automation", exact: true })
    .press("ArrowLeft");
  for (const language of ["en", "nl", "fr"]) {
    await page.getByLabel("Film language").selectOption(language);
    await page
      .getByLabel("HarborVoice product commercial")
      .evaluate(async (e: HTMLVideoElement) => {
        if (e.readyState < 1)
          await new Promise<void>((resolve, reject) => {
            e.addEventListener("loadedmetadata", () => resolve(), {
              once: true,
            });
            e.addEventListener(
              "error",
              () => reject(Error("Film failed to decode")),
              { once: true },
            );
          });
        if (!(e.duration >= 30 && e.duration <= 45))
          throw Error("Commercial duration outside brief");
      });
  }
  await page.getByLabel("Film language").selectOption("en");
  await page.getByRole("tab", { name: "Automation", exact: true }).click();
  for (const name of [
    "Product Commercial Factory",
    "Multilingual Localization Factory",
    "Learning Content Factory",
    "Enterprise Audio Factory",
  ]) {
    await page.getByRole("button", { name, exact: true }).click();
    assert.ok(
      (
        await page
          .getByRole("link", { name: "Open this native flow" })
          .getAttribute("href")
      )?.startsWith("https://elevenlabs.io/app/flows/"),
    );
  }
  await page.getByRole("tab", { name: "Engineering", exact: true }).click();
  await page.getByRole("heading", { name: "Inspect what happened." }).waitFor();
  checks.push(
    "Three localized films decode at 30–45 seconds; four native flow references and scoped engineering evidence render",
  );
  await page.getByRole("tab", { name: "Productions", exact: true }).click();
  mkdirSync("docs/elite/screenshots", { recursive: true });
  await page.screenshot({
    path: "docs/elite/screenshots/productions-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Mastery lab", exact: true }).click();
  await page
    .getByRole("heading", {
      name: "From a voice interface to a dependable system.",
    })
    .waitFor();
  assert.equal(
    await page
      .getByRole("navigation", { name: "Mastery modules" })
      .getByRole("button")
      .count(),
    15,
  );
  await page
    .getByRole("textbox", { name: "Search Mastery modules" })
    .fill("realtime");
  assert.ok(
    (await page
      .getByRole("navigation", { name: "Mastery modules" })
      .getByRole("button")
      .count()) < 15,
  );
  await page.getByRole("textbox", { name: "Search Mastery modules" }).fill("");
  await page
    .getByRole("combobox", { name: "Skill category" })
    .selectOption("Agents");
  await page
    .getByRole("navigation", { name: "Mastery modules" })
    .getByRole("button")
    .filter({ hasText: "Tools and human review" })
    .click();
  await page
    .getByRole("textbox", { name: "Your exercise notes" })
    .fill("I checked the pending-review boundary against synthetic records.");
  const boxes = page.locator(".mastery-exercise input[type=checkbox]");
  for (let i = 0; i < (await boxes.count()); i++) await boxes.nth(i).check();
  await page.getByText("Self-review recorded for this module.").waitFor();
  await page.reload();
  await page
    .getByRole("navigation", { name: "Mastery modules" })
    .getByRole("button")
    .filter({ hasText: "Tools and human review" })
    .click();
  assert.match(
    await page
      .getByRole("textbox", { name: "Your exercise notes" })
      .inputValue(),
    /pending-review/,
  );
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download module", exact: true })
    .click();
  assert.match((await download).suggestedFilename(), /\.md$/);
  checks.push(
    "All fifteen modules render; search/category filter, exercise notes, self-review persistence and guide download work",
  );
  await page.screenshot({
    path: "docs/elite/screenshots/mastery-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({
    path: "docs/elite/screenshots/mastery-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Elite studio", exact: true }).click();
  await page.getByRole("heading", { name: "An answer is waiting." }).waitFor();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({
    path: "docs/elite/screenshots/productions-mobile.png",
    fullPage: true,
  });
  checks.push("390px mobile views have no horizontal overflow");
  assert.deepEqual(errors, []);
  writeFileSync(
    "docs/elite/browser-verification.json",
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        url,
        environment: "Playwright; Browser plugin not available",
        viewports: ["1440x1000", "390x844"],
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
