# Production acceptance decision

PR [#1](https://github.com/phlppgdfry/harborvoice-ai/pull/1), `production/persistent-runtime`, was observed draft at `ae15f1f99e4677d6eeea1d86f80b4b183c4ec8a6`. Its own finalization verdict remains NOT PRODUCTION READY — ACTION REQUIRED. Phase 4 does not merge, deploy, migrate or change this runtime.

Source review covers server/app.ts, postgres.ts, operator-auth.ts, runtime configuration, migration and test documentation. The branch provides transactional PostgreSQL initialization, missing-workspace refusal, schema revocation, parameterized SQL, certificate validation, protected routes, session revocation and retention endpoints. Its default suite skips the actual PostgreSQL test unless explicitly configured; default CI success cannot substitute for database/restore acceptance. Shared operator access is not per-user identity or tenant isolation. Per-instance rate limiting is not account-wide spending coordination.

The current public `/api/status` was reread without authentication: live production, PostgreSQL, operator required, guest voice disabled. That observation alone cannot identify its exact deployed Git commit or establish current login, data persistence, microphone quality or backup behavior. The prior deployment receipt identifies implementation `234281a`; a fresh exact deployment receipt is recorded separately when available. Preserve the existing database, credentials, rollback target and `git.deploymentEnabled=false` freeze.

Release gates still requiring owner/operational acceptance:

1. Correct intended operator access plus real-device microphone, mute, interruption, playback, stop and saved-history acceptance. Further voice calls require a new spending approval.
2. Encrypted backup policy and separate live restore drill; explicit recovery time/data loss targets and a named operator. Disposable-database tests are useful but do not prove current hosted backups.
3. Actual retention schedule, local/provider deletion verification, provider recording/DPA/regional decisions and a real support/privacy contact before personal data.
4. Review source/deployment divergence and authorize the exact PR merge/promotion. Keep current working deployment intact until then.
5. Account-wide reservation/dispatch fencing and reconciliation before opening broader paid access. The new receipt importer cannot coordinate other clients.

Rollback must preserve the PostgreSQL data. Reverting to a browser-storage application is not a database recovery strategy. No force merge, new database, paid infrastructure or automatic Vercel rollout is justified by this Phase 4 work.
