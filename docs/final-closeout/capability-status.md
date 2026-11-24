# ElevenLabs capability status (current)

Checked 24 November 2026. This file is the **current** view of the 122 rows in the historical [capability matrix](../final-excellence/capability-matrix.json); older matrices are snapshots. Per-item project status lives in [MASTER-COMPLETION-TRACKER.md](MASTER-COMPLETION-TRACKER.md).

## Counts

| Status                                                   | Matrix (10 Nov) | Now (24 Nov) |
| -------------------------------------------------------- | --------------: | -----------: |
| Verified (existing or live)                              |              59 |       **63** |
| Configured, delivery not yet proven (post-call webhooks) |               2 |            2 |
| Reviewed, owner decision (privacy and retention)         |               0 |            1 |
| Planned / not yet demonstrated                           |              33 |           30 |
| Plan restricted, permission blocked or blocked           |              18 |           18 |
| Submitted for external review                            |               2 |            2 |
| Not applicable, not supported or not verified            |               8 |            6 |
| **Total**                                                |         **122** |      **122** |

Changed rows since the matrix:

| Row                     | Was            | Now                                                                                                   |
| ----------------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| `test-nextreply`        | Planned        | **Verified** — 3 Next Reply tests ([report](agent-unit-tests.md))                                     |
| `test-toolcall`         | Planned        | **Verified** — 5 Tool Call tests with exact parameter checks                                          |
| `probabilistic-testing` | Not verified   | **Verified** — 5 repeats, 40/40                                                                       |
| `python-sdk`            | Not applicable | **Verified** — read-only [Python SDK example](../../examples/python/agent_test_report.py), SDK 2.79.0 |
| `privacy`               | Planned        | **Reviewed, owner decision** — recording on, unlimited retention kept; pilot text matches             |
| `postcall`              | Not verified   | **Configured** — Nora-only HMAC webhook, unsigned call 401; real delivery waits for one call          |

## What is still unused, and when

Credits: the included monthly credits are used up (0 left on 24 November); nothing more can be paid for and no overage is possible. Everything below that needs credits starts **after the reset on 7 December 2026 03:30 CET**. Cost bands are rough: **0** = configuration or read-only, **low** = under ~500 credits, **medium** = ~500–3,000, **high** = over ~3,000. Always read the balance and use estimates before a paid step.

### December, agent engineering (highest value)

| Capability                          | Plan                                                                                         | Cost             |
| ----------------------------------- | -------------------------------------------------------------------------------------------- | ---------------- |
| Microphone test EN/NL/FR            | Owner script in [owner-actions.md](owner-actions.md)                                         | low–medium       |
| Post-call webhook delivery          | Check `webhook_events` after that same call                                                  | 0 extra          |
| Native guardrails                   | On a branch: prompt-injection + custom "no release/clearance promise"; unit tests then merge | low (+ per call) |
| Structured procedure                | Escalation procedure (confirm reference → reason → `request_escalation` → read back status)  | low              |
| Agent workflows / workflows as code | Split "shipment lookup" and "procedures/knowledge" nodes only if tests show a need           | low–medium       |
| Agent-to-agent handoff              | Specialist sub-agent for customs questions; only with a concrete test case                   | low–medium       |
| Analytics, Spotlight, Architect     | Useful once real calls exist (pilot); triage tickets from failed calls                       | 0                |
| Monitoring and alerts               | Turn on agent alerts (failure rate, tool errors) once there is traffic                       | 0                |
| OpenTelemetry                       | Only with a collector to send to; otherwise skip                                             | 0                |
| Widget                              | Embed on the showcase only behind a click, because every visitor call spends credits         | per call         |
| Realtime models / Speech Engine     | One latency comparison against the current setup                                             | medium           |
| Multimodal input                    | Text + image (e.g. photo of a seal number) only if it fits the story                         | low              |

### December, audio and creative (portfolio)

| Capability                               | Plan                                                             | Cost          |
| ---------------------------------------- | ---------------------------------------------------------------- | ------------- |
| Product Launch template retry            | Text-free product photo ([product-launch.md](product-launch.md)) | high (~5,550) |
| TTS and dialogue WebSockets              | Latency script next to the existing HTTP streaming benchmark     | low           |
| Multichannel transcription               | Two-speaker stereo recording of a demo call                      | low           |
| Music inpainting / continuation          | Extend or repair one existing track                              | medium        |
| Audio effects, voice remix               | One example each                                                 | low           |
| Image editing, Flows agent               | One edit of an existing still; one flow built by the agent       | low–medium    |
| Lip sync, avatars, Dubbing Studio, GenFM | One short clip each, only if it improves the showcase            | high          |
| Audio Native                             | Narration player on one Learn page                               | low           |

### Needs an owner decision (no credits)

| Item                              | Why it waits                                                                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Server/webhook tools              | Needs a new public endpoint; production deploys are frozen (`git.deploymentEnabled=false`)                                            |
| Publish AgentOps Kit to npm       | Public release under your name                                                                                                        |
| ElevenLabs Startup Grant          | For startups under 25 employees; requires applying as a company and accepting the [grant terms](https://elevenlabs.io/startup-grants) |
| Pilot, workshop, paying customers | Needs real people                                                                                                                     |
| Capability Explorer page          | Optional new site section built from this file and the JSON matrix                                                                    |

### Not possible on this account

Plan restricted or permission blocked: instant and professional voice cloning (own recording and verification), Studio/Templates/Image-Video/Ads APIs, code tools, MCP tools inside agents, telephony, WhatsApp/Slack channels, human transfer, zero retention, redaction, private deployments, service accounts, SSO. These need a higher plan or provider approval; none is pursued without your decision.
