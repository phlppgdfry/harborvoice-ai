import { chromium, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
const base = process.env.EXCELLENCE_URL || "http://127.0.0.1:4416";
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const checks = [],
  errors = [],
  external = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("request", (request) => {
  if (new URL(request.url()).origin !== new URL(base).origin)
    external.push(new URL(request.url()).origin);
});
const output = "docs/final-excellence";
mkdirSync(`${output}/screenshots`, { recursive: true });
try {
  await page.goto(base + "/#portfolio-evidence");
  await expect(
    page.getByRole("heading", {
      name: "ElevenLabs Engineering & Creative Automation Portfolio",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Publication review · 10 November 2026",
    }),
  ).toBeVisible();
  checks.push("Portfolio explains provenance and current submissions");
  await page.screenshot({
    path: `${output}/screenshots/portfolio-desktop.png`,
    fullPage: true,
  });
  await page.getByRole("link", { name: /Open AgentProof/ }).click();
  await expect(
    page.getByRole("heading", { name: "Know where your agent breaks." }),
  ).toBeVisible();
  await page.getByLabel("Status", { exact: true }).selectOption("failed");
  await expect(page.locator("tbody tr")).toHaveCount(30);
  await page.getByLabel("Search scenarios").fill("no-such-case");
  await expect(
    page.getByText("No matching scenarios.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText("The selected scenario is outside the current filters.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByLabel("Search scenarios").fill("");
  await page.getByRole("button", { name: "Compare corrected policy" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(0);
  checks.push(
    "Failure filtering, search, empty state and fixture comparison work",
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export evidence" }).click();
  expect((await download).suggestedFilename()).toBe("agentproof-evidence.json");
  await page.getByRole("button", { name: "Contract lab", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(12);
  await expect(page.getByText("Failure detected", { exact: true })).toHaveCount(
    9,
  );
  await expect(page.getByText("Control accepted", { exact: true })).toHaveCount(
    3,
  );
  checks.push("Evidence export and separate 12-case contract evidence work");
  await page.screenshot({
    path: `${output}/screenshots/agentproof-desktop.png`,
    fullPage: true,
  });
  for (const width of [390, 360]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Evidence", exact: true }).focus();
    await expect(
      page.getByRole("button", { name: "Evidence", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Search scenarios")).toBeVisible();
    checks.push(
      `${width}px navigation and keyboard activation work without document overflow`,
    );
    await page.screenshot({
      path: `${output}/screenshots/agentproof-${width}.png`,
      fullPage: true,
    });
  }
  await page.goto(base + "/#community-studio");
  await expect(
    page.getByText("Submitted to ElevenReader as HarborVoice Project", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("PR #113 submitted and open", { exact: false }),
  ).toBeVisible();
  for (const audio of await page.locator("audio").all()) {
    const source = await audio.getAttribute("src");
    if (source)
      expect(
        (await page.request.get(new URL(source, page.url()).href)).ok(),
      ).toBe(true);
  }
  const epub = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download review EPUB" }).click();
  expect((await epub).suggestedFilename()).toMatch(/\.epub$/);
  checks.push(
    "Community status, existing audio files and EPUB download are accessible",
  );
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
  writeFileSync(
    `${output}/browser-verification.json`,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        base,
        checks,
        errors,
        externalRequests: external,
        providerDispatches: 0,
        scope:
          "Desktop Chrome and 390/360px emulation; DOM, keyboard, screenshots, downloads and audio HTTP checks. No physical mobile/microphone, human listening, screen reader or Safari acceptance.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(checks.join("\n"));
} finally {
  await browser.close();
}
