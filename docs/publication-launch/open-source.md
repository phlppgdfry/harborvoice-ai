# Official open-source contribution

Observed 2026-11-09T22:38:20.279458+00:00. **PENDING REVIEW**: real, open, non-draft [elevenlabs/elevenlabs-js #484](https://github.com/elevenlabs/elevenlabs-js/pull/484). Not merged. No human review or requested changes observed.

- Fork: https://github.com/phlppgdfry/elevenlabs-js .
- Branch: `docs/offline-tool-contracts`.
- Commit: `c3ae2441e88543335197e47e6f21b45716af41b0`.
- Rationale: provider tool-choice tests do not test the application boundary. This original runnable TypeScript guide tests exact arguments, schema and facts, trusted resource authorization, unavailable versus unknown, safe failure handling, pending-review semantics and no effects after denial.
- Four files, 209 added lines, exclusively in `.fernignore`-protected docs and custom test paths. Read current AGENTS.md and CONTRIBUTING.md. No generated SDK files, private resources or API keys included.
- No SDK/network calls or paid ElevenLabs usage; synthetic injected fake backends. Adapter responsibilities, transport/authentication, idempotency and limits of deterministic tests are documented.

## Validation and upstream state

29 Jest cases PASS from the installed checkout; SDK `yarn build` PASS; Biome lint and format PASS for both TypeScript files; strict standalone TypeScript PASS; documentation links and diff whitespace PASS; commit-range Gitleaks PASS. Full credential-dependent integration tests were not run because they can make paid calls. Do not equate the scoped local tests with the entire repository suite.

The actual upstream **Cursor Bugbot** check completed successfully: [run](https://github.com/elevenlabs/elevenlabs-js/runs/129334994611). Bot summary describes low risk; no actionable inline finding observed. This check is an automated review, not proof of full upstream integration CI. Mergeable=true, mergeable_state=blocked at inspection; maintainer review/merge remains external. [Receipt](sdk-contribution.json).

## Original target restrictions

The current examples structure was audited and a working current-layout example prepared on [phlppgdfry/examples](https://github.com/phlppgdfry/examples/tree/feat/offline-agent-tool-contracts), commit `67ccb011ed7bebe8bd9d7967abfbf0083cb5a03a`. Fourteen Python tests, clean setup, full Ruff/Prettier and Gitleaks passed. Actual GitHub compare UI states: “An owner of this repository has limited the ability to open a pull request to users that are collaborators on this repository.” API PR creation was also denied. [Restriction evidence](examples-access-restriction.json). No PR was fabricated or restriction bypassed.

A scoped skills documentation adaptation on [phlppgdfry/skills](https://github.com/phlppgdfry/skills/tree/docs/offline-agent-tool-testing), commit `3c0b277`, was also denied PR creation; no PR exists there. The final SDK contribution is the one actual official OSS PR. No duplicate PRs or low-value issues were opened. These local proposal branches are not submissions.
