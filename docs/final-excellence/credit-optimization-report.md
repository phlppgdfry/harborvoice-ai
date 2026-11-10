# Credit reconciliation and optimization

## Fresh account observation

The baseline [subscription GET](account-baseline.json), confirmed again by [provider reads](provider-readonly.json), reports Creator / active; 108,689 used of 128,715; **20,026 remaining**. `max_credit_limit_extension=0`, `can_extend_character_limit=false`, `allowed_to_extend_character_limit=false`, current overage USD 0, no open invoices. Refresh/billing cadence is monthly. The returned next-reset timestamp is 1796610620; account-specific rollover vintage/expiry is not itemized by this response.

Official [billing documentation](https://elevenlabs.io/docs/overview/administration/billing) describes rollover up to two months of unused allocation while eligible plans are maintained; cancellation/downgrade affects rollover. This is a policy description, not proof of the vintage of these particular 20,026 credits. No plan, billing setting or payment account was changed.

## Outstanding evidence and liabilities

[Private-ledger metadata audit](ledger-audit.json) reads existing ledgers without modifying them. Elite and Recognition retain historical envelopes of **44,850.04** and **21,756**, including failed holds of 500 and 5,000; Phase 4 retains 5,800. Estimates alone differ from conservative maximum-of-estimate-and-receipt totals. Recognition's `prior-ledger` and Elite's ledger are duplicate historical snapshots, not independent invoices.

Those envelopes overlap already posted usage and are **not summed or subtracted as wholly unpaid charges**. No reliable operation-by-operation settlement exists for releasing their residual exposure. All four listed native test suites have zero pending cases. The eight named inspected Flows have completed/static/not-run states, with no pending state shown. The ninth untitled Flow and account-wide jobs across other product surfaces are not exhaustively reconciled.

The earlier **26,546** account decrease remains unattributed at exact job/session level. Historical hourly evidence identifies 20,223 Video Generation + 3,084 Flows + 2,740 Image Generation + 499 TTS in the relevant hour, totaling 26,546. That supports aggregate category reconciliation only. The fresh [deprecated usage endpoint response](usage-by-product.json) was HTTP 200 but empty and returned an unexpected time bucket; it does not independently reproduce or settle that historical attribution. No failed or delayed operation was declared free.

## Safe-budget decision

`SAFE_BUDGET = max(0, live balance - unsettled commitments - expected pending charges - reconciliation buffer)`.

Live balance is 20,026. The distinct unpaid liability and delayed-charge terms remain **unknown**, not zero. A proposed 3,000-credit contingency cannot make unknown liabilities known. Consequently the numeric safe budget is **not established**; the enforceable **new-dispatch cap is 0**. No new paid operation was submitted, no reservation was released and no local lock was treated as account-wide protection.

The current owner's full-safe-balance authorization supersedes earlier per-phase authorization limits for this phase. Additional generic permission to spend is not the missing ingredient. Required evidence is settlement and reliable exclusion/coordination of other account consumers. The Codex task list showed the relevant prior executions idle; process existence or idle state alone does not prove all outside consumers are excluded.

## Phase 6 spending and value

**Paid dispatches: 0. New paid jobs: 0. Phase-6 attributable dispatched spend: 0 credits.** Opening existing resources, running local software/EPUB/media checks and reading provider metadata did not submit generation. End-of-window account movement is recorded in [account closeout](account-closeout.json); aggregate movement would not automatically be attributed to this execution.

Value delivered without generation: billing freeze regressions, correct public submission claims, EPUB integrity repair, local fonts and privacy improvement, current native/resource/production receipts, repeatable QA, prospective multilingual holdout, complete final handoff. Existing professional media were reused.

## Dynamic next-operation plan

Planning priorities below are judgments about future value, not measured quality scores. Each paid candidate remains unsubmitted with a zero current reservation.

| Candidate                                                                       | Value / evidence / reuse | Risk and cost bound                                                                          | Decision                                                                    |
| ------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Balanced holdout on an isolated agent branch, then one repeat of selected cases | High / high / high       | Obtain current estimate; reserve per batch with job IDs, no automatic retry                  | First priority after liabilities settle; do not route production traffic    |
| Six short EN/NL/FR recorded-audio probes                                        | High / high / medium     | Bound recording duration and current ASR/TTS prices before submission                        | Follow behavioral regressions; do not label physical microphone testing     |
| Product Launch fidelity correction                                              | Medium / medium / medium | Quote again before one bounded preview; previous successful execution had an unusable result | Defer until reference/prompt path is understood; no speculative model batch |
| More music, decorative images or duplicate examples                             | Low additional value     | Unnecessary generation                                                                       | Reject                                                                      |

Before any future dispatch: fresh counter and overage checks, distinct settled/unsettled liability inventory, concurrency coordination, persistent unique operation ID, bounded estimate/reservation, provider ID, quality review and final cost receipt. Stop on excess or ambiguous consumption. The corrected governor enforces an additional local freeze, not distributed authorization.
