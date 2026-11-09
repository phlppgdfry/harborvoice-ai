# Methodology v1

## Questions and hypotheses

RQ1: Can a developer reproduce and localize contract failures? H1: the intentionally unsafe local policy fails all tool-error, malformed-response and source-conflict contracts. H2: replacing those three category policies removes the deliberate failures. These are deterministic software hypotheses, not claims about a language model.

RQ2–8 (real business reliability, failure distribution, language, tool recovery, retrieval, latency/cost, interventions and reproducibility) remain open for a prospective provider study. Historical six-case simulations illustrate provider evidence but do not answer all questions.

## Design

110 distinct synthetic requests, eleven categories of ten each. See corpus.json for exact inputs, expected outcomes, tools, languages and conditions. Ten multilingual inputs include Dutch, French and code-switching; remaining categories use English. Category metadata deliberately selects a fixture policy. Baseline accepts unverified data in three categories; candidate recovers/escalates. All other policies match the expected category contract by construction. One deterministic repeat. No random sample, speech input, audio output, actual tool side effect or subjective fluency review.

Exact equality on outcome and sorted tool names is the entire rubric. Tool argument validity, duplicate tool calls, answer correctness, grounding semantics and conversational quality require additional checks. A case passing does not establish production task completion.

## Prospective live design (not executed)

Pre-register 12 scenarios balanced across en/nl/fr and four boundaries: ordinary lookup, ambiguous reference, tool failure, hostile tool content. Two isolated configurations × two repeats = 48 provider text tests. Use official `runTests` with version-pinned configuration, fixed test IDs, bounded turns, mocked business tools and recorded provider/API SDK versions. Start with two sentinels, reconcile receipts and stop if conservative total exceeds the lower of workstream allowance, phase headroom and account preservation capacity. Do not execute if account-wide coordination is unverified. The current 20,000 phase envelope includes a non-spendable 3,000 buffer; retained commitments from earlier phases must remain covered.

Record agent ID privately, publish a pseudonym; model, voice, language, config hash, provider test ID, date, outcome, evaluator, repeat, receipt, error and missing measurements. Unknown costs remain unknown. Provider judgments require human spot review. A transcript-only test must not acquire a latency or microphone metric. Future latency requires a defined start/end event, transport and measured distribution.

## Statistics and validity

Report numerator/denominator by configuration, category, language and evidence type; paired transition table for the same cases. For an independently sampled binary outcome, Wilson 95% intervals may be informative. Do not apply population confidence claims to this deliberately scripted corpus. Repeated cases share prompts/configs and are clustered; do not treat repeats as independent new tasks. For a small paired prospective experiment, report exact transitions and uncertainty, avoid significance claims without power analysis. Freeze the corpus before configuration tuning and keep a holdout set for any later quality claim.

Historical 6/6: illustrative Wilson lower bound about 0.61, upper 1.00. Cases were purposively chosen, with no random sampling or repeats, so even this interval is not a justified deployment guarantee.

Threats: synthetic tasks, category-conditioned stubs, English-heavy design, no blinded annotators, no field users, no human-audio sessions, provider judge bias, temporal model drift, unavailable raw historical transcripts and partial provider billing attribution. Findings cannot support competitive rankings or safety certification.

## Structured contract extension (Phase 4)

`npm run test:contracts` runs twelve separately authored adversarial observations, balanced across EN/NL/FR. Three valid controls pass; nine intentionally flawed observations fail. Unlike the 110 category-selected teaching policies, the observation map is stored separately and the validator checks optional ordered tool arguments and exact structured facts, including extra claims. The data remain synthetic and deliberately known to the author. This is validator sensitivity evidence, not an independently annotated model holdout or a provider success rate.

For a future provider study, freeze scenario IDs, trusted fixture records, extraction rules and configuration hashes before running. Use a second reviewer for reference, action authority, uncertainty and language correctness; record disagreements and missing evidence. Store consented transcripts privately, publish only reviewed synthetic summaries. Treat each configuration/language as a separate small sample. Paired repeats are correlated; Wilson intervals do not fix sampling bias or establish population reliability. Start with two sentinel cases only after a fresh cost quote and explicit owner budget; do not infer funding from this plan.
