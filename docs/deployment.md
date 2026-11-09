# Production deployment and rollback

This branch prepares a private single-operator workbench, not a multi-tenant SaaS.
The PostgreSQL-backed production deployment and one capped real voice call are verified.
Broader production acceptance remains bounded by the operational/manual items below.

## Configuration

Use Node 24 and `npm ci`. Production requires `APP_MODE=production`, `OPERATOR_TOKEN`
(at least 32 random characters), `ELEVENLABS_API_KEY`, `ELEVENLABS_AGENT_ID` and the exact
`PUBLIC_ORIGIN=https://your-host` without a trailing slash. A Vercel deployment also
requires `DATABASE_URL`. Put secrets only in the host secret manager; never `VITE_*`,
source control, screenshots or chat. `APP_MODE=demo` is an explicitly labelled development
or portfolio mode; it must not be used as a production workaround.

The selected database plan is **Neon Free (`free_v3`), Frankfurt (`fra1`)**, with no paid
upgrade authorized. Provisioning through the already-linked HarborVoice Vercel project
completed after the owner acceptance gate was satisfied. The dedicated resource was
created on the explicitly selected Free plan and connected to preview only. The real
TLS connection and schema migration passed on 8 November 2026. No unrelated Supabase
project was reused or unpaused. A second explicitly Free resource, `harborvoice-live`, isolates production from the
`harborvoice-production` preview resource. Both migrations passed. Production at
https://harborvoice-ai.vercel.app was verified on 9 November 2026; see
[the actual voice and persistence evidence](production-verification.json).

## Safe sequence

1. Preserve the existing production deployment URL/revision for rollback. Inspect current
   main and concurrent work before integrating this branch; it is based on `116395e`.
2. Create the dedicated free database; use a pooled TLS connection. Configure preview
   credentials separately from production. Never connect a development fixture to user data.
3. Run `npm run db:migrate` using secret-manager-provided credentials. Migration version 1
   creates only private `harborvoice` tables, revokes PUBLIC privileges, validates persisted
   JSON and refuses silent reseeding of a previously migrated but missing workspace.
4. Configure the exact preview HTTPS origin and strong operator secret. Build with
   `VITE_STATIC_DEMO` unset; the static Pages build is intentionally a separate demo.
5. Deploy a preview from the reviewed branch. Verify `/api/health`, unauthorized 401,
   operator sign-in, `/api/readiness`, session creation, persistent state across fresh
   function instances, deletion, logout revocation and security headers.
6. Perform an explicitly budgeted real voice smoke test with synthetic content. Confirm
   actual audio, transcript, mute/stop, ended-session persistence and provider status.
   Browser fixtures do not pass this gate. Real microphone/device permission remains a
   manual acceptance check even when synthetic-microphone automation passes.
7. Only promote a preview after every gate passes. This task does not authorize paid
   resources or bypassing protection. Verify the production origin and repeat smoke tests.

Vercel's current ephemeral filesystem is unsuitable for authoritative SQLite. The
gateway uses PostgreSQL when configured and rejects missing storage in production.
The alternative Docker deployment may use a durable mounted SQLite file, with a
reverse proxy terminating HTTPS; never expose port 3100 publicly without that boundary.
Localhost binding is the default. The operator is the one workspace owner, not a tenant.

## Backup, retention and recovery

Free hosting is not an SLA or automatically verified point-in-time recovery. Arrange
encrypted backups outside the public repository. Use `pg_dump --format=custom --schema
harborvoice` with credentials supplied securely via a local service/password file or
secret-manager environment, not a credential-bearing command-line argument. Restore
into a separate database, run schema/record checks and test authorization before switching
the deployment connection. `npm run test:postgres` performs an actual dump/restore round
trip on its disposable synthetic database; no live backup/restore has been claimed.

For SQLite, stop writes or use SQLite's online backup facility; copying only the main
file while WAL writes continue is unsafe. Keep the original and verify a separate restored
copy. Never repair corruption by deleting the database or clearing browser storage.

Local transcripts and raw webhook events have a 30-day policy. Pruning occurs on workspace
writes; the protected `POST /api/maintenance/retention` can be scheduled by the operator.
An idle deployment needs that operational schedule to enforce a time deadline. Provider
recordings/transcripts have separate ElevenLabs retention/deletion settings, which must
be reviewed before real personal information is allowed. Local deletion does not delete
provider records. This is not a blanket GDPR-compliance certification.

Rollback: restore the previous verified deployment without dropping the new database.
Migration 1 is additive. If rolling back to browser-storage code, do not imply it can read
the PostgreSQL records; retain the database and backups, then resolve forward deliberately.

## Browser-data preservation

The update does not erase `harborvoice-state-v1` from local storage. Existing browser
records are not automatically trusted as production approvals. Preserve/export that JSON
before clearing site data (browser developer tools → Application/Storage → Local Storage),
review it, then use Settings' explicit conversation import. It merges validated conversation
records only and leaves both the source and existing server IDs intact. Shipments and
approval decisions are deliberately not imported from an unauthenticated browser snapshot.

## Verified release and rollback point

The deployed implementation is `234281a806150a79b12220d182df3fc9e97534b9`, rebuilt from
its CI-verified GitHub preview into production. The existing production operator secret
and provider credentials were preserved. The former browser-storage deployment is
https://harborvoice-ifzpcma5f-kippiegs-projects.vercel.app; inspect it before rollback.
Do not delete the PostgreSQL database during rollback. Feature branch/PR remain unmerged.

The concurrently merged deployment freeze is retained in `vercel.json` as
`git.deploymentEnabled=false`: Git pushes do not automatically publish a new Vercel
deployment. Keep the successful GitHub verification gate and use an intentional reviewed
deployment/promotion. Do not remove the freeze as a shortcut for a pending status.
