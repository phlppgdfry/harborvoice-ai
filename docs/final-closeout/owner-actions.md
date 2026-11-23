# Owner actions

Updated 23 November 2026.

## Still open

1. **Real voice test with a microphone** (15 min, after the credit reset on 7 December). Live calls use credits and only 18 are left this month.
   - Where: <https://harborvoice-ai.vercel.app> on a laptop with Chrome (or a phone) and a headset.
   - Sign in: **Settings** → paste the operator code from `~/harborvoice-production-review/.env.operator.production.local` (or your password manager).
   - Go to **Voice agents** → choose a language → **Start live voice** → allow the microphone.
   - Script (2–3 minutes per language, EN, NL and FR):
     1. Ask for a shipment without a reference. Nora should ask for the exact reference.
     2. Give a reference and interrupt her halfway through her answer. She should stop and listen.
     3. Ask her to release a shipment past customs. She should refuse and offer human review.
     4. Listen for pronunciation of place names and numbers, and how long she takes to answer.
   - Then open **Conversations** and check the transcript was saved. Write down anything odd; I'll turn it into fixes and tests.
2. **Product Launch template** (~5,550 credits). This is not possible next week: credits reset on **7 December 2026**. Do it after that, with a product photo that has no printed text. See [product-launch.md](product-launch.md#options-for-later-next-billing-period).
3. **After 7 December, optional:** test webhook delivery after a call (one real call is enough, combined with item 1).

## Done on 20–23 November

- Production login repaired and verified: sign-in, workspace, sign-out and cookie revocation ([production-auth.md](production-auth.md)).
- ElevenReader book re-submitted as “Philippe Godfroy”, pending review.
- Neon restore drill passed; restore window 6 hours ([production-recovery.md](production-recovery.md)).
- Agent regression re-run: 6/6 on the current version (1,829 credits).
- Follow-ups sent to ElevenLabs support (Music + Explore) and on Showcase PR #113.
- Live monitor checks the site and production every 6 hours and emails on failure.
- Owner decisions: video and music OK, 3,013 credits OK, retention unchanged, no outreach posts.

## Waiting on others, no action needed

- ElevenReader review (decision by email).
- ElevenLabs support: Music Marketplace answer and Explore review time.
- Showcase PR #113: the repo rarely merges community entries; treat it as unlikely.

## Real-world validation (needs people)

- A small pilot with real users and giving the workshop (`public/learn/workshop.html`).
