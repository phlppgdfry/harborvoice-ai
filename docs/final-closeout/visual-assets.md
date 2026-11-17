# Visual assets

All footage is recorded by an automated Chrome session driving the real pages (`scripts/showcase/record-media.mjs`); nothing is mocked or composited into the UI. Terminal shots replay command output captured immediately before recording, and are labelled “replay of real command output” in the window title.

| Asset                       | File                                          | Size   | What it shows                                                                |
| --------------------------- | --------------------------------------------- | ------ | ---------------------------------------------------------------------------- |
| Hero screenshot             | `public/showcase/img/workbench.jpg`           | 135 KB | Workbench overview, 2× capture of the static demo                            |
| Social preview              | `public/showcase/img/og-cover.jpg`            | —      | 1200×630 render of the landing hero                                          |
| Demo A · question to review | `public/showcase/media/clip-workflow.mp4`     | 504 KB | Scripted text demo → escalation → operator approval → shipment unchanged     |
| Demo B · AgentProof         | `public/showcase/media/clip-agentproof.mp4`   | 740 KB | Search `tool-error-01`, read the failure, switch to the corrected fixture    |
| Demo C · AgentOps Kit       | `public/showcase/media/clip-agentops.mp4`     | 400 KB | Starter tests, config diff, validation failing with exit 2 (replayed output) |
| Demo D · Creative Flow      | `public/learn/media/product-film-example.mp4` | 6.4 MB | The verified 8 s narrated film from the repaired Flow                        |
| Posters                     | `public/showcase/media/clip-*.jpg`            | —      | First meaningful frame of each clip                                          |

Clips are H.264 MP4 at 1280×800, 25 fps, no audio, `faststart`. GIF versions were not made: MP4 is 5–10× smaller at the same quality and every target browser plays it.

Re-record: build the Pages layout (`VITE_STATIC_DEMO=true npm run build && npm run build:pages`), serve `dist/`, capture terminal output to JSON, then `node scripts/showcase/record-media.mjs <url> <terminal.json> <out-dir>`.
