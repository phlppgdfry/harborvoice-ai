# How I Built and Evaluated a Multilingual ElevenLabs Agent

Editorial draft for owner review. Evidence current to the Phase 3 branch; nothing here claims official recognition or external user validation.

HarborVoice is a fictional logistics workbench built to explore a practical question: can a voice agent help someone understand a shipment without inventing operational facts or taking authority it does not have? The difficult part is not producing a fluent sentence. It is preserving the same business boundary when a request becomes ambiguous, a source fails or the speaker switches languages.

The existing implementation separates the voice interface from the business rules. Agent configuration lives alongside source-controlled synchronization and evaluation scripts. Server-side integration supplies provider access; fictional business tools provide bounded records. The project is a case study, not a live terminal integration. Start with [the architecture](../../architecture.md), [the existing evaluator](../../../scripts/elite/evaluate.ts) and [the server integration](../../../server/elevenlabs.ts).

For a shipment held at a gate, a useful answer must remain consistent with the verified record. A user saying “it must already be released” does not change the record or grant permission. In Dutch, French and English, the expected boundary stays the same. That suggests a test structure with separate fields for request language, expected outcome and allowed tools instead of one free-form success description.

Phase 3 makes this distinction explicit in [Scenario and Result](../../../packages/agentops-kit/src/index.ts). Each result includes its evidence type. A local fixture exercises outcome/tool contracts. A provider text test exercises a different path. A recorded voice conversation includes audio evidence. A human microphone interaction adds recognition, turn-taking and device conditions that a text test cannot reproduce.

The existing evidence must also stay separated. The historical expanded suite reported 50/52; ten focused corrected regressions passed separately. Phase 2 later recorded six successful provider text simulations across handoff and hostile-tool-content cases. These are different samples, not a new combined accuracy rate. The six-case artifact reports 1,946 credits and explicitly excludes microphone quality and speech latency. See [the original evidence](../../recognition/agent-experiments.json).

A useful failure is a source timeout followed by an agent claiming success. The new workshop boundary demonstrates the safer behavior without an LLM: an exception returns `recover`, and a mismatched record returns `escalate`. Read [the starter](../../../community/elevenlabs-belgium/starter/agent.mjs) and its tests. These checks cannot prove the provider will choose the same behavior; they make the business expectation reviewable before paying to test it.

The next real experiment is deliberately small: pre-register a balanced multilingual subset, isolate two configurations, repeat the same cases and record evaluator, receipts and missing measurements. It remains deferred because concurrent account spending is not coordinated. That limitation is part of the result. A credible engineering portfolio should show what the evidence supports and what still needs to be measured.

Reproduce the local demonstration with the [benchmark instructions](../../../benchmarks/voice-ai/README.md). The [official SDK](https://github.com/elevenlabs/elevenlabs-js) remains the provider interface; AgentOps adds evidence structure rather than replacing it.
