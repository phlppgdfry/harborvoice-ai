# Enterprise Voice AI Reliability

Reproducible engineering study harness, corpus v1. The current Phase 3 results are **fixture contract executions**, not measured ElevenLabs reliability. Real historical provider observations are retained separately under `docs/recognition/agent-experiments.json`.

```sh
python3 scripts/phase3/build-corpus.py
node --import tsx scripts/phase3/benchmark.ts
```

110 cases, 11 categories, ten requests each. NL/FR/code-switch examples are concentrated in the multilingual category; the rest are English. This is a purposive teaching corpus, not a balanced language benchmark. Read `methodology.md` before interpreting results. Generated baseline and candidate JSON/Markdown/HTML include source commit, fingerprint, execution date, evidence type and limitations. No external endpoint or paid call is used.

Dataset and original code: MIT under repository license. Synthetic identifiers carry no relation to real shipments. Expected outputs are reviewable contracts, not externally validated human annotations.
