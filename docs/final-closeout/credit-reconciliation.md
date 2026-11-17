# ElevenLabs credit reconciliation

Account: Creator plan, monthly period, overage disabled (`max_credit_limit_extension: 0`, overage USD 0, no open invoices). No upgrade, purchase or overage in this task.

## Counter readings

| Reading (UTC)                 | Used    | Remaining | Note                                                |
| ----------------------------- | ------- | --------- | --------------------------------------------------- |
| 2026-11-10 05:02              | 108,689 | 20,026    | start of the Creative & Community phase             |
| 2026-11-10, end of that phase | 114,306 | 14,409    | 5,617 for the Product Launch repair                 |
| 2026-11-11                    | 117,319 | 11,396    | **3,013 not from any HarborVoice task** (see below) |
| 2026-11-16 21:00              | 117,319 | 11,396    | unchanged for five days; start of this task         |
| 2026-11-17 (end)              | 126,868 | **1,847** | after this task's three operations                  |

## This task's paid operations

Owner cap: 11,396. Operating rule: re-read the counter before each dispatch; overage off makes the balance a hard ceiling.

| #   | Purpose                                                                           | Estimate | Receipt   | Counter delta | Result                                                                       |
| --- | --------------------------------------------------------------------------------- | -------- | --------- | ------------- | ---------------------------------------------------------------------------- |
| 1   | Product Launch template example (template dialog, session `fQXyxs0nVOvvARIhySHp`) | 5,550    | 5,550     | 5,550         | Generated; **failed the quality gate** (title text rewritten); not published |
| 2   | Demo video narration, 9 segments, Eleven v4, flow `iaFZxWqsK4PLNq2ZE0bn`          | 2,274    | 2,274     | 2,274         | Accepted; transcript matches the script                                      |
| 3   | Agent regression, 6 native tests, suite `suite_7701m7kmzhrtenzsj6hh3qpqzk6y`      | ~1,900   | 1,725     | 1,725         | 6 / 6 passed on `agtvrsn_9601m6xjw36beketcgn7tzzze8zb`                       |
|     | **Total**                                                                         |          | **9,549** | **9,549**     | no unexpected charges                                                        |

## The 3,013-credit movement on 10–11 November

Evidence: Music → Generations lists a 3:04 song, **“Summer Never Gets Old”** (Music v2.5, pop), created on 10 November. It has no _Flows_ or _Video to music_ source badge, so it was generated in the native Music interface. At the UI's quoted rate of 900 credits per minute, 3:04 is about 2,760 credits; variations or lyrics may explain the rest. This is consistent with the 3,013 movement but not proven to be its only cause.

What is established: no HarborVoice script, Flow or tool in any task generated it. What is not established: which person or session did. It could be the owner in another browser, another logged-in device, or a shared login. **Owner action:** check _Settings → Workspace / Usage_ for the 10 November entries and whether anyone else has the login.

## Liabilities

Earlier phases carried historical reservations that overlapped posted usage. The counter was unchanged for five days before this task and every receipt here posted in full, so there is no pending charge from this task. Remaining safe allowance: **1,847 credits**. Recommended: no further paid work this period; the plan resets at Unix time `1796610620`.
