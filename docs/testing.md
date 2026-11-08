# Verification commands and environments

```bash
npm ci
npm run lint          # Existing Prettier formatting check, not an ESLint security audit
npm run typecheck
npm run check         # Production build + Node unit/API/SDK-contract tests
npm audit --audit-level=high
npm run test:postgres # Docker required; real disposable PostgreSQL 17 + dump/restore
```

The default test run explicitly skips the PostgreSQL case unless `TEST_POSTGRES=1` and
`DATABASE_URL` refer to an isolated test database. The Docker runner creates a random
password/private temporary environment file, waits for readiness, executes the test,
verifies dump/restore, stops its own disposable container and removes only its own
temporary data. It never uses a production database. Do not set TEST_POSTGRES on a
deployment's live connection: the fixture deliberately resets synthetic sessions/tickets.

For browser checks start `npm run dev` with `APP_MODE=demo` and a fresh local SQLite
store. The original walkthrough checks actual domain/UI/API behavior and mocked audio
products. Evidence goes to ignored `var/browser-evidence`, preserving committed history.
Then run:

```bash
npm run test:browser
npm run test:production-browser
```

`DEMO_URL` selects the preview, `BROWSER_CHANNEL=chromium` selects installed Chromium for
CI. Firefox is not required. Install the documented Playwright Chromium dependency for
a clean machine. Browser tests cover local/demo domain functionality and fixture-only
production SDK lifecycle separately. No result from mocked voice is a live ElevenLabs
success. New production tests include missing configuration, durable migrations,
concurrency, rollback, restart, cookie revocation, CSRF, import deduplication, deletion
and protected provider readiness. Health reports unavailable instead of serving browser
data if persistence fails.

CI uses pinned Actions, least-privilege contents access, dependency audit, real PostgreSQL
tests and browser checks without provider credentials. Hosted success is only reported
after observing the actual run at the candidate commit. No workflow deploys this branch
to production or injects provider secrets into pull-request code.

## Deployed candidate checks

`HOSTED_URL=https://exact-origin npm run verify:production` uses a privately configured
`OPERATOR_TOKEN` and optional project-scoped `VERCEL_OIDC_TOKEN` for protected preview
access. The latter is attached only to the selected deployment origin. Secrets can be
loaded from ignored `.env.smoke.local` (`HARBORVOICE_SMOKE_ENV` overrides the path).
This default checks real database/provider readiness and login/logout without a call.

`npm run verify:production -- --live` requires explicit authorization to use existing
included credits. It checks the included balance, uses one prerecorded synthetic question,
closes the browser within 30 seconds, and writes an attempt marker before starting.
It refuses an automatic repeat. Results/screenshots are private under `var/` until reviewed;
never publish operator codes, signed URLs or private conversations. The test covers real
ASR/agent/incoming audio, not a physical microphone or subjective audio quality.
