// Records real screen footage of the built site for the showcase clips and the demo video.
// Usage: node scripts/showcase/record-media.mjs <base-url> <terminal.json> <out-dir> [only]
// The base URL must serve the Pages layout (landing at /, app at /app.html).
// Nothing is mocked: the browser drives the actual pages. The terminal shots replay
// command output that was captured beforehand into terminal.json.
import { chromium } from "playwright";
import { readFileSync, renameSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const [base, terminalFile, out, only] = process.argv.slice(2);
if (!base || !terminalFile || !out)
  throw Error(
    "Usage: record-media.mjs <base-url> <terminal.json> <out-dir> [only]",
  );
const terminal = JSON.parse(readFileSync(terminalFile, "utf8"));
mkdirSync(out, { recursive: true });
const size = { width: 1440, height: 900 };
const browser = await chromium.launch({ channel: "chrome" });

async function shot(name, run) {
  if (only && !only.split(",").includes(name)) return;
  const context = await browser.newContext({
    viewport: size,
    deviceScaleFactor: 1,
    recordVideo: { dir: out, size },
  });
  const page = await context.newPage();
  const started = Date.now();
  try {
    await run(page);
  } finally {
    const video = page.video();
    await context.close();
    renameSync(await video.path(), join(out, `${name}.webm`));
    console.log(name, ((Date.now() - started) / 1000).toFixed(1) + "s");
  }
}
const wait = (page, ms) => page.waitForTimeout(ms);
async function glide(page, px, ms) {
  const steps = Math.max(1, Math.round(ms / 40));
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, px / steps);
    await wait(page, 40);
  }
}
async function open(page, path) {
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.mouse.move(720, 450);
}
async function toSection(page, selector) {
  await page.evaluate((s) => {
    const el = document.querySelector(s);
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 70,
      behavior: "smooth",
    });
  }, selector);
  await wait(page, 1200);
}

