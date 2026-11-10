# Final technical audit

Audit date: 10 November 2026, Europe/Brussels. This is a scoped engineering review, not penetration testing, legal assurance or an ElevenLabs certification.

## Release decision

The public synthetic demonstration and reusable tooling are suitable for professional review with their stated limitations. Unrestricted enterprise production acceptance remains blocked. Keep production PR #1 in draft and preserve the deployed PostgreSQL runtime until its operational acceptance is complete.

## Findings and corrections

| Finding                                                                                                           | Severity / disposition                         | Evidence and action                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local credit governor allowed another reservation after unexplained consumption exceeded all recorded commitments | High for further paid execution; fixed locally | `reserve` now stops when observed consumption exceeds commitments, or a provider receipt exceeds its own reservation. Reporting and receipts remain available; holds are retained. Two regressions cover both cases. This is still a local guard, not distributed fencing. |
| Public portfolio falsely said existing submissions had not been made                                              | Medium; corrected                              | Community Studio and Portfolio now distinguish two Explore submissions, Reader review, Showcase #113 and SDK #484 from acceptance. Phase-5 evidence integrated without duplicate submissions.                                                                              |
| Final phase-5 EPUB was absent from the expected asset hash                                                        | Release blocker; corrected                     | Updated only the reviewed EPUB entry. 89 asset hashes verify; new EPUBCheck 5.4.0 reports zero errors/warnings.                                                                                                                                                            |
| Portfolio automatically requested Google Fonts                                                                    | Privacy/reproducibility improvement; corrected | Existing DM Sans/Manrope font families now load locally with OFL notices and hashes. Repeated browser walkthrough sees no external requests.                                                                                                                               |
| AgentProof retained a selected scenario after filtering it out                                                    | Usability; clarified                           | A status notice explains that the selected detail remains visible for comparison. Fixture scores remain separate from provider evidence.                                                                                                                                   |
| Current live native version is not the version in the historical test receipts                                    | Acceptance limitation; open                    | Live Main is `agtvrsn_9601m6xjw36beketcgn7tzzze8zb`. Historical invocations identify other exact versions. A successful old suite cannot validate the current live configuration by inference.                                                                             |
| Account liabilities cannot be fully settled per job                                                               | Paid dispatch blocker; open                    | Known Flows and test invocations are terminal, but there is no complete account-wide job enumeration or settlement record. Operational spending cap remains zero.                                                                                                          |

## Production architecture

The official authenticated Vercel GET confirms deployment `dpl_C9wP3SGQr748FqB2ifTt3ruRtnTZ`, READY, production alias `harborvoice-ai.vercel.app`, Git SHA `234281a806150a79b12220d182df3fc9e97534b9`, from `production/persistent-runtime`. The current draft PR head is separately `ae15f1f99e4677d6eeea1d86f80b4b183c4ec8a6`; they are not interchangeable.

Fresh anonymous requests: `/api/status` 200 with PostgreSQL and required operator authentication; `/api/state`, `/api/conversations`, `/api/agents` each 401, with `no-store`. This checks exposure boundaries, not a full signed-in or physical-voice journey. Deployment Git auto-publication remains disabled; the exact-commit Verify gate remains present. Main is a static/demo development line, not a replacement for the persistent production branch.

A detached copy of draft PR #1 at `ae15f1f` builds; default tests: 62 pass, one PostgreSQL skip. Its explicit disposable PostgreSQL campaign passes 2/2 with no skips and a real `pg_dump`/`pg_restore` round trip. No production migration, backup, retention run, deletion or promotion was performed. A disposable database restore does not establish live recovery readiness.

Remaining production gates: live backup/recovery acceptance, retention schedule and evidence, authorized local/provider deletion, operator responsibility, provider privacy/DPA decisions, physical microphone/playback/interruption/network-recovery acceptance, and baseline-to-current-version agent regressions. Keep access controls and rollback references intact.

## Security and privacy scope

The application has operator-session, input-validation, upload-limit, guest-limit, auth-boundary and synchronization tests. AgentOps requires an injected account-wide guard for native paid suites, has no default paid CLI route, deduplicates dispatch and retains ambiguous receipts. These controls are not multi-tenant certification.

Root dependency audit: zero known vulnerabilities at the recorded observation. Gitleaks returned zero findings for the explicitly supplied application/source/report paths; this is not a guarantee about every historical branch or private environment file. Existing secrets stayed in their original server-side files. The older `.env` credential returned 401; `.env.local`, which the application gives precedence, returned 200. No key was printed, copied into the checkout or rotated.

Public demonstration data are fictional. Provider transcripts, audio, hosting logs and downloaded exports have different retention/deletion responsibilities. The operational privacy draft remains [here](../final-mastery/privacy-retention.md); no legal compliance claim is made. Font self-hosting removes an automatic third-party request from the public build, not all transfers from authorized live voice use.

## Reproducibility

See [release evidence](release-evidence.md), [browser receipt](browser-verification.json), [provider GET receipt](provider-readonly.json), [native audit](native-resource-audit.json), [production deployment](production-deployment.json) and [credit report](credit-optimization-report.md). The latest exact GitHub CI/deployment receipts supersede local dirty-worktree checks for published-commit provenance.
