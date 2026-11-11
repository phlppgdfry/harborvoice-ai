// Offline check of the public Learn pages: local links, anchors, media and basic page rules.
// No network. Run: node scripts/creative-community/validate-learn.mjs
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = "public/learn";
const pages = readdirSync(root).filter((f) => f.endsWith(".html"));
const errors = [];
const ids = new Map();
for (const page of pages) {
  const html = readFileSync(join(root, page), "utf8");
  ids.set(
    page,
    new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])),
  );
}
for (const page of pages) {
  const html = readFileSync(join(root, page), "utf8");
  const fail = (message) => errors.push(`${page}: ${message}`);
  if (!/<html lang="en">/.test(html)) fail("missing lang attribute");
  if (!/<meta name="viewport"/.test(html)) fail("missing viewport meta");
  if ((html.match(/<h1[\s>]/g) || []).length !== 1)
    fail("needs exactly one h1");
  if (!/not affiliated with/.test(html)) fail("missing independence statement");
  if (!/AI (coding )?assist/i.test(html))
    fail("missing AI-assistance disclosure");
  if (
    /https?:\/\/fonts\.|googletagmanager|google-analytics|plausible\.io|<script src="http/.test(
      html,
    )
  )
    fail("external font, script or analytics reference");
  if (/sk_[a-zA-Z0-9]{20,}|xi-api-key\s*[:=]\s*["'][^"']+/.test(html))
    fail("credential-shaped text");
  for (const m of html.matchAll(/<img\b[^>]*>/g))
    if (!/\salt="[^"]+"/.test(m[0]))
      fail(`image without alt text: ${m[0].slice(0, 60)}`);
  for (const m of html.matchAll(/\s(?:href|src|poster)="([^"]+)"/g)) {
    const target = m[1];
    if (/^(https?:|mailto:)/.test(target)) continue;
    const [path, hash] = target.split("#");
    if (path === "" && hash) {
      if (!ids.get(page).has(hash)) fail(`missing anchor #${hash}`);
      continue;
    }
    // "../" and "../agentproof/" are produced by the site build, not by this folder.
    if (path === "../" || path === "../agentproof/") continue;
    const file = path.endsWith("/") ? join(path, "index.html") : path;
    const full = resolve(dirname(join(root, page)), file);
    if (!existsSync(full)) fail(`missing local target ${target}`);
    else if (
      hash &&
      file.endsWith(".html") &&
      !ids.get(file.split("/").pop())?.has(hash)
    )
      fail(`missing anchor ${target}`);
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `Learn pages valid: ${pages.length} pages, local links, anchors and media present.`,
);
