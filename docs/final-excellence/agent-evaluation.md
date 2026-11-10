# Agent reliability and realtime evidence

## Fresh provider verification

[Native invocation metadata](native-agent-audit.json) was read from the authenticated provider without executing tests.

| Suite / version                                                             | Result | Repeats | Historical provider credits |
| --------------------------------------------------------------------------- | ------ | ------- | --------------------------: |
| Original six scenarios / `agtvrsn_1501m6vbp7n6f1bb4c9edh9n8aks`             | 6/6    | 1       |                       1,714 |
| Elite 52 scenarios / `agtvrsn_6901m6w7hx46fvyr49tw0924sqwb`                 | 50/52  | 1       |                      16,622 |
| Targeted remediation / `agtvrsn_0301m6w8c2dvessrk4p8tgd6j695`               | 10/10  | 1       |                       2,967 |
| Context/trust-boundary experiments / `agtvrsn_3801m6y70js0e5nv479tj0zedfc7` | 6/6    | 1       |                       1,946 |

These are text simulations with synthetic business tools, not four independent estimates of production reliability. Do not pool them, count remediation as an independent holdout, or infer a success percentage for all languages. The final prompt never received another full 52-case campaign. Native Main currently receives 100% traffic and reports version `agtvrsn_9601m6xjw36beketcgn7tzzze8zb`, which differs from these receipt versions. Evaluation branches receive 0%.

## Evidence types

| Method                    | Existing evidence                                                     | Phase-6 result                                                           |
| ------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Contract tests            | 110 deterministic scenario fixtures; 12 structured EN/NL/FR contracts | Offline pipeline rerun; these measure scripted boundary/report mechanics |
| Provider Tool Call tests  | Adapter and prospective plan                                          | No new native tool-selection execution                                   |
| Next Reply scenario tests | Supported officially; separate from simulation                        | Not executed in Phase 6                                                  |
| Multi-turn simulations    | Provider suite table above                                            | Fresh receipt verification only; no paid rerun                           |
| Recorded audio            | Historical Scribe realtime and visitor WebSocket receipts             | Local media decode only; no fresh ASR campaign                           |
| Physical microphone       | Prior owner interaction is not a reproducible multi-device campaign   | Not executed by this agent                                               |
| Human review              | Phase-5 owner approved the Reader preview                             | No new identified multilingual native-speaker or music review            |

## Realtime limits

Historical [streaming TTS](../elite/streaming-speech.json): one sample, first byte 315.27 ms, total request 462.00 ms, audio 4.5975 seconds. This is HTTP/network timing, not time-to-first-played-audio or agent turn latency. Historical [Scribe realtime](../elite/realtime-scribe.json) streamed prerecorded PCM; first partial event at 1,411 ms and committed transcript at 6,376 ms. Audio duration and deliberate input pacing affect these observations.

The historical [visitor connection](../visitor-voice-verification.json) used synthetic prerecorded microphone input and received nine incoming audio frames, ASR and a shipment lookup. It does not establish human barge-in quality, mobile interaction, outage recovery or current-production latency percentiles. No new percentile or recovery-rate claim is made.

## Prospective holdout and acceptance

[Frozen prospective cases](holdout.json) contain 18 scenarios, six each in English, Dutch and French. They are separate from existing optimization fixtures and have no results. Their local hash records the chosen set, not independent statistical validation. No agent prompt was tuned against them.

After budget settlement, create a non-live branch from the exact baseline version. First run one bounded balanced subset, inspect tool parameters/grounding/escalation/errors per case, then one repeat of the most consequential cases. Retain denominators, failures, version IDs, timestamps and costs. Require no unauthorized business action or invented reference; compare acceptance on the same cases before deployment. Report uncertainty descriptively for this small curated set; do not generalize to population reliability.

## Exact owner-run physical pilot

Use only fictional references on the existing operator-protected site. Log browser/device/OS, agent version and network. Obtain a bounded voice reservation first; do not activate telephony.

1. In a quiet setting, request HV-2048 in English; verify recognition, read-only lookup, audible response and no invented clearance.
2. Repeat in Dutch and French; have an identified fluent reviewer record pronunciation, meaning and language switching separately.
3. Interrupt mid-answer, correct a reference twice, ask an ambiguous question, cancel and reconnect. Record whether speech stops and context remains accurate.
4. Temporarily disconnect the test device's network; measure reconnect behavior and prevent duplicated business actions. Record actual timings and failures.
5. Repeat on one real mobile device. Confirm conversation persistence after reload and authorized deletion at both application and provider surfaces using an explicitly disposable test record.
6. Record the operator's decision and limitations. No consent, recording, participant feedback or successful deletion is invented by this checklist.
