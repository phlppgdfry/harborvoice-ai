# Evaluation conditions and results

Three evidence layers remain distinct: local business/security/SDK-contract tests; provider text simulations with synthetic tool fixtures; and recorded real voice-session checks. The Elite suite does not reuse the six historical cases as if they were 52 new successes.

The full Elite suite executed 52 versioned scenarios once, four caller turns per scenario, with exact synthetic shipment and ticket responses. The provider reported 16,622 credits and 50 passes. Prompt-injection, claimed authority, customs pressure, privacy, unknown references, tool outages, source grounding, handoff honesty and estimates were covered across four languages. Inspect [the complete results](evaluation.json).

The two failures led to explicit prompt and fixture correction. Ten targeted multilingual cases then passed, at a provider-reported 2,967 credits. This subset covers the changed behavior and selected customs regression; it does not prove that all 52 cases pass against the final prompt. The provider judgment is not an independently proctored assessment.

Real simulation transcripts also contain provider turn metrics. They measure text-model and RAG timing under the simulation conditions, not human microphone round trips. No invented improvement percentage or production SLA is reported. The separate [realtime Scribe check](realtime-scribe.json) streamed six seconds of prerecorded synthetic PCM at real-time pace and recorded partial/committed events.

Paid evaluation is explicit and resumable: `npm run elite:evaluate -- run` refuses an existing invocation. Default report refresh and `npm run elite:remediate` poll recorded invocations without creating new ones. CI performs only local tests and browser fixtures.
