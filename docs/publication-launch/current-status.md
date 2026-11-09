# Publication launch — authoritative state ledger

Audit started 2026-11-09, UTC. Base: HarborVoice `361808d` (current origin/main), latest prerelease v2.2.0-rc.1. The original main checkout at a5b7c20 is stale and has been preserved. Work is isolated on feat/publication-launch.

| Resource                          | Exists / validation                                                                                                                             | Submission reconciliation                                                             | Remaining work                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Learning DkSzGeLnRPG557cTaRSf     | Live Flow read succeeded; completed nodes. Phase 4 receipt documents repaired private template, two inputs, three outputs and corrected diagram | Last verified native publishing state PRIVATE; current Explore state not yet observed | Native browser access, preview and Explore review                                    |
| Product 04Y2ZUoBsV1BQj9uMv9k      | Existing commercial factory; not yet a generic template                                                                                         | No template submission established                                                    | Implement reusable input/output contract and validate example                        |
| Multilingual autfYixTUdY8eSnjlDOb | Existing localization factory; not yet a generic template                                                                                       | No template submission established                                                    | Implement configurable source/languages and validate example                         |
| Three music tracks                | Local media, provenance hashes and private native review assets exist                                                                           | Historical NOT SUBMITTED; current native Marketplace state unverified                 | Verify original native-history eligibility, human listening and contractual approval |
| Reader book                       | Completed 6,184-word book; matching EPUB has prior official EPUBCheck pass                                                                      | Historical NOT SUBMITTED; no current dashboard draft established                      | Editorial audit, dashboard access and owner byline/terms approval                    |
| Showcase                          | Three-file fork branch add/harborvoice-final-mastery, 7030340; upstream head 870ee29c unchanged                                                 | Live authenticated user PR search: zero PRs in elevenlabs/showcase                    | Run upstream checks, submit one PR                                                   |
| OSS example                       | Historical five-test proposal exists; current upstream cloned                                                                                   | Live authenticated user PR search: zero PRs in elevenlabs/examples                    | Adapt to current prompt/setup/example structure, test, submit one PR                 |

Browser evidence: tab selection and creation fail with `Cannot read properties of undefined (reading 'timeoutMs')`; native Chrome initially returned a tree, then rejected actions as application changed and now returns an empty accessibility tree. No successful publication action is inferred. Connector capability discovery confirmed no template/Marketplace/Reader publisher or account-balance tool.

Live balance at 2026-11-09T16:59:07Z: **35,157 available**, 93,558 used / 128,715, Creator, credit extension disabled. Unchanged from the Phase 4 final snapshot. No credit-consuming call has been dispatched in this phase. Historical reservations remain retained; no holds released.

Per-workstream reports and submission-tracker.md will record final observed states. Submitted, accepted, merged and publicly listed are separate observations.

## Final reconciled state — 2026-11-09T17:10:34Z

The final [nine-resource tracker](submission-tracker.md) supersedes the initial “remaining work” column above.

- Showcase: actually submitted as [PR #113](https://github.com/elevenlabs/showcase/pull/113), OPEN/non-draft; no human reviews. CI is not passing: workflow startup failure, action_required and Vercel team authorization. Local content/build/lint/format checks pass; standalone upstream type errors are identical on baseline.
- OSS: complete original example at fork commit `67ccb011ed7bebe8bd9d7967abfbf0083cb5a03a`; 14 tests, clean setup and repository lint/format pass. Correct fork relationship and one-commit diff verified. Actual upstream PR creation denied by GraphQL and REST; no PR exists.
- Learning: repaired local preview/quiz/diagram reviewed; current native sharing screen inaccessible. No Explore submission in this execution. Product and multilingual factories read live; generic contracts remain incomplete and no paid validation was authorized.
- Music: all three original/master hashes and native uploads match; fresh full decodes pass. API-origin eligibility is unverified, subjective listening approval absent, no native draft created, no commercial terms accepted.
- Reader: complete editorial source review; 6,251-word revised manuscript and new EPUB (`d2a8cc918101141539999581c60831f83bcab336b94971c7cc122b2d0fe52084`) pass official EPUBCheck with zero issues. Native draft/format/audio preview inaccessible, byline/rights/terms unapproved, no submission.
- Current balance: 35,157 available, 93,558 used / 128,715 at 17:10:34Z. Zero new paid dispatches, no account delta, no reservations released. Global pending-job state cannot be enumerated by available tools; historical ledgers record zero pending at their own closeout.

This phase is **partially delivered**, not five successful publications. Browser access and GitHub repository permission barriers are concrete; restoring them and completing the remaining quality/legal gates is still required.
