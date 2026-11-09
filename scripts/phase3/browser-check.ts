import { chromium, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
const baseUrl = process.env.AGENTPROOF_URL || "http://127.0.0.1:4313";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1512, height: 1100 } });
const errors: string[] = [];
page.on("pageerror", (e) => errors.push(e.message));
const requests: string[] = [];
page.on("request", (r) => requests.push(r.url()));
const checks: string[] = [];
try {
  await page.goto(baseUrl);
  await expect(
    page.getByRole("heading", { name: "Know where your agent breaks." }),
  ).toBeVisible();
  checks.push("production build loads");
  await expect(
    page.getByRole("heading", { name: "tool-error-01", exact: true }),
  ).toBeVisible();
  checks.push("failure inspector defaults to meaningful failure");
  await page.getByLabel("Status", { exact: true }).selectOption("failed");
  await expect(page.locator("tbody tr")).toHaveCount(30);
  checks.push("failed filter returns 30 baseline failures");
  await page.getByLabel("Search scenarios").fill("HV-301");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  checks.push("search narrows failures");
  await page.getByLabel("Search scenarios").fill("unfindable-query");
  await expect(
    page.getByText("No matching scenarios.", { exact: false }),
  ).toBeVisible();
  checks.push("empty state");
  await page.getByLabel("Search scenarios").fill("");
  await page.getByRole("button", { name: "Compare corrected policy" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(0);
  checks.push("corrected policy has no fixture failures");
  await page.getByLabel("Status", { exact: true }).selectOption("all");
  await expect(page.locator("tbody tr")).toHaveCount(110);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export evidence" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("agentproof-evidence.json");
  checks.push("evidence export");
  await page.getByRole("button", { name: "Methodology", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "What this study can tell you" }),
  ).toBeVisible();
  checks.push("methodology navigation");
  await page
    .getByRole("button", { name: "Configuration", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Review the boundary before deployment",
    }),
  ).toBeVisible();
  checks.push("configuration comparison");
  await page
    .getByRole("button", { name: "Pilot feedback", exact: true })
    .click();
  await page
    .getByLabel("What was unclear?", { exact: false })
    .fill("Synthetic QA feedback, not actual participant feedback.");
  const feedbackPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my feedback" }).click();
  expect((await feedbackPromise).suggestedFilename()).toBe(
    "agentproof-feedback.txt",
  );
  checks.push("feedback exports locally");
  await page.getByRole("button", { name: "Evidence", exact: true }).click();
  await page.getByLabel("Evaluation run").selectOption("baseline");
  await page.getByLabel("Category", { exact: true }).selectOption("tool-error");
  await page.evaluate(() => window.scrollTo(0, 0));
  mkdirSync("docs/phase3/screenshots", { recursive: true });
  await page.screenshot({
    path: "docs/phase3/screenshots/agentproof-desktop.png",
    fullPage: true,
  });
  // DOM accessibility checks, scoped honestly: not a WCAG conformance audit.
  expect(await page.locator("h1").count()).toBe(1);
  expect(await page.getByRole("navigation", { name: "Primary" }).count()).toBe(
    1,
  );
  expect(
    await page.locator("input:not([type=hidden])").evaluateAll((nodes) =>
      nodes.every((n) => {
        const e = n as HTMLInputElement;
        return e.labels && e.labels.length > 0;
      }),
    ),
  ).toBe(true);
  await page.keyboard.press("Tab");
  checks.push(
    "semantic heading, navigation, input labels and keyboard navigation",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "Evidence", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "docs/phase3/screenshots/agentproof-mobile.png",
    fullPage: true,
  });
  checks.push("390px layout without horizontal document overflow");
  expect(errors).toEqual([]);
  expect(
    requests.every((u) => new URL(u).origin === new URL(baseUrl).origin),
  ).toBe(true);
  checks.push("no page errors or external network requests");
  writeFileSync(
    "docs/phase3/browser-verification.json",
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        checks,
        errors,
        requests: requests.length,
        accessibilityScope:
          "DOM landmarks, label associations, keyboard action and responsive overflow only; no screen reader or full WCAG audit.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`${checks.length} browser checks passed.`);
} finally {
  await browser.close();
}
