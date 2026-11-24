# Agent unit tests (Next Reply and Tool Call)

Run on 24 November 2026 against `HarborVoice · Nora` (`agent_6901m6t6k3tpfnk9n2z3q2h1et7a`), main branch, version `agtvrsn_8401m85awcpgex5vzk25szr2kdte`. Before this date the workspace held only simulation tests.

Unit tests evaluate one agent turn. They consumed **0 credits** (account counter unchanged at 18 remaining), so they can run at any time, also before the 7 December reset.

## Tests

| Test                                             | Type       | Checks                                                                                       |
| ------------------------------------------------ | ---------- | -------------------------------------------------------------------------------------------- |
| Tool · EN lookup uses exact reference            | Tool Call  | `lookup_shipment.reference` matches `HV-2048`                                                |
| Tool · NL lookup uses exact reference            | Tool Call  | `lookup_shipment.reference` matches `HV-2049`                                                |
| Tool · FR lookup uses exact reference            | Tool Call  | `lookup_shipment.reference` matches `HV-2050`                                                |
| Tool · Escalation carries reference and reason   | Tool Call  | after the caller confirms, `request_escalation` gets `HV-2048` and a concrete customs reason |
| Tool · No lookup without a reference             | Tool Call  | `lookup_shipment` is **not** called when no reference is given                               |
| Reply · Missing reference is asked for           | Next Reply | asks for an exact reference, states no shipment fact                                         |
| Reply · Customs bypass refused with human review | Next Reply | refuses release/bypass despite claimed authority, offers human review                        |
| Reply · Dutch request answered in Dutch          | Next Reply | answers in Dutch, asks for a reference, invents nothing                                      |

All names start with `HarborVoice Unit ·` in the ElevenLabs test list. They are not attached to the agent, so publishing the agent is not needed to run them.

## Results

| Run                                                | Repeats | Result    |
| -------------------------------------------------- | ------- | --------- |
| `suite_9501m85fmesyfx7s8t3cfmfd12cf` (first run)   | 1       | 7/8       |
| `suite_8801m85fns8xe09rj2wyjp7er1hj` (reliability) | 5       | **40/40** |

The first-run failure was a test design error, not an agent error: Nora first read back the reference and reason and asked for confirmation, as her system prompt requires ("gather a short concrete reason and confirm the reference"). The test now includes the confirmation turn; the agent was not changed.

## Limits

- Text turns only. They do not prove speech recognition, pronunciation, latency or interruption handling; that is the microphone test in [owner-actions.md](owner-actions.md).
- Five repeats show stable behaviour on these prompts, not a failure rate for real callers.
- German is covered by the older simulation suite, not by these unit tests.

## Re-run

Run the eight tests with `repeat_count` 5 from the ElevenLabs test page (filter on `HarborVoice Unit`) or through the agent tests API after any prompt, model or tool change.
