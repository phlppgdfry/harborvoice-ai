# Production operator login — diagnosis

17 November 2026. **Status: cause established; not repaired. Repair needs an owner decision.**

## Finding

The protected app at <https://harborvoice-ai.vercel.app> rejects the locally stored operator code with HTTP 401. It is not a code regression. The local code belongs to a different environment.

| Evidence                                                                                                            | Value                                                                            |
| ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Production deployment serving the alias                                                                             | `dpl_C9wP3SGQr748FqB2ifTt3ruRtnTZ`, commit `234281a`, built 2026-11-08 23:46 UTC |
| Production `OPERATOR_TOKEN` (Vercel metadata, no value)                                                             | type `sensitive`, created and last updated 2026-11-07 15:50 UTC                  |
| Preview `OPERATOR_TOKEN` (Vercel metadata, no value)                                                                | type `sensitive`, created 2026-11-08 13:26 UTC                                   |
| Local file `~/harborvoice-production-review/.env.operator.local`                                                    | written 2026-11-08 13:23 UTC; 64 characters; fingerprint `59e80fb6`              |
| One sign-in with the local code on **production** (`POST /api/auth/session`)                                        | **401** "Incorrect operator access code."                                        |
| One sign-in with the same code on the **preview** deployment `dpl_3BdVvfN2eeQCv61awELWExam1oej` (via `vercel curl`) | **200** `{"authenticated":true}`                                                 |
| Production `OPERATOR_TOKEN` in `vercel env pull` output                                                             | empty, as Vercel does for sensitive variables; it cannot be read back            |

The login code path (`server/app.ts`, `/api/auth/session`) compares the submitted code to `OPERATOR_TOKEN` with a constant-time check and signs an HMAC session cookie with the same value. That logic works: the preview deployment, built from the same branch, accepts its own code.

**Conclusion.** The production code set on 7 November was never saved locally. The file saved on 8 November holds the preview code. Vercel stores the production value as sensitive, so neither the owner nor any tool can recover it from Vercel.

No secret was printed, logged or committed. Fingerprints are the first 8 hex characters of SHA-256. Each environment got exactly one sign-in attempt; the rate limiter was not approached.

## What would fix it (owner decision)

**Option A — find the original code.** If the 7 November production code is in a password manager or other private note, sign in with it at <https://harborvoice-ai.vercel.app> → Settings. Nothing changes in production.

**Option B — rotate the production code.** Environment changes only reach a new deployment, and the project's deployment freeze is deliberate, so this is a production rollout:

1. Generate a new code locally: `openssl rand -hex 32`. Store it in your password manager first.
2. `vercel env rm OPERATOR_TOKEN production` then `vercel env add OPERATOR_TOKEN production --sensitive` and paste the new value.
3. Redeploy the **same** commit, not main: `vercel redeploy dpl_C9wP3SGQr748FqB2ifTt3ruRtnTZ --target production`. This keeps the exact runtime that is live now.
4. Verify: sign in, open the workspace, sign out, and confirm the old cookie is refused (logout revokes the session in `harborvoice.revoked_sessions`).
5. Effect: all existing operator sessions become invalid, because the cookie signature uses the same secret. The two active revocation rows are unaffected.

Rollback: the previous deployment stays available; `vercel rollback` restores it, but the old code would still be unknown.

Option B was not executed: the task forbids rotating production credentials without explicit approval.

## Not verified

The authenticated workflow (workspace read, features, logout revocation) was not re-tested on production, because no valid production credential is available. Anonymous requests to private routes still return 401, as intended.
