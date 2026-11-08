# VoiceBridge Belgium — event-ready concept

**CREATED — READY FOR REVIEW. No registration or event submission.**

## Date verification

Checked 8 November 2026: [the official site](https://hackathon.elevenlabs.io/) names an evening on **11 December**, lists **Ghent**, says spaces are reviewed rather than first-come and registration does not guarantee acceptance. It does **not identify a year** in its readable event information. Historical listings refer to 2025. An edition on **11 December 2026 is not confirmed** by this evidence. Do not book travel or announce attendance on that assumption.

A current venue, registration deadline, team-size rule, judging rubric, permitted pre-existing work and official submission deadline were not established. The event page's registration/location controls require authenticated/interactive review. Before approval to register, the owner should verify the year's active event, Ghent host, accessibility, timing, team rules, reuse policy, licensing, submission format and data restrictions. Do not claim the existing project qualifies as a newly built hackathon entry.

## Distinctive concept

VoiceBridge Belgium keeps the same business task understandable as a conversation changes between Dutch, French and English. A fictional shipment status, exact tool arguments, visible result, transcript and pending human-review proposal remain aligned. The goal is **semantic consistency under language changes**, not a generic talking avatar.

The public Community Studio provides a deterministic bilingual/multilingual walkthrough with visible tool traces; it does not pretend to be a live model. The existing private Nora interface supplies optional real natural voice interaction after authorized sign-in. Pre-recorded ElevenLabs commercial audio and a static fallback avoid an expensive event-time generation pipeline.

## Three-minute live demonstration

- **0:00–0:25:** "Three languages. One business rule." Show the synthetic-data label and exact referenceHV-2048. Explain that a customs hold cannot be cleared by conversational convenience.
- **0:25–1:00:** Dutch request. Show `lookup_shipment` arguments and actual synthetic record. If live voice is available, use the private Nora session; otherwise explicitly switch to the deterministic walkthrough.
- **1:00–1:35:** Switch to French and ask for an English handoff summary. Preserve identifier, hold and uncertainty. Show the proposal as pending, not completed approval.
- **1:35–2:10:** EnterHV-9999; the system requests correction rather than selecting another record. Inspect the visible failure trace.
- **2:10–2:40:** Show the two new native experiments: code-switched handoff and hostile instructions inside tool content. Separate six provider simulations from real-user evidence.
- **2:40–3:00:** Open source and limits. No real terminal integration, no official endorsement, no measured user adoption. Invite review of a reproducible failing case.

## Short pitch

Belgian businesses do not operate in one language, but their approval rules should not change when a caller switches language. VoiceBridge combines natural voice interaction with exact-reference tools, grounded knowledge and visible human review. HarborVoice supplies a reproducible case study and measured synthetic evaluations. The contribution is transparent failure handling: we show what the agent checked, what it proposed and what it still cannot know.

## Benchmark protocol

Freeze source commit, agent version, tools, fixtures and scenario wording. Report task success and tool/reference accuracy per language; treat grounding and handoff as separate criteria. Record latency only from instrumented requests with sample size. Transcription errors require aligned audio/reference text; text simulations cannot measure them. Human observations need voluntary consent and a privacy plan. Credits are account-wide observations plus itemized provider subsets; do not invent per-language billing. Current experiment JSON is a six-case synthetic sample, not a population benchmark.

## Current features researched

The [2 November 2026 changelog](https://elevenlabs.io/docs/changelog) says **Eleven Realtime is available to every workspace**; Mini and Max are complete voice-agent model choices. This is distinct from **Realtime Translation**, which remains Enterprise alpha. No Enterprise bypass is needed to investigate the former, and no live use of either model is claimed in this sprint. Existing Nora remains unchanged while trust-boundary experiments run on an isolated branch. New-model adoption requires a separately measured regression, not an untested production switch.
