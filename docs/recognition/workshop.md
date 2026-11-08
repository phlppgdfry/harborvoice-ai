# Build Your First Reliable Multilingual Voice Agent

**READY FOR REVIEW — proposed 90-minute workshop, not an event that has happened.** Suitable for an online group or a small developer gathering in Belgium. Independent teaching until any Ambassador affiliation is formally accepted. No invitations, bookings or external messages have been sent.

## Instructor preparation

Clone the exact release commit, use Node24, run `npm ci`, `npm run check` and the dependency-free starter tests. Open the recorded EN/NL/FR films. Check the live agent privately without extending public visitor limits. Prepare a fixture-only fallback. Ask participants to use fictional data and their own authorized provider accounts; never collect their keys. Do not record voices or names without explicit consent.

## Workshop notes / slide sequence

1. **0–8min: One business question.** A customer asks about HV-2048; an answer is not an approval. Show recorded output and identify its provenance.
2. **8–18min: Draw authority.** Tool facts, knowledge procedures, model wording and human decisions. Show the existing architecture diagram and one source document.
3. **18–32min: Safe tools.** Run `examples/reliable-agent-workshop/starter.mjs`. Participants add validation and distinguish a missing reference from an unavailable service.
4. **32–45min: Human review.** Create a pending fictional proposal. Ask the class to identify sentences that would falsely imply completed approval.
5. **45–60min: Multilingual consistency.** Switch EN→NL→FR while preserving exact reference, hold state and uncertainty. Compare deterministic examples with a separately labeled private live voice demonstration if available.
6. **60–75min: Evaluate a failure.** Inspect one historical failed fixture and the limited targeted rerun. Build a negative test. Explain why 50/52 and10/10 are separate results.
7. **75–84min: Spend and deployment.** Show the ledger, failed holds, provider IDs and reviewed-hash sync refusal. No paid generation during the exercise.
8. **84–90min: Participant review.** Explain one observed failure, one fixed boundary and one unmeasured limitation. Invite voluntary anonymous feedback through an owner-selected process after approval.

## Practical exercises

- Beginner: validate `HV-2048`, reject malformed input and return `found:false` for HV-9999.
- Intermediate: a failed lookup must not produce a successful handoff confirmation.
- Multilingual: preserve the exact reference and pending state when changing the response language.
- Advanced: add idempotency in a persistent adapter and test a repeated request after timeout.

## Evaluation rubric

Score each criterion0–2: correct input boundaries; facts from the right source; pending review stays pending; language switch preserves identifiers; failure test is meaningful; limitations are stated honestly. Maximum12 is workshop feedback, never an official credential. Require all safety boundaries before a participant demo is described as suitable for real integration.

## Budget and facilitation

The default workshop is entirely fixture/recording based and costs **zero provider credits per participant**. Optional live demonstration: reserve at most1,000 credits for the instructor and check current balance/limits; this is a future proposed allowance, not authorization or spending in this sprint. Participant live experiments need separate owner-approved budgets. Stop after a failure and inspect the provider job ID instead of retrying.

## Starter and demonstration

The starter is packaged inside the current repository and has its own five deterministic tests. Nora remains the real private demonstration agent; no duplicate workshop agent was created. The public visitor window is deliberately finite. A presenter should sign in privately for any authorized live session and show recorded output if the provider is unavailable.

Instructor close: ask each participant to state what their test proves and what it does not. Do not invent attendance, testimonials, certificates or community reach. Add actual event date, attendees and feedback only after a real approved session.
