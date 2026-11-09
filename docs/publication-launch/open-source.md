# Official open-source contribution

**BLOCKED — no official PR exists.** The implementation and remote push are complete; GitHub refuses PR creation for this repository with the current account. This is not pending maintainer review of a submitted contribution.

- Upstream: https://github.com/elevenlabs/examples .
- Audited base: `07454da05a9265bb008a5024771cf51ae2f66eb3` (verify current local receipt for exact SHA).
- Fork: https://github.com/phlppgdfry/examples .
- Branch: `feat/offline-agent-tool-contracts`.
- Commit: `67ccb01` (full SHA in oss-validation.json).
- [Review diff / manual PR creation](https://github.com/elevenlabs/examples/compare/main...phlppgdfry:examples:feat/offline-agent-tool-contracts?expand=1).
- Proposed title: Add offline agent tool contract testing example in Python.

## Developer value and scope

The historical five-test proposal checked observed outcome labels. This contribution implements and tests the application boundary itself: exact tool arguments, reference authorization, structured backend response validation, unknown versus unavailable facts, pending-review outcomes and stale-success recovery. It is a teaching example, not an invented SDK bug. Standard library Python requires no SDK/API keys or paid calls. README and application schemas explain mapping to ElevenAgents client-tool parameters without misrepresenting schemas as an agent-create payload. Production transport, model behavior, deadlines, idempotency and durable audit remain explicitly out of scope.

Current upstream README, lint workflow, shared template, scaffold skill and examples inspected. The new example uses `agents/python/tool-contracts/{PROMPT.md,README.md,setup.sh,example/}`; no legacy examples folder. Setup seeds `templates/python`, strips online dependencies, copies no credentials and refuses to overwrite existing work. No external generation or Cursor run was used. Targeted live PR search for tool topics and contract overlap found no matching contribution; no global absence claim is made.

## Verification

- 14/14 unittest methods, with additional malformed-input/response subcases: PASS.
- Clean temporary setup, fresh venv without third-party packages, repeated tests and demo: PASS.
- `ruff check .`: PASS over the complete upstream repository plus contribution.
- Root pinned Prettier 3.8.1, `npx prettier . --check`: PASS over the complete repository.
- Gitleaks staged scan and active commit hook, git diff --check: PASS.
- Fork parent and upstream comparison confirmed: one commit ahead, zero behind, ten intended files.
- Upstream CI for this contribution: **NOT RUN**, because PR creation failed.

The README's pre-commit installer refuses the host's existing global core.hooksPath; upstream also contains no .pre-commit-config.yaml. The global Gitleaks hook remains active and no hook was disabled. Actual upstream Ruff/Prettier commands were run directly.

## Exact external failure and next action

`gh pr create --repo elevenlabs/examples ...` returned: `phlppgdfry does not have the correct permissions to execute CreatePullRequest`. Official REST POST returned HTTP 404 / Not Found, including a final attempt with explicit API version. Fork verification succeeds; authenticated comparison sees the ten files. Upstream is public, not archived or disabled. The interaction-restrictions endpoint requires repository admin rights (403), so the underlying policy **cannot be established**; it is not attributed to an invented ban or outage.

No PR number or URL exists. No duplicate fork PR, unrelated issue, alternate-account submission or restriction bypass was attempted. Owner can open the compare link with the intended account and inspect GitHub's visible reason. If it permits creation, use the committed `open-source-pr-body.md`; otherwise a repository maintainer/GitHub must resolve the permission restriction. Recheck PR existence before retrying. Existing owner authorization already covers creation after access is restored.
