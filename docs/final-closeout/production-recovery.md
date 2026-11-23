# Production database, backup and recovery

**Status 23 November 2026: restore drill PASSED.** Original 17 November read-only checks follow below.

## Restore drill — 23 November 2026

Neon project `harborvoice-live` (free plan, Frankfurt), branch `main` linked to Vercel production. **History retention (restore window): 6 hours.**

1. In the Neon console a child branch `restore-drill-2026-11-23` was created from `main` **at a past point in time: 23 Nov 19:30 CET**. Neon deletes it automatically after one day; production was not touched.
2. The same read-only row-count query ran on both branches in the Neon SQL editor:

| Table              | Restored copy (19:30) | Production (20:08) |
| ------------------ | --------------------- | ------------------ |
| `migrations`       | 1                     | 1                  |
| `workspace`        | 1                     | 1                  |
| `webhook_events`   | 0                     | 0                  |
| `revoked_sessions` | **3**                 | **4**              |

The single difference is the session revoked by the post-rotation sign-out test at about 20:02. That proves the copy reflects the database as it was at the chosen time, which is the point-in-time restore guarantee.

**Limit:** on the free plan the restore window is 6 hours. Older mistakes cannot be undone from history; for longer protection use a paid Neon plan or a scheduled `pg_dump`.

---

17 November 2026 (original): schema and contents verified read-only.

## Live state (read-only queries)

Connection: the production `DATABASE_URL` (Neon, `eu-central-1`, pooled endpoint `ep-red-smoke-…`). Every query ran inside `BEGIN READ ONLY … ROLLBACK`; `transaction_read_only` reported `on`.

| Check            | Result                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| Server           | PostgreSQL 18.7                                                                                               |
| Schema           | `harborvoice` with `migrations`, `workspace`, `webhook_events`, `revoked_sessions`                            |
| Migration state  | version 1 applied 2026-11-08 18:29 UTC; the repository has one migration (`001_workspace.sql`) — **no drift** |
| Workspace        | 1 row, 1.5 KB: 4 shipments, 1 session, 0 tickets                                                              |
| Webhook events   | 0                                                                                                             |
| Revoked sessions | 2, both not yet expired                                                                                       |
| Database size    | 7.7 MB                                                                                                        |

No row content was read.

## What is proven in isolation

From the 10 November consolidation (unchanged code): migrations, transactions, parallel updates, rollback, restart persistence, authorization, logout revocation, import and deletion pass against a disposable PostgreSQL 17 container, and a real `pg_dump`/`pg_restore` round trip to a second database succeeds (`npm run test:postgres`). That proves the application can be backed up and restored. It does not prove the live provider's backups.

## Not verified

- Neon backup settings, history retention window and point-in-time restore: they live in the Neon console and need the Neon account. No Neon credentials or CLI are configured here, and the Vercel integration does not expose them.
- Who is responsible for a restore, and the target recovery point and time.
- A live restore drill.

## Procedure for the owner (non-destructive)

1. In the Neon console, open project `NEON_PROJECT_ID` (see Vercel → Storage). Note the plan's restore window under _Settings → Storage / History retention_.
2. Create a **branch** from a point in time 10 minutes ago (Neon branches are copies; production is untouched).
3. Point a local checkout at the branch's connection string and run read-only checks: the same queries as above should return the same counts.
4. Delete the branch.
5. Record: restore window, time taken, who did it. Proposed targets for this demo app: recovery point ≤ 24 hours, recovery time ≤ 1 hour.

Never restore over the production branch; promote a verified branch only as a separate, approved rollout.
