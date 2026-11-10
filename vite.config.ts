import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
export default defineConfig({
  plugins: [
    react(),
    {
      name: "public-build-provenance",
      generateBundle() {
        const commit = execFileSync("git", ["rev-parse", "HEAD"], {
          encoding: "utf8",
        }).trim();
        const { version } = JSON.parse(readFileSync("package.json", "utf8"));
        this.emitFile({
          type: "asset",
          fileName: "build-info.json",
          source: JSON.stringify({ commit, version }) + "\n",
        });
      },
    },
  ],
  base: "./",
  server: { host: "127.0.0.1", proxy: { "/api": "http://127.0.0.1:3100" } },
});
