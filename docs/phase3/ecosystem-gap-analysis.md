# Ecosystem gap analysis

Audit: 8–9 November 2026. Base: HarborVoice `a5b7c20`. Phase 2 `v2.1.0` report and visible remote branch were inspected. A release report does not prove the parallel session has stopped spending.

## What already exists

| Tool / component                                                                                           | Strength                                                                             | Boundary relevant here                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| [Official JS SDK](https://github.com/elevenlabs/elevenlabs-js)                                             | Typed account/agent APIs; documented `agents.get` and `agents.runTests`              | A provider client, not an evidence policy or distributed credit coordinator                                                             |
| [Official CLI](https://github.com/elevenlabs/cli)                                                          | Voice-agent development commands                                                     | Do not duplicate it or claim its commands are AgentOps commands                                                                         |
| [Official examples](https://github.com/elevenlabs/examples)                                                | Runnable SDK/UI integrations and prompt-driven scaffolding                           | Current README focuses on capability quickstarts; a no-key failure-evidence teaching example is a plausible addition                    |
| [Official UI](https://github.com/elevenlabs/ui)                                                            | Audio and agent interface components                                                 | UI components do not establish benchmark validity                                                                                       |
| [Showcase](https://github.com/elevenlabs/showcase)                                                         | Reviewed project discovery                                                           | Not evaluation certification; Phase 2 already prepared a Showcase contribution                                                          |
| HarborVoice Credit Governor                                                                                | Persisted reservations, failed holds, snapshots, local filesystem mutex              | Worktree-local paths are not a distributed account lock; preserve existing ledger                                                       |
| HarborVoice evaluations/sync                                                                               | Existing 52-case suite, focused regressions, configuration/knowledge synchronization | Logistics-specific and separate evidence populations; no rewrite needed                                                                 |
| HarborVoice v2.1 workshop                                                                                  | Existing 90-minute notes and five starter tests                                      | Extend with reusable evidence analysis and participant kit rather than recreate a first-agent demo                                      |
| [promptfoo](https://github.com/promptfoo/promptfoo) / [DeepEval](https://github.com/confident-ai/deepeval) | General evaluation frameworks                                                        | Broader alternatives; no claim that these cannot support voice testing. Their presence weakens any claim of inventing evaluation itself |

Official repos were verified via GitHub API; examples HEAD `07454da05a9265bb008a5024771cf51ae2f66eb3`. Context7 fetched official JS reference: `runTests` is current; legacy simulation endpoints are deprecated. Recheck installed SDK compatibility before live execution.

## Concrete problem

A successful agent simulation, a scripted demo and a recorded microphone interaction are too easy to combine into one impressive-looking number. Configuration changes, tool contracts, cost uncertainty and evaluator provenance then become difficult for a reviewer to audit together.

Differentiation: a small local toolkit and UI that keep evidence types explicit, export configuration fingerprints and limitations, demonstrate failure transitions, preserve unknown costs, and refuse budget eligibility without fresh balance and coordination. This is evidence plumbing and developer education, not another speech generation wrapper.

## Feasibility and priorities

P0: no-key evaluation schema, redacted diffs, deterministic transports, conservative calculator, reproducible exports. P1: inspectable product with 110 contracts and failure comparison. P2: explicit current SDK read adapter and proposed controlled live study. P3: validated upstream example proposal, practical workshop and review-ready educational content. Defer registry publication, external PR, public recruitment and deployment to owner review. No competitive superiority or ecosystem-wide absence claim is justified by this limited audit.

Retain existing SDK, test runner, MIT license, source fonts and release-report evidence. Do not copy existing Nora config into a public new agent or alter native resources. Package extraction remains inside HarborVoice until reuse justifies another repository.
