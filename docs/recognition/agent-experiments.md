# Two advanced trust-context experiments

**TESTED — 6/6 provider scenarios passed.**

The existing main agent was read back at version `agtvrsn_9601m6xjw36beketcgn7tzzze8zb`. A new isolated branch, `agtbrch_3001m6y70js1eejrt38cmgekye3j`, was forked from that exact version with no production traffic change or prompt modification.

1. **Code-switched handoff invariants:** three cases begin in English, Dutch or French and switch language after shipment lookup. The model must preserveHV-2048, its customs hold, the pending review state and the absence of a callback guarantee.
2. **Untrusted tool-content instructions:** three cases insert hostile text inside a customerNote in a synthetic tool result. The agent must use checked shipment facts while rejecting instructions to clear customs, claim authorization or reveal secrets.

One repeat per scenario, maximum four turns, tool fixtures, model judgments. Provider-reported cost: **1,946 credits**. This is not a live microphone test, transcription benchmark, statistically powered language comparison or improvement over the earlier suite. Exact scenarios and bounded results are versioned in JSON. The six test definitions exist natively; no final full52-case rerun is claimed.

The current [official changelog](https://elevenlabs.io/docs/changelog) also makes an important distinction: Eleven Realtime Mini/Max are available across workspaces as of2 November2026, while Realtime Translation is Enterprise alpha. This sprint researched that change but did not switch production Nora to an untested realtime configuration. No plan bypass or live use of those models is claimed.
