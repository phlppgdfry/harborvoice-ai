# Final release evidence

## Source and integration boundaries

- Audited remote Main baseline: `361808d690a3d944f67be387d2680ccc7f9408b1`.
- Dedicated worktree: `harborvoice-excellence`; branch `final/elevenlabs-excellence`.
- Phase-5 source integrated by a non-destructive branch merge: `b162f73c17b47f489e9d17c9dca2403646625701`.
- Current live persistent Vercel source: `234281a806150a79b12220d182df3fc9e97534b9`; preserved.
- Separate production draft PR #1: `ae15f1f99e4677d6eeea1d86f80b4b183c4ec8a6`; not merged or promoted.
- Existing release `v2.2.0-rc.1` remains a prerelease; no stable production label is justified by this audit.

Final delivery SHAs, PR/CI state and public-deployment verification are recorded in the post-commit machine receipts alongside this file. Local checks performed before committing necessarily test the working tree; exact GitHub CI is the evidence for a committed release. No self-referential claim that a commit contains its own final hash is made.

## Executed verification

| Check                        | Observed result                                                                                                | Scope                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Root build and tests         | Build passes; 63/63 tests                                                                                      | Includes two new consumption-freeze regressions                              |
| AgentOps package             | Build/declarations; 40/40 tests                                                                                | Local official-SDK structural compatibility; no paid tests                   |
| Phase-3 pipeline             | 13/13 combined starter/contribution tests; benchmark/contract invariants; AgentProof build                     | 110 fixtures and 12 contracts are deterministic evidence                     |
| Recognition starter          | 5/5 tests                                                                                                      | Offline learning example                                                     |
| Registered assets            | 89 hashes                                                                                                      | EPUB entry corrected after phase-5 integration                               |
| Local audio/video            | 67/67 full probes and decodes                                                                                  | Codecs/duration/dimensions; no human listening claim                         |
| Final EPUB                   | EPUBCheck 5.4.0: zero fatal/error/warning                                                                      | Exact checked final import file                                              |
| Chrome product walkthrough   | Desktop 1440px plus 390/360px, keyboard, filtering, empty state, comparison, exports and existing media access | Screenshots inspected; no external requests in final checked flow            |
| Dependency audit             | Zero known vulnerabilities                                                                                     | Root lockfile at observation; no security guarantee                          |
| Secret scan                  | Zero findings in supplied source/report paths                                                                  | Redacted Gitleaks; not formal penetration testing or every historical branch |
| Production candidate copy    | Build; 62 pass/1 PostgreSQL skip                                                                               | Detached checkout, existing candidate source untouched                       |
| Explicit PostgreSQL campaign | 2/2, zero skips; real disposable dump/restore pass                                                             | New synthetic local container; no production database                        |
| Provider/hosting audit       | Fresh subscription/resources/branch/version/invocation metadata; production 200/401 boundaries                 | GET/read-only; no new paid dispatch                                          |

The first sandbox root check failed because tsx could not create an IPC pipe; rerun outside the sandbox passed. The first integrated asset check found the stale EPUB hash and was corrected. The first browser campaign found real external font requests and failed its network-isolation assertion; local font delivery fixed it and the repeated campaign passed. These failures were not hidden or relabeled successes.

## Reproduction

Run `npm ci`, `npm run check`, `npm run phase3:verify`, `npm run elite:validate`, and `npm run recognition:validate` with Node 24. Native reads require an existing server-side credential; `scripts/final-excellence/readonly-audit.mjs` submits GETs only. Documentation and media scripts are bounded read-only/local audits. `scripts/final-excellence/browser.mjs` expects a static build on port 4416 and installed Chrome. Do not run legacy generation scripts to reproduce these checks.

Existing installed dependencies were reused via ignored symlinks for this isolated worktree; no packages were reinstalled or silently upgraded. GitHub CI uses a clean installation and verifies the lockfile separately. Generated benchmark timestamp/commit churn from local checks is excluded from the deliverable; original evidence receipts remain historical.

## Final acceptance

Public synthetic software/demo: suitable with limitations. General production reliability, physical voice acceptance, global liability reconciliation, native Product Launch fidelity and Music publishing route: open. External Explore/Reader/GitHub review is pending and is not a technical failure. No new npm publication, production migration, production deployment, legal acceptance or official-recognition claim.
