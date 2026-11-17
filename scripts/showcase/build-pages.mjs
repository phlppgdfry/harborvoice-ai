// GitHub Pages only: put the showcase landing page at the site root and move the
// app to app.html. The Vercel build and `npm run build` are not affected.
import {
  copyFileSync,
  existsSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";

if (!existsSync("dist/index.html")) throw Error("Run the Vite build first.");
if (existsSync("dist/app.html"))
  throw Error("dist/app.html already exists; rebuild from clean.");
renameSync("dist/index.html", "dist/app.html");
copyFileSync("site/index.html", "dist/index.html");
const app = readFileSync("dist/app.html", "utf8");
if (!/<div id="root">/.test(app))
  throw Error("dist/app.html is not the app shell.");
writeFileSync(
  "dist/app.html",
  app.replace(
    "<title>HarborVoice AI · Voice operations</title>",
    "<title>HarborVoice AI · Demo workspace</title>",
  ),
);
console.log("Pages layout: showcase at /, app at /app.html.");
