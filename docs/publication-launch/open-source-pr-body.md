A tool being called does not establish that its arguments, backend result or reported action state are correct. This example teaches the application boundary behind ElevenAgents tools without requiring credentials or paid evaluations.

Adds `agents/python/tool-contracts` in the current PROMPT.md / setup.sh / example/ layout and links it from the root README. Python standard library only. The committed runnable example includes synthetic lookup/review backends, application JSON Schemas, a trusted context and 14 regression tests covering exact argument types, extra fields, reference mismatches, unknown versus unavailable results, malformed responses, capability checks, pending-review semantics and recovery without stale facts.

The schemas are explicitly application contracts, not agent-create payloads. The README maps them to ElevenAgents client-tool parameters and links the existing live agent quickstart. This contribution makes no claim to test model behavior, live sessions, speech or prompt-injection resistance. A production adapter must derive authorization from a trusted service/session and add transport authentication, deadlines, idempotency and audit logging.

Validation:

- Clean temporary scaffold seeded from templates/python, then implementation copied into example/: pass.
- All 14 tests in a fresh virtual environment without third-party packages: pass.
- Demo prints known, unknown, timeout and pending-review outcomes: pass.
- `ruff check .`: pass.
- `npx prettier . --check` (root pinned Prettier 3.8.1): pass.
- Gitleaks staged scan and git diff --check: pass.
- No ElevenLabs requests, credits, keys or network access required at runtime.

Setup deliberately refuses to overwrite an existing implementation. It reuses the shared Python template but removes its SDK/dotenv requirements for offline use and does not copy .env files. The upstream README requests pre-commit; its installer refuses this host's existing global hooksPath and upstream has no .pre-commit-config.yaml. The active global Gitleaks hook was retained, and the two actual upstream CI commands (Ruff and Prettier) were executed directly. No security hook was bypassed.

Original MIT-compatible example, developed with AI assistance from an earlier independently tested tool-boundary teaching proposal. No HarborVoice private resources, provider receipts or customer data are included. No related issue is claimed.
