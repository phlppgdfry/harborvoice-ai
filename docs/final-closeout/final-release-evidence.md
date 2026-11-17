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

Recorded after merge and release: merge commit, CI on main, Pages deployment and its `build-info.json`, live URL checks, release tag and asset hashes.
