# Owner actions

Updated 20 November 2026. Only things that need your identity, a legal statement, a login or a production permission.

## Still open

1. **Production operator login** (5 min). The code cannot be recovered, so it has to be replaced. The agent's permission system blocked changing a production secret, so run these three commands yourself from `~/harborvoice-production-review`:

   ```sh
   umask 077; openssl rand -hex 32 | tr -d '\n' > .env.operator.production.local   # new code, git-ignored
   vercel env rm OPERATOR_TOKEN production -y && vercel env add OPERATOR_TOKEN production --sensitive < .env.operator.production.local
   vercel redeploy dpl_C9wP3SGQr748FqB2ifTt3ruRtnTZ --target production             # same commit 234281a
   ```

   Put the code in your password manager, then sign in at <https://harborvoice-ai.vercel.app> → Settings, open the workspace and sign out. Or allow the agent to do it (see the closing note in the status update). Details: [production-auth.md](production-auth.md).

2. **ElevenReader — press Submit** (2 min). Everything is corrected to “Philippe Godfroy”; only the final legal confirmation is yours. Steps in [native-publication-status.md](native-publication-status.md#elevenreader--status-20-november).

3. **Real voice test on a phone or laptop** (15 min). The 6/6 agent results are text simulations. Talk to Nora once in English, Dutch and French: interrupt her, ask for a shipment reference, check pronunciation and delay.

4. **Neon restore drill** (optional, 20 min). It needs your Neon login (Google/GitHub). Steps in [production-recovery.md](production-recovery.md#procedure-for-the-owner-non-destructive). Health is checked automatically every six hours by the live monitor.

## Next billing period (fresh credits)

5. **Agent regression** (~1,700 credits). Not urgent, because the retention setting stays as it is.
6. **Product Launch template** (~5,550 credits, optional). Only with a product photo that has no printed text; see [product-launch.md](product-launch.md#options-for-later-next-billing-period). There aren't enough credits for this now (1,847 left).

## Decided or done by the owner (20 November)

- Demo video watched with sound — OK.
- 3,013 credits (“Summer Never Gets Old”, 10 November) — owner confirmed it's fine.
- Provider retention for Nora — kept as is (owner decision).
- Three music tracks listened to — OK.
- Outreach posts — dropped; nothing will be posted.

## Waiting on others, no action needed

- Showcase PR #113 — the ElevenLabs team must authorize its Vercel preview and review it.
- Two Explore templates — submitted 9 November, not yet public.
- Music Marketplace — ElevenLabs support has passed the questions to a staff member (automatic reply 17 November); there is a backlog. Don't open a second ticket.

## Real-world validation (needs people)

- A small pilot with real users and giving the prepared workshop (`public/learn/workshop.html`).
