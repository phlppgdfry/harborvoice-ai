# Complete source-of-truth inventory

Audit date: 10 November 2026. [Machine-readable inventory](complete-inventory.json) contains every required field. Source commits below distinguish baseline, phase-5 changes, deployed production and external forks. Phase-6 delivery commits are separately recorded in [release evidence](release-evidence.md). VERIFIED COMPLETE is used only for a bounded demonstrated scope, never to imply full production acceptance.

Prior reports actually located and read: `docs/elite/release-report.md`, `docs/recognition/final-report.md`, `docs/phase3/execution-report-nl.md`, `docs/final-mastery/final-report.md`, and the separately branched `docs/publication-launch/final-report-nl.md`, now integrated. Earlier reports are historical snapshots and are superseded only by specific new receipts.

## HarborVoice persistent production — COMPLETE WITH LIMITATIONS

- Purpose: Protected logistics voice workbench
- Repository: https://github.com/phlppgdfry/harborvoice-ai; audited source: `234281a806150a79b12220d182df3fc9e97534b9`.
- Deployment/review URL: https://harborvoice-ai.vercel.app. Native reference: `Not applicable`.
- Demonstrated functionality: PostgreSQL workspace and protected operator routes; existing real voice integration.
- Verified tests: Fresh anonymous 200/401 checks; candidate tests separately below. Provider evidence: production-deployment.json; provider-readonly.json.
- Defects/limits: Live backup/retention/deletion/device acceptance incomplete; deployed source differs from PR head.
- Publication: Existing production; draft PR #1 unmerged. Quality: Useful protected demonstration; incomplete enterprise acceptance.
- Required action: Preserve deployment and close operational gates.

## Production candidate PR #1 — AWAITING OWNER APPROVAL

- Purpose: Persistent runtime and recovery candidate
- Repository: https://github.com/phlppgdfry/harborvoice-ai; audited source: `ae15f1f99e4677d6eeea1d86f80b4b183c4ec8a6`.
- Deployment/review URL: Not applicable / not separately deployed. Native reference: `Not applicable`.
- Demonstrated functionality: Migration, storage concurrency, operator authorization and rollback code.
- Verified tests: Build; 62 default pass +1 explicit skip; disposable PostgreSQL 2/2 and dump/restore pass. Provider evidence: release-evidence.md; production local logs.
- Defects/limits: No live restore, retention or owner device acceptance.
- Publication: OPEN DRAFT. Quality: Candidate; not safe for automatic promotion.
- Required action: Owner operational acceptance and specific migration/deployment decision.

## Public portfolio — COMPLETE WITH LIMITATIONS

- Purpose: Explain the ecosystem and limitations
- Repository: https://github.com/phlppgdfry/harborvoice-ai; audited source: `361808d690a3d944f67be387d2680ccc7f9408b1`.
- Deployment/review URL: https://phlppgdfry.github.io/harborvoice-ai/. Native reference: `Not applicable`.
- Demonstrated functionality: Static navigation, Academy, native media and source references.
- Verified tests: Fresh Chrome desktop/390/360px walkthrough; 89 asset hashes. Provider evidence: browser-verification.json.
- Defects/limits: Historical claims required correction; current branch changes await published-commit verification.
- Publication: Existing GitHub Pages demonstration. Quality: Professional synthetic demonstration with explicit limitations.
- Required action: Publish only through exact-commit CI gate.

## AgentOps Kit — COMPLETE WITH LIMITATIONS

- Purpose: Reusable agent operations package
- Repository: https://github.com/phlppgdfry/harborvoice-ai; audited source: `361808d690a3d944f67be387d2680ccc7f9408b1`.
- Deployment/review URL: Not applicable / not separately deployed. Native reference: `Not applicable`.
- Demonstrated functionality: Inspect/redact/diff/drift, budget proposals, bounded adapters, receipt import, report formats and CLI.
- Verified tests: 40/40 package tests; declarations/build; local package CLI. Provider evidence: native-agent-audit.json verifies historical metadata only.
- Defects/limits: Account-wide guard must be supplied; no npm ownership/publication verified.
- Publication: Source and release candidate; not npm. Quality: Useful independent tooling without endorsement.
- Required action: Use local tarball; establish namespace/ownership before npm release.

## AgentProof — COMPLETE WITH LIMITATIONS

