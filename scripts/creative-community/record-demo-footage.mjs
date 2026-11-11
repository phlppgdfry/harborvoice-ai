// Records real, silent browser footage of the public demo for the demo video.
// It drives the live pages; nothing is mocked. Usage:
//   node scripts/creative-community/record-demo-footage.mjs <output-dir> [base-url]
import { chromium } from "playwright";

const out = process.argv[2] ?? "var/demo-footage";
const base = process.argv[3] ?? "https://phlppgdfry.github.io/harborvoice-ai/";
const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: out, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();
const pause = (ms) => page.waitForTimeout(ms);
const glide = async (pixels, steps = 40) => {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, pixels / steps);
    await pause(60);
  }
};
const shots = [];
const shot = async (name, run) => {
  const start = Date.now();
  try {
    await run();
    shots.push({ name, seconds: (Date.now() - start) / 1000, ok: true });
  } catch (error) {
    shots.push({ name, ok: false, error: String(error).slice(0, 120) });
  }
};

await shot("workbench overview", async () => {
  await page.goto(base, { waitUntil: "networkidle" });
  await pause(3500);
  await glide(700);
  await pause(2000);
});
for (const [name, hash] of [
  ["voice agent", "#voice-agents"],
  ["evaluations", "#evaluations"],
  ["community studio", "#community-studio"],
]) {
  await shot(name, async () => {
    await page.goto(base + hash, { waitUntil: "networkidle" });
    await page.mouse.move(640, 360);
    await pause(3000);
    await glide(600);
    await pause(2000);
  });
}
await shot("agentproof failure", async () => {
  await page.goto(base + "agentproof/", { waitUntil: "networkidle" });
  await pause(3500);
  await page.getByPlaceholder(/Search ID/i).fill("tool-error-01");
  await pause(2500);
  await glide(520);
  await pause(4000);
});
await shot("agentproof corrected run", async () => {
  await page.mouse.wheel(0, -2000);
  await pause(800);
  const run = page.locator("select").first();
  const options = await run.locator("option").allTextContents();
  await run.selectOption({
    label: options.find((o) => /correct/i.test(o)) ?? options[1],
  });
  await pause(3500);
  await glide(520);
  await pause(4000);
});
await shot("learn hub", async () => {
  await page.goto(base + "learn/", { waitUntil: "networkidle" });
  await pause(3000);
  await glide(500);
  await pause(2000);
});
await context.close();
await browser.close();
console.log(JSON.stringify(shots, null, 2));
