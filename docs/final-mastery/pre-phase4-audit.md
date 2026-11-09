# Pre-Phase 4 integration and release audit

Audit: 9 November 2026 (Europe/Brussels). Read this with the linked GitHub PR/check receipts. This is an engineering release review, not an independent security certification. No paid ElevenLabs generation/evaluation, credit purchase, npm publication, external article, application or upstream submission was performed.

## Stable release, Git and integration scope

Latest stable release remains [HarborVoice v2.1.0](https://github.com/phlppgdfry/harborvoice-ai/releases/tag/v2.1.0), targeting `a5b7c206114772129253391c62be22d1bee81dba`. No new release/tag is created by this consolidation. Origin was fetched before inspection; recorded branch heads were confirmed rather than assumed.

| Worktree                        | Branch                             | Audited original HEAD                                  | Initial modifications    |
| ------------------------------- | ---------------------------------- | ------------------------------------------------------ | ------------------------ |
| `harborvoice-ai`                | `main`                             | `a5b7c20`                                              | None                     |
| `harborvoice-phase3`            | `feat/elevenlabs-ecosystem-phase3` | `f8a2a40`                                              | None                     |
| `harborvoice-production-review` | `production/persistent-runtime`    | `234281a`                                              | None                     |
| `harborvoice-integration`       | `integration/pre-phase4-audit`     | Isolated from Phase 3 HEAD, whose base is current main | New audit-owned worktree |

Other local/remote branch `feat/recognition-v2.1` also points to `a5b7c20`. Existing worktrees, branches, private credentials, native resources and budget holds are preserved. No reset, force-push, rebase or production-branch merge was performed. Test-generated historical screenshots/reports were archived privately and only this audit's generated copies restored to their committed originals.

The full 85-file Phase 3 change was reviewed: toolkit implementation/tests, static app, benchmark generator/corpus/results, workshop, contribution example, all five technical articles and governance/release documentation. Large benchmark outputs were checked through reproducible generation and invariant validation. Source integration includes:

- AgentOps Kit v0.1.0 candidate: configuration inspection/redaction/fingerprints, diffs, conservative budget proposals, bounded explicit SDK submit/read adapter, reporting and Node CLI.
- AgentProof v0.1.0 local static pilot: filters, failure trace, comparison, exports, methodology and local feedback. It remains separate from the HarborVoice app and has no public route/deployment in this change.
- 110 unique synthetic contracts in 11 categories, baseline 80/110 and corrected fixture 110/110. Category-driven fixtures demonstrate the reporting pipeline; they do not measure real agent reliability. Historical six-case/1,946-credit provider evidence remains separate.
- Belgian workshop with eight starter tests, five-test upstream example proposal, five editorial articles and launch drafts. No event, participant results, external PR or publication is claimed.
- Active secret-free `.github/workflows/phase3.yml`, root convenience commands, explicit Phase 3 formatting check and configurable `AGENTPROOF_URL` so existing previews need not be stopped.

Main currently has no GitHub branch protection (API returns “Branch not protected”); this audit enforces the check gate explicitly. Consider owner-approved protection as follow-up. Gitleaks scanned the Phase 3/integration commit range (~1.10 MB; eight commits at the final rescan) with no findings; this is a scoped scan, not a guarantee.

[Integration PR #2](https://github.com/phlppgdfry/harborvoice-ai/pull/2) targets main and must have both existing Verify and Phase 3 offline verification green at its final HEAD before merge. Both workflows passed on reviewed parent `b6ed82f` ([Verify](https://github.com/phlppgdfry/harborvoice-ai/actions/runs/42539061638), [Phase 3](https://github.com/phlppgdfry/harborvoice-ai/actions/runs/42539061650)); the same check gate applies to the final documentation update. This document describes that change; GitHub PR state is the authoritative merge receipt. Original Phase 3 reports remain historical, including their earlier statement that CI was only proposed.

## Actual deployments: source and hosting are different

The [GitHub Pages demo](https://phlppgdfry.github.io/harborvoice-ai/) returned HTTP 200. Its pre-integration successful deployment/Verify receipts target `a5b7c20`: [Verify](https://github.com/phlppgdfry/harborvoice-ai/actions/runs/42514468741), [Pages](https://github.com/phlppgdfry/harborvoice-ai/actions/runs/42514601560). Main's existing workflow automatically rebuilds this static demo after successful main Verify. It builds the root app, never AgentProof or the article drafts.

**Material reconciliation finding:** [the existing Vercel public domain](https://harborvoice-ai.vercel.app/) already serves the unmerged production branch. Read-only Vercel inspection identified deployment `dpl_C9wP3SGQr748FqB2ifTt3ruRtnTZ`, target `production`, READY, Git SHA `234281a806150a79b12220d182df3fc9e97534b9`, ref `production/persistent-runtime`. The public alias points to that deployment. `/api/status` reports production mode, PostgreSQL, required operator authentication and disabled guests. This contradicts older prose that promotion is still only a future event; it does **not** prove acceptance or historical owner approval. This deployment pre-existed the audit. No alias, environment, database or promotion was changed here.

Vercel's linked Git production branch is `main`; observed `gitProviderOptions.createDeployments` is `disabled`. Do not assume merging source will synchronize the live Vercel runtime. Preserve its database and current deployment; reconcile actual promotion history with the owner before any further promotion or rollback. AgentProof is tested locally only. A reachable hosted page is not proof of genuine end-to-end voice acceptance. The integration branch’s separate Vercel preview was observed QUEUED, not deployed/accepted. Source-only Phase 3 acceptance uses the existing Verify and new offline workflow; no hosted AgentProof acceptance is claimed.

## Production PR #1: preserve draft; do not merge/promote

[PR #1](https://github.com/phlppgdfry/harborvoice-ai/pull/1), `production/persistent-runtime`, remains draft at `234281a`. Its current GitHub Verify checks are green ([PR run](https://github.com/phlppgdfry/harborvoice-ai/actions/runs/42535885472), [branch run](https://github.com/phlppgdfry/harborvoice-ai/actions/runs/42535880806)); Vercel reports success. These checks support review, not production acceptance.

| Area                 | Evidence and assessment                                                                                                                                                                                                                 | Exact remaining work                                                                                                                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Database             | Dedicated PostgreSQL, verified remote TLS policy, parameterized SQL, singleton JSON workspace, row-lock mutations and advisory-lock initialization. Suitable for explicitly single-owner bounded workspace; not tenant isolation.       | Confirm live least-privilege role, connection capacity, failure/recovery ownership and future normalized schema needs before extending scope.                                                                           |
| Migration            | Additive schema v1, PUBLIC privileges revoked, transactional initialization, corrupt/missing migrated workspace fails closed. SQL file and embedded migration reviewed. Disposable concurrency, rollback/restart and dump/restore pass. | Establish versioned upgrade ownership and drift checks; verify encrypted live backup schedule and restore into a separate recovery database. Disposable restore is not proof of live recovery readiness.                |
| Authentication       | Strong required operator secret, signed Secure/HttpOnly/SameSite cookies, persistent hashed revocations, origin checks and protected workspace. Synthetic production probe returns 401 for anonymous state and 410 for guest lookup.    | Owner accepts single-operator model; define secret rotation, operator recovery, session policy and trusted proxy boundary. No enterprise/multi-tenant authentication claim.                                             |
| Voice                | Server-configured agent, authenticated signed sessions, SDK lifecycle/cancellation/persistence; client transcripts labelled client-reported. CSP uses local audio worklets. Mocked SDK browser lifecycle passes under production CSP.   | Genuine bounded voice smoke, ASR/response audio, stop/mute/cancellation, provider evidence and ended-session persistence; physical microphone and subjective quality acceptance. No paid attempt allowed in this audit. |
| Spending             | Guest trial disabled in production; existing caps and local governors remain.                                                                                                                                                           | Shared atomic account-wide reservation/dispatch coordination is missing; per-instance rate limits are insufficient for an account-wide budget. Approve any future real call separately after reconciliation.            |
| Retention/deployment | Local writes/maintenance prune 30-day transcripts; safe errors and security headers; historical no-call hosted receipt exists. Actual public runtime already uses this draft.                                                           | Schedule idle retention, review provider retention/deletion, verify exact HTTPS origin/protection and current hosted acceptance at final SHA. Resolve the already-promoted draft discrepancy with the owner.            |

A non-destructive `git merge-tree --write-tree` rehearsal of the production candidate with this integration found one content conflict in `package.json` (competing additions to root scripts). Before PR #1 can merge, resolve that conflict by retaining both production verification/migration commands and Phase 3 commands; rerun both CI suites on the combined result. README merges automatically; no existing worktree was changed by the rehearsal.

Fresh hosted no-call acceptance at `2026-11-09T00:15:11Z` could not complete operator sign-in. A diagnostic probe confirmed `/api/health` = 200 / database reachable, but the locally available `.env.operator.local` code returns **401, Incorrect operator access code**. `.env.production.local` contains no operator token. No secret was printed or changed, and no conversation was started. Owner must reconcile the correct current operator credential; the earlier successful hosted receipt cannot substitute for this failed current acceptance.

Recommendation: retain the draft and working branch. Do not automatically merge or promote. The absence of a newly proven code defect does not waive voice, operations, approval and reconciliation gates. Production approval must identify the exact deployment, commit, database, acceptance evidence and rollback target. Do not deploy the older browser-storage main over the current PostgreSQL runtime to make Git and hosting appear aligned.

## ElevenLabs account reconciliation

Fresh SDK read at `2026-11-09T00:00:30.860Z`, corroborating the connector subscription read: **38,776 credits remaining**, used 89,939 of 128,715; extensions disabled, current overage USD 0 and no open invoices. This is a time-bound observation, not spend authorization. [Sanitized account evidence](account-evidence.json) records successful read-only subscription, usage and history requests. Private account identifiers, invoice details, texts, signed links and credentials are omitted.

Starting Phase 3 observation: 65,322. Previously recorded ending observation: 38,776. Difference: **26,546**. Current balance is unchanged from that ending observation.

The workspace-wide hourly usage API reports the following for **8 November, 19:00–20:00 UTC**:

| Product          | Reported credits |
| ---------------- | ---------------: |
| Video Generation |           20,223 |
| Flows            |            3,084 |
| Image Generation |            2,740 |
| TTS              |              499 |
| Total            |           26,546 |

This equality is available billing evidence, **not proof of a job/phase attribution**. The Phase 3 start snapshot falls inside that hour; hourly aggregation, posting times and counter/history semantics are not sufficient to assign the whole delta to a particular session. The one returned speech-history row after the saved start timestamp is a 499-credit Flow record (counter 63,944 → 64,443). It does not explain every counter transition. Speech history excludes music/SFX and is not an exhaustive bill. No invoice-to-job receipt mapping for the creative totals was available. Do not invent delayed billing, another session or Phase 3 as the cause. Phase 3's records contain zero paid calls/reservations/receipts; this audit also initiated zero.

Private ledger inspection found:

- Recognition: 11 operations, nine completed and two failed music operations retaining **2,500 each**. Estimates total 21,700; conservative commitments in its final report are 21,756 because receipt-over-estimate liability is retained. Itemized reported subset is 3,024. No pending status in that ledger; completed without a final receipt is not automatically reconciled.
- Elite: 23 operations, 22 completed and one failed Studio revision retaining **500**. `recognition/prior-ledger.json` duplicates the Elite snapshot; do not count it twice. The final report preserves 9,134.04 uncertain older exposure, 5,000 older buffer, 12,594 Phase 2 exposure and 3,000 Phase 2 buffer. Their conservative combined envelope is 29,728.04; overlap/settlement needs evidence rather than arithmetic release.
- All nine visible Flows were read, including the untitled non-HarborVoice flow: 56 nodes, 23 completed, 30 static assets and three not run. No queued/running node states were returned; existing nodes were completed, static assets or not run. This visible inventory is not proof that all other clients, account scopes, agent tests or delayed charges are absent. Do not retry failed/not-run nodes.

**Available paid authorization remains zero.** Retain all ambiguous liabilities and failed holds. Obtain itemized creative receipts/request IDs, exact posting timestamps and owner confirmation of all spenders; reconcile each ledger operation before releasing any hold. Do not buy credits or treat the remaining balance as a new allowance.

## Verified tests and practical limits

Local Node 24.22.2, pinned root lockfile installed with `npm ci`. Checks executed against isolated source/builds and synthetic databases; local root browsers used port 3190, AgentProof port 4314 and production-CSP fixture port 4190 to preserve existing services.

| Check                                  | Result                                                                                                                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root `npm run check`                   | TypeScript + Vite build; **61/61** tests pass, none skipped                                                                                                                  |
| AgentOps `check`                       | Build/declarations, SDK/test typecheck; **33/33** tests pass                                                                                                                 |
| Workshop + contribution                | **8 + 5** tests pass                                                                                                                                                         |
| AgentProof build/strict TS             | Pass                                                                                                                                                                         |
| Corpus/report invariants               | 110 unique IDs/inputs, 11 categories, baseline 80/candidate 110 passes, explicit fixture evidence and zero fixture cost                                                      |
| Existing browser suites                | Workspace, Academy, Elite/Mastery and Community pass; desktop/mobile, media/download checks; no runtime errors; paid paths mocked                                            |
| AgentProof Chromium                    | **13** checks pass; filters, inspector, comparison, downloads, navigation, labels/keyboard and 390px overflow; no page errors/external requests                              |
| Formatting                             | Root and explicit Phase 3 checks pass after formatting normalization                                                                                                         |
| Existing assets/publication validation | **87** hashes verified; recognition showcase validation and five older workshop tests pass                                                                                   |
| Dependencies                           | `npm audit --json`: **0** vulnerabilities including development dependencies at observation time                                                                             |
| Local package smoke                    | `npm pack` only; unpacked CLI runs with Node and no installed dependencies; static app ZIP built locally, nothing published                                                  |
| Production candidate                   | Build + **62 pass, 1 explicitly skipped** default test; separate Docker PostgreSQL run **2/2**, none skipped, actual dump/restore pass                                       |
| Production browser fixture             | Pass against PR #1 build with production CSP; mocked provider transport, no live audio claimed                                                                               |
| Resource references                    | Two authenticated agent branches, four knowledge documents and three saved voices reachable; eight HarborVoice Flow references preserved ([receipt](resource-evidence.json)) |

Docker was initially unavailable; after starting the existing Docker app the disposable PostgreSQL suite and restore passed. Failed checks against an occupied/wrong preview port were corrected and rerun against explicit isolated ports. They are not counted as successful acceptance evidence. Existing large voice-bundle warning remains; no unnecessary runtime rewrite is included. DOM accessibility checks are scoped; no full WCAG/screenreader or independent penetration audit is claimed. Configuration reachability does not prove full live drift parity.

## Remaining capability, template and Studio gaps

The historical [119-capability matrix](../elite/capability-matrix.md) is evidence from its dated execution, not a fresh assertion that every current provider feature was exercised. Preserve the distinctions between verified, planned, permission blocked and plan restricted. Phase 4 should reconcile that inventory rather than repeat prior masterprompts.

- Durable distributed reservation/dispatch fencing, crash recovery and provider receipt importer are missing from AgentOps Kit. Its guard interface is an integration contract, not implemented account-wide coordination. Native test mapping remains manual and submit/read is mock-tested only.
- No balanced, independently annotated multilingual holdout, tool-argument/semantic-grounding assertions, real-user pilot, measured voice latency or microphone evaluation. Current synthetic pass counts cannot establish those outcomes.
- Standalone TTS/dialogue WebSocket, Realtime and other planned surfaces remain unverified where the matrix says so. Enterprise/Pro restrictions, cloning/identity consent, telephony and external-channel permissions remain separate gates. Do not upgrade plans or clone real people as consolidation work.
- Generic launch/campaign templates remain incomplete. The private learning template exists but contains misleading/gibberish visual labels; fix visual/thumbnail and simplify inputs before public Explore submission. Native factories and finished films do not substitute for reusable template acceptance.
- Studio API access was historically 403/allowlisted; no permission bypass or new generation was attempted. Earlier Elite prose about an old source cut is superseded by [Recognition source-replacement evidence](../recognition/studio-reconciliation.json): direct upload/source substitution was verified, existing captions preserved. **Caption timing/content review remains pending**; lossless native round-trip synchronization is unsupported by the used interfaces. Keep the native project intact.
- EPUB structural checks pass; full EPUBCheck, qualified editorial review, rights and byline approval remain. Music listening/rights/actual Marketplace publishing-path review remains.

## External opportunities and required owner decisions

Prepared opportunities: upstream ElevenLabs examples/Showcase contribution, five articles/social/video drafts, Ambassador Community Builder/Content Creator application, volunteer AgentProof pilot, Belgian workshop, ElevenReader manuscript and music Marketplace review. No submission, registration, publication, attendance or endorsement is claimed. Verify current program/event rules at the point of a future approved submission; the earlier Ghent listing did not establish a 2026 event date. LinkedIn connection/profile actions remain owner-controlled.

Owner decisions required before dependent actions:

1. Reconcile the **already public production draft** and its approval/promotion history. Approve a specific future merge/promotion only after voice, backup/recovery, retention, exact-origin/security and rollback acceptance.
2. Supply account-wide job/receipt evidence and approve any later bounded paid validation after safe spending coordination exists. No paid allowance is inferred from this mission.
3. Approve public AgentProof hosting/recruitment and a real private consent/deletion contact before user research.
4. Separately approve npm publication, upstream PRs, articles/social posts, program applications, workshop commitments, Reader/Marketplace/Explore submissions and relevant identity/rights terms.

## Prioritized Phase 4 backlog and start decision

| Priority | Concrete outcome                                         | Gate/evidence                                                                                                                                                               |
| -------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Reconcile Git versus the already-promoted Vercel draft   | Owner confirms current deployment authority; preserve database and rollback revision                                                                                        |
| P0       | Account-wide cost accounting and atomic dispatch service | Itemized creative receipts, retained holds, competing-client inventory, fencing/crash tests; spending stays disabled                                                        |
| P0       | Production acceptance package                            | Correct owner-provided operator access, current hosted no-call checks, backup/restore and retention evidence, then separately approved bounded real voice/device acceptance |
| P1       | Native test/receipt import with provenance               | Mocked malformed/missing/partial receipt cases; unknown costs stay unknown                                                                                                  |
| P1       | Independent multilingual evaluation design               | Balanced holdout, argument/grounding assertions, qualified annotations; offline preparation first                                                                           |
| P1       | Repair native template visuals and Studio captions       | Owner-reviewed timing/content/thumbnail acceptance; no automatic regeneration                                                                                               |
| P2       | Approved volunteer pilot and workshop                    | Real consent/contact, approved hosting/date/costs, actual task evidence                                                                                                     |
| P2       | Publication review                                       | Rights/byline/editorial review, upstream scope validation, separate owner authorization                                                                                     |
| P3       | Broaden capabilities/performance                         | Prioritize demonstrated product need; current plans/permissions and budget review before paid work                                                                          |

**Masterprompt 4 can begin safely for scoped, offline engineering and acceptance preparation after the integration PR's required checks pass.** Production promotion, public pilot/publications and paid generations remain blocked by the listed evidence and owner gates. This is a verified source foundation, not a declaration of production mastery or permission to repeat expensive earlier phases.
