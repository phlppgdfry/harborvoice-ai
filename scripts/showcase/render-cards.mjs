// Renders the demo video's title and end cards as 1920x1080 PNGs with the site fonts.
// Usage: node scripts/showcase/render-cards.mjs <out-dir>
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const out = process.argv[2];
if (!out) throw Error("Usage: render-cards.mjs <out-dir>");
const font = (f) =>
  `data:font/ttf;base64,${readFileSync(`public/showcase/fonts/${f}`).toString("base64")}`;
const page = (body) => `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Manrope;src:url(${font("Manrope.ttf")})}
@font-face{font-family:DM;src:url(${font("DMSans.ttf")})}
html,body{margin:0;width:1920px;height:1080px}
body{display:grid;place-items:center;text-align:center;color:#e6f1f0;font-family:DM;
background:radial-gradient(1100px 600px at 85% -10%,rgba(119,215,208,.2),transparent 60%),radial-gradient(800px 500px at 0 110%,rgba(224,169,75,.14),transparent 60%),linear-gradient(#0b1f2a,#12303f)}
.mark{width:96px;height:96px;margin:0 auto 34px}
h1{font:800 104px/1 Manrope;letter-spacing:-.03em;margin:0;color:#fff}
h2{font:700 48px/1.2 Manrope;letter-spacing:-.02em;margin:28px 0 0;color:#77d7d0}
p{font-size:32px;color:#a9c6c6;margin:34px 0 0}
small{display:block;font-size:26px;color:#8eaab0;margin-top:14px}
</style><div>${body}</div>`;
const mark = `<svg class="mark" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#163747"/><path d="M16 20v24m10-32v40m12-36v32m10-24v16" stroke="#77d7d0" stroke-width="5" stroke-linecap="round" fill="none"/></svg>`;
const browser = await chromium.launch({ channel: "chrome" });
const tab = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const cards = {
  intro: `${mark}<h1>HarborVoice AI</h1><h2>Voice intelligence with evidence and human control</h2><p>A three-minute walkthrough · real screen recordings</p>`,
  outro: `${mark}<h1 style="font-size:72px">phlppgdfry.github.io/harborvoice-ai</h1><h2>Demo · AgentProof · Learn · Source on GitHub</h2><p>Independent project · not affiliated with ElevenLabs · synthetic data</p><small>Narration: ElevenLabs text-to-speech · Music: original Eleven Music tracks</small>`,
};
for (const [name, body] of Object.entries(cards)) {
  await tab.setContent(page(body), { waitUntil: "load" });
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: `${out}/${name}.png` });
}
await browser.close();
console.log("cards rendered");