- Purpose: Voice-agent evidence explorer
- Repository: https://github.com/phlppgdfry/harborvoice-ai; audited source: `361808d690a3d944f67be387d2680ccc7f9408b1`.
- Deployment/review URL: https://phlppgdfry.github.io/harborvoice-ai/agentproof/. Native reference: `Not applicable`.
- Demonstrated functionality: 110 fixtures, contracts, filter/search, comparison, failure trace and exports.
- Verified tests: Browser checks, 12 structured contracts; build. Provider evidence: Historical provider cases shown separately.
- Defects/limits: No independent real-user study, current live campaign or full accessibility acceptance.
- Publication: Public static demonstration. Quality: Transparent working pilot; not a reliability certification.
- Required action: Recruit consenting pilot and validate comprehension.

## Benchmark Lab — COMPLETE WITH LIMITATIONS

- Purpose: Reproducible contract study
- Repository: https://github.com/phlppgdfry/harborvoice-ai; audited source: `361808d690a3d944f67be387d2680ccc7f9408b1`.
- Deployment/review URL: Not applicable / not separately deployed. Native reference: `Not applicable`.
- Demonstrated functionality: 110 deterministic fixtures and 12 structured multilingual boundary cases.
- Verified tests: 80/110 intentionally unsafe baseline; 110/110 scripted corrected policy; 9 failures detected/3 controls. Provider evidence: No new model execution; historical receipts separately identified.
- Defects/limits: Not a semantic model holdout or population benchmark.
- Publication: Public methodology and fixture reports. Quality: Reproducible contract/report mechanics.
- Required action: Use frozen prospective holdout after budget settlement.

## Nora Main agent — NOT PROVIDER-VERIFIED

- Purpose: Synthetic logistics assistant
- Repository: https://github.com/phlppgdfry/harborvoice-ai; audited source: `361808d690a3d944f67be387d2680ccc7f9408b1`.
- Deployment/review URL: Not applicable / not separately deployed. Native reference: `agent_6901m6t6k3tpfnk9n2z3q2h1et7a`.
- Demonstrated functionality: Native Main with auth, 30 daily/2 concurrent/300-second limits.
- Verified tests: Historical four suites; no pooled reliability claim. Provider evidence: native-resource-audit.json; native-agent-audit.json.
- Defects/limits: Current live version differs from historical evaluation versions.
- Publication: Native live Main branch. Quality: Configured and reachable; latest-version acceptance unproven.
- Required action: Run matched baseline/current bounded tests before new rollout.

## Nora Visitor — COMPLETE WITH LIMITATIONS

- Purpose: Constrained historical public trial
- Repository: https://github.com/phlppgdfry/harborvoice-ai; audited source: `361808d690a3d944f67be387d2680ccc7f9408b1`.
- Deployment/review URL: Not applicable / not separately deployed. Native reference: `agent_8101m6vpg98dfwws14ng5nm6myws`.
- Demonstrated functionality: Authenticated native 60-second/2 daily/1 concurrent configuration.
- Verified tests: Historical prerecorded-input WebSocket test. Provider evidence: Fresh metadata, prior visitor-voice receipt.
- Defects/limits: Trial access expired/disabled; no physical microphone campaign.
- Publication: Native resource exists; public trial not claimed active. Quality: Safely bounded historical demonstration.
- Required action: Owner device campaign only after reconciled reservation.

## Learning template — AWAITING EXTERNAL REVIEW

- Purpose: Reusable native creative workflow
- Repository: https://github.com/phlppgdfry/harborvoice-ai; audited source: `b162f73c17b47f489e9d17c9dca2403646625701`.
- Deployment/review URL: https://elevenlabs.io/app/flows/DkSzGeLnRPG557cTaRSf. Native reference: `DkSzGeLnRPG557cTaRSf`.
- Demonstrated functionality: Two briefs → script, narration and quiz.
- Verified tests: Phase-5 example QA; fresh completed-node reads. Provider evidence: native-resource-audit.json; phase-5 receipts.
- Defects/limits: Needs aligned briefs; bad illustration excluded; no external approval.
- Publication: Submitted for review. Quality: Useful template candidate.
- Required action: Wait for review.

## NL/FR campaign — AWAITING EXTERNAL REVIEW

