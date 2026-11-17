# Final release evidence

## Pre-merge (branch `feat/final-closeout`, PR #10)

| Check                          | Result                                                               |
| ------------------------------ | -------------------------------------------------------------------- |
| `npm run format:check`         | pass                                                                 |
| `npm run check`                | 65 tests: 64 pass, 0 fail, 1 PostgreSQL case (run separately in CI)  |
| `npm run learn:validate`       | 5 pages valid; 3 answer-key tests pass                               |
| `npm run recognition:validate` | 5 pass                                                               |
| `npm run phase3:verify`        | 40 AgentOps + 13 starter/contribution tests pass                     |
| `npm run elite:validate`       | pass (publication rules, asset hashes)                               |
| `npm audit --audit-level=high` | 0 vulnerabilities                                                    |
| Gitleaks on staged changes     | no leaks                                                             |
| Browser QA (`qa-site.mjs`)     | 46 checks, 0 problems; Chrome + WebKit; Firefox not launchable here  |
| Performance (local, Chrome)    | landing: 13 requests, 235 KB desktop / 395 KB mobile, layout shift 0 |

## Repository settings (applied 17 November 2026)

- Dependabot vulnerability alerts: **on**. Dependabot security updates: **on**.
- Branch protection on `main`: required checks `verify` and `phase3`, force-push and deletion blocked, **not enforced for admins** (owner cannot be locked out), no required reviews (solo project).
- Actions permissions unchanged: `contents: read` by default; Pages adds `pages: write`, `id-token: write`.

## Post-merge

| Item              | Value                                                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PR #10            | merged 2026-11-17 02:43 UTC, merge commit `7acf4b2ada9450dd80cb41b6b8d86e537e522a2e`                                                                                     |
| CI on `7acf4b2`   | Verify, Phase 3 offline verification and Publish demo: all success                                                                                                       |
| Pages deployment  | live `build-info.json`: commit `7acf4b2ada9450dd80cb41b6b8d86e537e522a2e`, version `2.2.1`                                                                               |
| Live URL check    | 27 URLs (landing, app, AgentProof, Learn, showcase CSS/JS/images, clips, film, captions): all HTTP 200 — [live-verification.json](live-verification.json)                |
| Live browser QA   | Chrome + WebKit against the live site: 45 checks, 0 problems; redirect, tabs, motion pause, film (174 s, 1 caption track) — [qa/site-qa-live.json](qa/site-qa-live.json) |
| Vercel production | unchanged: `dpl_C9wP3SGQr748FqB2ifTt3ruRtnTZ`, commit `234281a`; `git.deploymentEnabled=false` kept                                                                      |

## Release v2.2.1

<https://github.com/phlppgdfry/harborvoice-ai/releases/tag/v2.2.1> — published 2026-11-17 02:49 UTC, not a draft or pre-release. The tag points to `7acf4b2ada9450dd80cb41b6b8d86e537e522a2e`, the tested merge commit. Artifacts were built from that exact commit.

| Asset                              | SHA-256                                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------------------- |
| harborvoice-agentops-kit-0.2.0.tgz | `483d1f2ce4b46e4e90fb2acee1a6db29940fab7e4506e461f9614ddb42e6d371` (identical to v2.2.0) |
| harborvoice-agentproof-v2.2.1.zip  | `317d962644a16249c7d06c236bd31de914ac9f8742c7646c00782ef1764e1fae`                       |
| harborvoice-pages-site-v2.2.1.zip  | `72fd2db7fab1bed2a4cfce1d8a81996d8c091cb210497683256b3903851e8c98`                       |
| harborvoice-demo.mp4               | `e4963d045678175172b0bca4967b005fd2d064f0e76a73383121fa253e6719c2`                       |
| harborvoice-demo.vtt               | `0a19deeed1452c989d8873c0dd98028de3098df5abbebffe9bcde0c3a6b2ffd4`                       |
| harborvoice-demo.srt               | `3e670392a3928683dd2d13ee9206f3f7199a804b63447773d3b61f22ae8d18ad`                       |
| harborvoice-preview.mp4            | `8fb4e3a4bd5108a5fdeac9c74f6868feb77bb764f2b269362f85e4ddecd226d8`                       |

Independent check: all eight assets downloaded anonymously with `gh release download`; `shasum -a 256 -c SHA256SUMS` reports OK for all seven listed files. The pages-site zip leaves out the large media folders, which are in the repository and on the live site.

This release covers the public showcase, demo and developer tools. It is not a production acceptance.

## After the release

- Dependabot PR #11 (Pillow 11.3.0 → 13.0.0 in `scripts/elite/requirements.txt`, security update): CI green; the three offline media scripts only use `Image.new`, `Image.frombytes`, `ImageDraw.Draw` and `ImageFont.truetype`, all checked against Pillow 13.0.0 in a clean virtualenv. Merged as `703bfb6`. No app or runtime code is affected.
- Branches deleted after a 0-unmerged-commit check: `feat/final-closeout`, `dependabot/pip/scripts/elite/pillow-13.0.0`. Remaining remote branches: `main`, `production/persistent-runtime`.
