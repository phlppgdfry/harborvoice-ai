// Browser QA for the Pages site: layout overflow, page errors, broken local resources,
// keyboard tabs, reduced motion and media. Writes screenshots and a JSON receipt.
// Usage: node scripts/showcase/qa-site.mjs <base-url> <out-dir> [engines=chromium,firefox,webkit]
import { chromium, firefox, webkit } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const [base, out, engineList = "chromium,firefox,webkit"] =
  process.argv.slice(2);
mkdirSync(out, { recursive: true });
const engines = {
  chromium: () => chromium.launch({ channel: "chrome" }),
  firefox: () => firefox.launch(),
  webkit: () => webkit.launch(),
};
const pages = [
  "",
  "app.html",
  "agentproof/",
  "learn/",
  "learn/reliable-voice-agents.html",
  "learn/workshop.html",
];
const widths = [
  ["desktop", 1440, 900],
  ["tablet", 820, 1180],
  ["mobile-390", 390, 844],
  ["mobile-360", 360, 780],
];
const results = [];
for (const name of engineList.split(",")) {
  let browser;
  try {
    browser = await engines[name]();
  } catch (error) {
    results.push({ engine: name, skipped: String(error).split("\n")[0] });
    continue;
  }
  for (const [label, width, height] of widths) {
    if (name !== "chromium" && label === "tablet") continue;
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    for (const path of pages) {
      const errors = [];
      const failed = [];
      page.removeAllListeners();
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("response", (r) => {
        if (r.url().startsWith(base) && r.status() >= 400)
          failed.push(`${r.status()} ${r.url().slice(base.length)}`);
      });
      await page.goto(base + path, { waitUntil: "load" });
      await page.waitForTimeout(700);
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        images: [...document.images]
          .filter(
            (i) => i.complete && i.naturalWidth === 0 && i.loading !== "lazy",
          )
          .map((i) => i.getAttribute("src")),
        h1: document.querySelectorAll("h1").length,
        title: document.title,
      }));
      if (path === "" && name === "chromium")
        await page.screenshot({ path: `${out}/after-${label}.png` });
      results.push({
        engine: name,
        viewport: label,
        path: path || "/",
        ...metrics,
        errors,
        failed,
      });
    }
    await context.close();
  }
  // Interaction checks on the landing page.
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "load" });
  const tab = page.getByRole("tab", { name: "AgentProof" });
  await tab.focus();
  await page.keyboard.press("ArrowRight");
  const selected = await page.evaluate(
    () => document.activeElement?.textContent,
  );
  const panelVisible = await page.isVisible("#panel-agentops");
  await page.goto("about:blank");
  await page.goto(base + "#community-studio");
  await page
    .waitForURL(/app\.html#community-studio/, { timeout: 5000 })
    .catch(() => {});
  const redirect = page.url().endsWith("app.html#community-studio");
  const toggle = page.getByRole("button", { name: "Pause animation" });
  await page.goto(base);
  await toggle.click();
  const paused = await page.evaluate(() =>
    document.documentElement.classList.contains("motion-paused"),
  );
  const film = await page.evaluate(async () => {
    const v = document.querySelector("#film video");
    v.preload = "metadata";
    v.load();
    await new Promise((r) => {
      v.addEventListener("loadedmetadata", r, { once: true });
      setTimeout(r, 8000);
    });
    return { duration: Math.round(v.duration), tracks: v.textTracks.length };
  });
  results.push({
    engine: name,
    interactions: {
      arrowKeyMovesTab: selected?.trim() === "AgentOps Kit",
      panelVisible,
      legacyHashRedirect: redirect,
      motionPause: paused,
      film,
    },
  });
  await context.close();
  if (name === "chromium") {
    const reduced = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    const p = await reduced.newPage();
    await p.goto(base, { waitUntil: "load" });
    const state = await p.evaluate(() => ({
      waveAnimation: getComputedStyle(document.querySelector(".wave i"))
        .animationName,
      revealVisible: getComputedStyle(document.querySelector(".reveal"))
        .opacity,
      toggleHidden: getComputedStyle(
        document.querySelector("[data-motion-toggle]"),
      ).display,
    }));
    results.push({ engine: name, reducedMotion: state });
    await reduced.close();
  }
  await browser.close();
}
writeFileSync(
  `${out}/site-qa.json`,
  JSON.stringify(
    { checkedAt: new Date().toISOString(), base, results },
    null,
    2,
  ),
);
const problems = results.filter(
  (r) =>
    r.overflow > 0 ||
    r.errors?.length ||
    r.failed?.length ||
    r.images?.length ||
    r.h1 === 0,
);
console.log(JSON.stringify({ checks: results.length, problems }, null, 2));
for (const r of results.filter(
  (r) => r.interactions || r.reducedMotion || r.skipped,
))
  console.log(JSON.stringify(r));
process.exit(problems.length ? 1 : 0);
