import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
const browser = await chromium.launch({ channel: "chrome", headless: true });
mkdirSync("var/elite/takes", { recursive: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: "var/elite/takes", size: { width: 1440, height: 900 } },
});
const page = await context.newPage();
await page.goto("http://127.0.0.1:5173");
await page
  .getByRole("heading", { name: "Voice operations. All in view." })
  .waitFor();
await page.waitForTimeout(3000);
await page.getByRole("button", { name: "Voice agents", exact: true }).click();
await page
  .getByRole("textbox", { name: "Message Nora" })
  .fill("Where is HV-2048?");
await page.waitForTimeout(800);
await page.getByRole("button", { name: "Send message", exact: true }).click();
await page.getByText("HV-2048 is customs hold at").last().waitFor();
await page
  .getByText("HV-2048 is customs hold at")
  .last()
  .scrollIntoViewIfNeeded();
await page.waitForTimeout(3500);
await page.screenshot({ path: "var/elite/takes/agent.png" });
await page
  .getByRole("textbox", { name: "Message Nora" })
  .fill("Escalate HV-2048 to an operator");
await page.getByRole("button", { name: "Send message", exact: true }).click();
await page.waitForTimeout(2000);
await page.getByRole("button", { name: /^Workflows/ }).click();
await page.waitForTimeout(2500);
await page.screenshot({ path: "var/elite/takes/review.png" });
await page
  .getByRole("button", { name: "Portfolio evidence", exact: true })
  .click();
await page.waitForTimeout(2500);
await page.getByRole("button", { name: "Mastery lab", exact: true }).click();
await page.waitForTimeout(2500);
await page.screenshot({ path: "var/elite/takes/mastery.png" });
await context.close();
await browser.close();
console.log(
  "Recorded real deterministic-demo app interactions; no live AI claimed.",
);