const termHtml = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;height:100vh;display:grid;place-items:center;background:radial-gradient(900px 500px at 80% 0,#16404d,transparent 60%),#0b1f2a;font-family:system-ui}
.win{width:1180px;height:760px;background:#061219;border-radius:14px;box-shadow:0 40px 80px -30px #000,0 0 0 1px #ffffff14;overflow:hidden;display:flex;flex-direction:column}
.bar{display:flex;gap:7px;align-items:center;padding:12px 16px;background:#0e2430;color:#7f9ca6;font-size:13px}
.bar i{width:11px;height:11px;border-radius:50%;background:#2c4653}.bar span{margin-left:12px}
pre{flex:1;margin:0;padding:22px 26px;color:#d6f3f0;font:16px/1.55 ui-monospace,Menlo,monospace;white-space:pre-wrap;overflow:hidden}
.p{color:#77d7d0}.ok{color:#8fe3a0}.bad{color:#ffb4a8}.hi{color:#f2c46d}
</style><div class="win"><div class="bar"><i></i><i></i><i></i><span>harborvoice-ai — replay of real command output</span></div><pre id="t"></pre></div>`;
async function replay(page, steps, perLineMs = 70) {
  await page.setContent(termHtml);
  for (const step of steps) {
    await page.evaluate((cmd) => {
      const t = document.getElementById("t");
      const line = document.createElement("div");
      line.innerHTML = '<span class="p">$ </span><span class="c"></span>';
      t.append(line);
      window.__c = line.querySelector(".c");
      window.__cmd = cmd;
    }, step.cmd);
    for (let i = 1; i <= step.cmd.length; i += 2) {
      await page.evaluate(
        (n) => (window.__c.textContent = window.__cmd.slice(0, n)),
        i,
      );
      await wait(page, 22);
    }
    await page.evaluate((cmd) => (window.__c.textContent = cmd), step.cmd);
    await wait(page, 450);
    for (const text of step.out.split("\n")) {
      await page.evaluate((text) => {
        const t = document.getElementById("t");
        const d = document.createElement("div");
        d.textContent = text;
        if (/^✔|pass \d|"potentiallyBreaking": true/.test(text))
          d.className = "ok";
        if (/"severity": "high"|exit=2|✖/.test(text)) d.className = "bad";
        if (/"message"/.test(text)) d.className = "hi";
        t.append(d);
        while (t.scrollHeight > t.clientHeight && t.firstChild)
          t.firstChild.remove();
      }, text);
      await wait(page, perLineMs);
    }
    await wait(page, 900);
  }
}

// Product tour + demo video shots
await shot("s1-intro", async (p) => {
  await open(p, "");
  await wait(p, 5200);
  await open(p, "app.html");
  await wait(p, 2500);
  await glide(p, 900, 6000);
  await wait(p, 3000);
});
await shot("s2-architecture", async (p) => {
  await open(p, "");
  await toSection(p, "#how");
  for (const li of await p.locator("[data-pipeline] li").all()) {
    await li.hover();
    await wait(p, 1250);
  }
  await open(p, "app.html#voice-agents");
  await wait(p, 1500);
  await p.evaluate(() =>
    [...document.querySelectorAll("h2")]
      .find((h) => /Agent capabilities/.test(h.textContent))
      ?.scrollIntoView({ behavior: "smooth", block: "center" }),
  );
  await wait(p, 6000);
});
await shot("s3-rules", async (p) => {
  await replay(p, [terminal[0]], 120);
  await wait(p, 1500);
  await open(p, "learn/reliable-voice-agents.html#failures");
  await wait(p, 1500);
  await glide(p, 700, 5000);
  await wait(p, 2000);
});
await shot("s4-review", async (p) => {
  await open(p, "app.html#voice-agents");
  await wait(p, 1200);
  await p.getByRole("button", { name: "Where is HV-2048?" }).click();
  await wait(p, 3800);
  await p
    .getByRole("button", { name: "Escalate HV-2048 to an operator" })
    .click();
  await wait(p, 3800);
  await open(p, "app.html#workflows");
  await wait(p, 2200);
  const approve = p.getByRole("button", { name: /approve/i }).first();
  await approve.scrollIntoViewIfNeeded();
  await wait(p, 1500);
  await approve.click();
  await wait(p, 3000);
  await open(p, "app.html#overview");
  await wait(p, 1000);
  await glide(p, 420, 1500);
  await wait(p, 3500);
});
await shot("s5-agentproof", async (p) => {
  await open(p, "agentproof/");
  await wait(p, 3000);
  await p
    .getByPlaceholder(/Search ID/i)
    .pressSequentially("tool-error-01", { delay: 70 });
  await wait(p, 1500);
  await glide(p, 520, 2500);
  await wait(p, 4500);
  await p.mouse.wheel(0, -2000);
  await wait(p, 900);
  const run = p.locator("select").first();
  const labels = await run.locator("option").allTextContents();
  await run.selectOption({
    label: labels.find((o) => /correct/i.test(o)) ?? labels[1],
  });
  await wait(p, 2500);
  await glide(p, 520, 2500);
  await wait(p, 4000);
});
await shot("s6-agentops", async (p) => {
  await replay(p, [terminal[1], terminal[2]], 55);
  await wait(p, 2500);
});
await shot("s7-limits", async (p) => {
  await open(p, "agentproof/");
  await wait(p, 5000);
  await open(p, "");
  await toSection(p, "#evidence");
  await wait(p, 2500);
  await glide(p, 650, 4500);
  await wait(p, 3500);
});
await shot("s8-creative", async (p) => {
  await open(p, "learn/narrated-product-film-flow.html#failed");
  await wait(p, 4500);
  await open(p, "learn/narrated-product-film-flow.html#result");
  await wait(p, 800);
  const v = p.locator("video").first();
  await v.evaluate((el) => {
    el.muted = true;
    return el.play();
  });
  await wait(p, 9500);
});
await shot("s9-close", async (p) => {
  await open(p, "learn/");
  await wait(p, 4000);
  await glide(p, 500, 2500);
  await open(p, "");
  await toSection(p, ".cta-final");
  await wait(p, 6000);
});
await shot("tour-agentops", async (p) => {
  await replay(p, terminal, 45);
  await wait(p, 2000);
});
await browser.close();