- Purpose: Reusable native creative workflow
- Repository: https://github.com/phlppgdfry/harborvoice-ai; audited source: `b162f73c17b47f489e9d17c9dca2403646625701`.
- Deployment/review URL: https://elevenlabs.io/app/flows/autfYixTUdY8eSnjlDOb. Native reference: `autfYixTUdY8eSnjlDOb`.
- Demonstrated functionality: Replaceable EN audio → fixed Dutch/French dubbing.
- Verified tests: Phase-5 example QA; fresh completed-node reads. Provider evidence: native-resource-audit.json; phase-5 receipts.
- Defects/limits: Not arbitrary languages/subtitles; no external approval.
- Publication: Submitted for review. Quality: Useful template candidate.
- Required action: Wait for review.

## Product Launch — NEEDS IMPROVEMENT

- Purpose: Reusable native creative workflow
- Repository: https://github.com/phlppgdfry/harborvoice-ai; audited source: `b162f73c17b47f489e9d17c9dca2403646625701`.
- Deployment/review URL: https://elevenlabs.io/app/flows/04Y2ZUoBsV1BQj9uMv9k. Native reference: `04Y2ZUoBsV1BQj9uMv9k`.
- Demonstrated functionality: Native brief/reference inputs and completed cinematic preview.
- Verified tests: Phase-5 example QA; fresh completed-node reads. Provider evidence: native-resource-audit.json; phase-5 receipts.
- Defects/limits: Product-image fidelity and English narration failed creative acceptance.
- Publication: Withheld, not submitted. Quality: Unacceptable publication example.
- Required action: Diagnose reference processing before any bounded generation.

## Creative media collection — COMPLETE WITH LIMITATIONS

- Purpose: Explain product and engineering
- Repository: https://github.com/phlppgdfry/harborvoice-ai; audited source: `361808d690a3d944f67be387d2680ccc7f9408b1`.
- Deployment/review URL: Not applicable / not separately deployed. Native reference: `Not applicable`.
- Demonstrated functionality: Three language commercials, portrait cut, explainer, narrations, Academy and score.
- Verified tests: 67 audio/video full-decodes; 89 registered hashes. Provider evidence: Historical native generation/upload receipts.
- Defects/limits: No new human listening or universal caption/crop acceptance.
- Publication: Public local masters and native assets. Quality: Technical integrity verified; subjective quality scoped.
- Required action: Human review of final intended publication masters.

## Studio caption project — COMPLETE WITH LIMITATIONS

- Purpose: Editable native media finishing
- Repository: https://github.com/phlppgdfry/harborvoice-ai; audited source: `361808d690a3d944f67be387d2680ccc7f9408b1`.
- Deployment/review URL: https://elevenlabs.io/app/studio/7IXHA48pFJqsSPSWtRtM. Native reference: `7IXHA48pFJqsSPSWtRtM`.
- Demonstrated functionality: Historical corrected 36s master and editable cues.
- Verified tests: Historical export correlation/caption check; current API403. Provider evidence: docs/final-mastery/studio-corrected-roundtrip.json.
- Defects/limits: No current lossless synchronization/API access.
- Publication: Native existing project. Quality: Corrected historical export.
- Required action: Retain corrected master and manually verify later edits.

## Future Systems — BLOCKED

- Purpose: Original professional music
- Repository: https://github.com/phlppgdfry/harborvoice-ai; audited source: `b162f73c17b47f489e9d17c9dca2403646625701`.
- Deployment/review URL: Not applicable / not separately deployed. Native reference: `fRthJyA26LAFJ6NqNi6g (review Flow, not Marketplace song)`.
- Demonstrated functionality: Original approximately60s Music API master, artwork and metadata.
- Verified tests: Hash and full decode; historical loudness measurements. Provider evidence: docs/publication-launch/music-provenance.json.
- Defects/limits: API-origin native publishing route and final human listening unresolved.
- Publication: No verified Music Marketplace listing. Quality: Technical master; publication blocked.
- Required action: Confirm provider-supported route, then human listening and specific commercial declarations.

## Northern Lights — BLOCKED

- Purpose: Original professional music
- Repository: https://github.com/phlppgdfry/harborvoice-ai; audited source: `b162f73c17b47f489e9d17c9dca2403646625701`.
- Deployment/review URL: Not applicable / not separately deployed. Native reference: `fRthJyA26LAFJ6NqNi6g (review Flow, not Marketplace song)`.
- Demonstrated functionality: Original approximately60s Music API master, artwork and metadata.
- Verified tests: Hash and full decode; historical loudness measurements. Provider evidence: docs/publication-launch/music-provenance.json.
- Defects/limits: API-origin native publishing route and final human listening unresolved.
- Publication: No verified Music Marketplace listing. Quality: Technical master; publication blocked.
- Required action: Confirm provider-supported route, then human listening and specific commercial declarations.

