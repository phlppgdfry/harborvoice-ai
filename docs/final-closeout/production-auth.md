# Production operator login — diagnosis

**Status 23 November 2026: REPAIRED and verified.**

| Step (23 November 2026)                                          | Result                                                                   |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| New code generated locally by the owner, stored git-ignored      | `~/harborvoice-production-review/.env.operator.production.local`, 64 hex |
| Production `OPERATOR_TOKEN` replaced (sensitive)                 | done by the owner with the Vercel CLI                                    |
| Redeploy of the same deployment `dpl_C9wP3S…` (commit `234281a`) | new production deployment `dpl_Aye4R6dFvuh8ankzgmx4oHi8EC3U`, Ready      |
| Sign in (`POST /api/auth/session`)                               | **200**                                                                  |
| Workspace (`/api/state`) and conversations with the cookie       | **200** / **200**                                                        |
| Sign out (`DELETE /api/auth/session`)                            | **200**                                                                  |
| Old cookie after sign-out                                        | **401** (revocation works)                                               |
| Deployment freeze                                                | unchanged: `git.deploymentEnabled=false`, Git deployments disabled       |

The code was never printed or committed; it was passed to `curl` from the file. One sign-in attempt was used.

---

Diagnosis of 17 November, kept for the record:

> **Update 20 November 2026.** The owner approved option B (“productiecode … vervangen”). Replacing the production secret was then refused by the agent's permission system, so it was not done and no new code exists yet. The three commands in [owner-actions.md](owner-actions.md) do it in about five minutes. Anonymous checks on 20 November: `/api/health` 200 with database reachable, `/api/state` and `/api/conversations` 401 as intended.

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
