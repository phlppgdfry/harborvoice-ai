# Native resource registry

Fresh authenticated observations are in [native audit](native-resource-audit.json), [agent history](native-agent-audit.json) and [provider GETs](provider-readonly.json). Raw connector URLs carrying workspace-switch parameters are deliberately not saved; links below use canonical paths. Existence is separate from publication and content quality.

## Agents

| Agent                                | Current version                        | Auth / limits                                                                                          | Live status                                                                                             |
| ------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `agent_6901m6t6k3tpfnk9n2z3q2h1et7a` | `agtvrsn_9601m6xjw36beketcgn7tzzze8zb` | auth=True; {"agent_concurrency_limit": 2, "daily_limit": 30, "bursting_enabled": false}; duration 300s | Nora Main receives 100% branch traffic; Visitor exists but public trial is not treated as active access |
| `agent_8101m6vpg98dfwws14ng5nm6myws` | `agtvrsn_1101m6vpgagffrba8jzbk4jypd2c` | auth=True; {"agent_concurrency_limit": 1, "daily_limit": 2, "bursting_enabled": false}; duration 60s   | Nora Main receives 100% branch traffic; Visitor exists but public trial is not treated as active access |

Main uses v4 Turbo and deepseek-v41-flash; Visitor reports eleven_flash_v2 and gemini-2.5-flash. These are configuration reads, not newly measured quality. Branch IDs, exact test versions and traffic percentages remain in the receipt.

## Creative Flows

| Canonical Flow                                                               | Nodes | Current states                   | Publication / quality                                               |
| ---------------------------------------------------------------------------- | ----: | -------------------------------- | ------------------------------------------------------------------- |
| [autfYixTUdY8eSnjlDOb](https://elevenlabs.io/app/flows/autfYixTUdY8eSnjlDOb) |     3 | completed, static_asset          | NL/FR campaign submitted; no approval verified                      |
| [04Y2ZUoBsV1BQj9uMv9k](https://elevenlabs.io/app/flows/04Y2ZUoBsV1BQj9uMv9k) |    16 | completed, static_asset          | Product Launch withheld; native completion did not satisfy fidelity |
| [DkSzGeLnRPG557cTaRSf](https://elevenlabs.io/app/flows/DkSzGeLnRPG557cTaRSf) |    10 | completed, static_asset          | Learning submitted; excluded bad illustration remains historical    |
| [DOwVWkHNl1M8XZpmGo1C](https://elevenlabs.io/app/flows/DOwVWkHNl1M8XZpmGo1C) |     8 | completed, static_asset          | Existing production/education resource; no new publication claim    |
| [fRthJyA26LAFJ6NqNi6g](https://elevenlabs.io/app/flows/fRthJyA26LAFJ6NqNi6g) |     3 | static_asset                     | Three uploaded original tracks, not Marketplace listings            |
| [E2fQbenOCnV06r0CVwQ0](https://elevenlabs.io/app/flows/E2fQbenOCnV06r0CVwQ0) |     2 | completed, static_asset          | Existing production/education resource; no new publication claim    |
| [GznQuf5YZTpRrJQBpQSg](https://elevenlabs.io/app/flows/GznQuf5YZTpRrJQBpQSg) |     2 | completed, static_asset          | Existing production/education resource; no new publication claim    |
| [Xf1iuvlDWlQzdy9RhgdZ](https://elevenlabs.io/app/flows/Xf1iuvlDWlQzdy9RhgdZ) |     9 | completed, not_run, static_asset | Existing production/education resource; no new publication claim    |

Nine Flows were listed; the untitled `nJxjp3oNpnaSL5mPQUcm` was not content-audited. No pending node state was returned for the eight named Flows. This is not exhaustive account-wide pending-job proof.

## Knowledge and voices

| Type      | Name                           | Resource ID            | Verification                           |
| --------- | ------------------------------ | ---------------------- | -------------------------------------- |
| knowledge | Gate & collection procedures   | `0cWKuMvzyVrMJrwsZGIh` | Fresh GET 200; no content regeneration |
| knowledge | Customs & exception playbook   | `lqeVB5zAbP3PX07ycuTj` | Fresh GET 200; no content regeneration |
| knowledge | Multilingual service guide     | `upJ1H8u8g9Y5DcYmmuAA` | Fresh GET 200; no content regeneration |
| knowledge | Disruption response            | `BQTtheyqkToDdsLG8xmZ` | Fresh GET 200; no content regeneration |
| voice     | HarborVoice · Dutch Training 1 | `ZUpnQ45ABkkc2OcDuVHI` | Fresh GET 200; no content regeneration |
| voice     | HarborVoice · Dutch Training 2 | `GXnX5R1mzyXfGGG0fF4s` | Fresh GET 200; no content regeneration |
| voice     | HarborVoice · Dutch Training 3 | `pFO8yqt1betwfwbKm2y1` | Fresh GET 200; no content regeneration |

## Studio and Reader

- Studio caption project: `7IXHA48pFJqsSPSWtRtM`, historical corrected 36s native export; current API access 403, no new API round trip.
- Reader submission: `CJgq6QXO12sRReayiBoG`, fresh UI Pending review, not a public book listing.
- Learning template: `DkSzGeLnRPG557cTaRSf`; campaign template/Flow: `autfYixTUdY8eSnjlDOb`. Template accessibility does not establish Explore acceptance.

No native resource was modified or overwritten during this audit. Existing dubbing, narration and media-generation IDs remain in their original hashed provenance receipts; they are not invented where a provider identifier was unavailable.