## Human Intelligence — BLOCKED

- Purpose: Original professional music
- Repository: https://github.com/phlppgdfry/harborvoice-ai; audited source: `b162f73c17b47f489e9d17c9dca2403646625701`.
- Deployment/review URL: Not applicable / not separately deployed. Native reference: `fRthJyA26LAFJ6NqNi6g (review Flow, not Marketplace song)`.
- Demonstrated functionality: Original approximately60s Music API master, artwork and metadata.
- Verified tests: Hash and full decode; historical loudness measurements. Provider evidence: docs/publication-launch/music-provenance.json.
- Defects/limits: API-origin native publishing route and final human listening unresolved.
- Publication: No verified Music Marketplace listing. Quality: Technical master; publication blocked.
- Required action: Confirm provider-supported route, then human listening and specific commercial declarations.

## ElevenReader book — AWAITING EXTERNAL REVIEW

- Purpose: Developer education
- Repository: https://github.com/phlppgdfry/harborvoice-ai; audited source: `b162f73c17b47f489e9d17c9dca2403646625701`.
- Deployment/review URL: https://elevenlabs.io/app/audiobooks/CJgq6QXO12sRReayiBoG. Native reference: `CJgq6QXO12sRReayiBoG`.
- Demonstrated functionality: 6,251-word imported manuscript before references, EPUB, cover and real native submission.
- Verified tests: New EPUBCheck 0 errors/warnings; prior owner preview approval. Provider evidence: Fresh Pending review UI; phase-5 owner approvals.
- Defects/limits: No public book listing; native formatting differs from imported EPUB.
- Publication: PENDING REVIEW. Quality: Credible educational submission; external quality decision pending.
- Required action: Respond to actual review without duplicate submission.

## Community workshop and articles — COMPLETE WITH LIMITATIONS

- Purpose: Developer onboarding and education
- Repository: https://github.com/phlppgdfry/harborvoice-ai; audited source: `361808d690a3d944f67be387d2680ccc7f9408b1`.
- Deployment/review URL: Not applicable / not separately deployed. Native reference: `Not applicable`.
- Demonstrated functionality: 90-minute kit, slides, starter, exercises, five technical article drafts.
- Verified tests: 13/13 combined workshop/contribution tests; separate recognition starter5/5. Provider evidence: No participants or provider endorsement.
- Defects/limits: No external pilot or event hosted.
- Publication: Prepared materials; no event/application acceptance. Quality: Useful reusable kit.
- Required action: Choose audience/date and gather truthful participant feedback.

## Official Showcase contribution — AWAITING EXTERNAL REVIEW

- Purpose: External project review
- Repository: https://github.com/phlppgdfry/showcase; audited source: `70303407af6656fc178700e4b2c043cfba0cff43`.
- Deployment/review URL: https://github.com/elevenlabs/showcase/pull/113. Native reference: `Not applicable`.
- Demonstrated functionality: Real upstream PR113 with description/image/schema.
- Verified tests: Phase-5 lint/build; typecheck baseline143 known; fresh status read. Provider evidence: github-audit.json.
- Defects/limits: Maintainer CI/Vercel authorization; no human review.
- Publication: OPEN, not merged or featured. Quality: Reviewable contribution.
- Required action: Wait for actionable reviewer feedback.

## Official SDK contribution — AWAITING EXTERNAL REVIEW

- Purpose: Executable offline tool-boundary example
- Repository: https://github.com/phlppgdfry/elevenlabs-js; audited source: `c3ae2441e88543335197e47e6f21b45716af41b0`.
- Deployment/review URL: https://github.com/elevenlabs/elevenlabs-js/pull/484. Native reference: `Not applicable`.
- Demonstrated functionality: Real SDK PR484, guide and argument/auth/result-validation example.
- Verified tests: Phase-5 29 tests/build/lint/typecheck; Bugbot success freshly read. Provider evidence: github-audit.json.
- Defects/limits: No human review/merge; credential-dependent full integration tests not run.
- Publication: OPEN, REVIEW_REQUIRED. Quality: Focused tested contribution, no endorsement.
- Required action: Respond to actual maintainer feedback.
