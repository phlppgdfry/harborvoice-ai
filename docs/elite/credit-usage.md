# ElevenLabs Credit Governor

The Elite execution began on 7 November 2026 with **110,200 verified available credits**. Its independent maximum is **50,000 additional credits**, preserving at least **60,200** from the verified starting balance. A conservative **5,000-credit billing buffer** limits planned commitments to 45,000. Earlier Academy spending is outside this new execution; no previous counter was reset to disguise usage.

`lib/credit-governor.ts` serializes reservations with an exclusive filesystem lock and atomically replaces the private ledger. Each operation records its workstream, estimate, pending/completed/failed state, provider IDs and any reported usage. Duplicate operation keys are rejected. Failed and completed operations retain conservative allowances because a failure is not proof of no charge. Account reads reconcile the account-wide counter, including possible external activity. No process can guarantee that an unrelated application will not consume the account balance; the dated report makes that limitation explicit.

The conservative liability is the greater of the observed account-wide delta and the total committed estimates or reported costs, plus a separate billing buffer. Quota changes, counter resets, missing authentication, invalid balance data, stale snapshots, lock contention and insufficient remaining allowance stop new generation. Account overage is disabled. Estimates are not invoices: the native briefing transcription was quoted at about 13 credits but reported 216.04, and the first 52-case agent suite reported 16,622 against a 16,000 reservation. Both differences were reconciled against the buffer before new work.

```bash
npm run budget:report
npm run elite:budget -- reserve unique-operation workstream 500
npm run elite:budget -- pending unique-operation provider-job-id
npm run elite:budget -- completed unique-operation
```

The report is [credit-usage.json](credit-usage.json). Private raw receipts and provider IDs remain in ignored `var/elite`. After an interrupted process, inspect known provider jobs before resuming; never remove a lock or create another paid operation merely to bypass a stop. Reservations are not released automatically after failures.

This governor protects the release's local automation. It is **not a distributed serverless quota store**. Hosted paid tools require the operator session; public recorded media does not generate new content. The separate visitor agent retains provider-enforced duration, concurrency, daily limits and its fixed expiry. Production multi-user generation would require a durable shared reservation service before opening those endpoints to visitors.
