import { chromium, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const base = process.env.MASTERY_URL || "http://127.0.0.1:4414";
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors: string[] = [],
  requests: string[] = [],
  checks: string[] = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => requests.push(r.url()));
try {
  await page.goto(base + "/#portfolio-evidence");
  await expect(
    page.getByRole("heading", {
      name: "ElevenLabs Engineering & Creative Automation Portfolio",
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Open AgentProof/ }).click();
  await expect(
    page.getByRole("heading", { name: "Know where your agent breaks." }),
  ).toBeVisible();
  checks.push("Portfolio link loads bundled AgentProof");
  requests.length = 0; // Scope network isolation to AgentProof, after leaving the existing root page.
  await page.getByRole("button", { name: "Contract lab", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Inspect what a pass can miss." }),
  ).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(12);
  await expect(page.getByText("Failure detected", { exact: true })).toHaveCount(
    9,
  );
  await expect(page.getByText("Control accepted", { exact: true })).toHaveCount(
    3,
  );
  checks.push(
    "Twelve contract rows show nine failures and three accepted controls",
  );
  const exportPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download contract evidence" }).click();
  expect((await exportPromise).suggestedFilename()).toBe("contracts.json");
  checks.push("Contract report downloads");
  mkdirSync("docs/final-mastery/screenshots", { recursive: true });
  await page.screenshot({
    path: "docs/final-mastery/screenshots/contracts-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "Contract lab", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/final-mastery/screenshots/contracts-mobile.png",
    fullPage: true,
  });
  checks.push("390px viewport: controls visible; no document overflow");
  await page.getByRole("button", { name: "Evidence", exact: true }).click();
  await page.getByLabel("Status", { exact: true }).selectOption("failed");
  await expect(page.locator("tbody tr")).toHaveCount(30);
  await page.getByRole("button", { name: "Compare corrected policy" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(0);
  checks.push("Existing comparison and filtering remain functional");
  expect(errors).toEqual([]);
  expect(
    requests.every((u) => new URL(u).origin === new URL(base).origin),
  ).toBe(true);
  checks.push(
    "No page errors; no external requests from AgentProof interactions",
  );
  writeFileSync(
    "docs/final-mastery/browser-verification.json",
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
          encoding: "utf8",
        }).trim(),
        url: base,
        viewports: ["1440x1000", "390x844"],
        browser:
          "Chrome via Playwright; Browser plugin not available; native CUA transport failed timeoutMs.",
        checks,
        errors,
        providerCalls: 0,
        scope:
          "DOM, interaction, downloads, console and responsive checks; no full WCAG audit or screen-reader acceptance.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(checks.join("\n"));
} finally {
  await browser.close();
}
