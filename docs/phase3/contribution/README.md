# Proposed upstream example: tool-boundary regression evidence

Target: [elevenlabs/examples](https://github.com/elevenlabs/examples), HEAD `07454da05a9265bb008a5024771cf51ae2f66eb3` inspected 8 November 2026. Status: **validated local example proposal; no upstream branch/fork/PR submitted**. This is a teaching contribution, not an invented SDK bug.

Audit: current README describes `PROMPT.md`, `setup.sh`, generated `example/` and shared templates; legacy `examples/` deprecated. Contributing section requests pre-commit installation. `.github/workflows/lint.yml` exists. No standalone CONTRIBUTING.md found through the checked path. Open examples issues/PRs showed realtime transcription/Ruby SDK topics and a LiveKit PR (#263), not this limited teaching subject. This is a point-in-time first-page check, not proof no maintainer discussion exists. JS SDK has genuine bugs, but several are already covered by open fixes; do not duplicate them for portfolio activity.

Reproduction: an observed source failure combined with `outcome: grounded` currently passes a naive “tool called” assertion. `example.test.mjs` demonstrates that tool presence alone is insufficient. The proposed utility adds outcome/authorization/allowlist assertions without provider requests. Tests show honest recovery passes while fabricated grounded success and unauthorized effects fail. No claims of detecting every unsafe conversation.

Run: `node --test docs/phase3/contribution/example.test.mjs` (five tests, no dependencies, credentials or billable operations). The workshop starter supplies a fuller synthetic tool boundary. No upstream code or third-party scripts executed.

Before submission: ask owner to approve this finished proposal; recheck upstream issues/PRs and maintainer scope; adapt to an agreed new example location with PROMPT/setup/example conventions; use official base template and pinned dependencies; run upstream lint/pre-commit in an isolated contribution checkout after inspecting hooks; verify final diff. No upstream acceptance or upstream CI pass is claimed. Repository-wide SDK changes were avoided because generated types need generator-level ownership.
