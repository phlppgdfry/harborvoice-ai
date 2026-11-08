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
