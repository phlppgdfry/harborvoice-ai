# LinkedIn drafts and technical video outlines

Prepared only. No publication or scheduling. Update branch/release links after approved integration. Avoid claiming provider endorsement, new live research, users or acceptance.

## 1 — Multilingual case study

LinkedIn: I built HarborVoice to explore a concrete voice-agent boundary: the language can change, but a shipment hold must remain a hold. My case study separates business-tool contracts, provider text simulations and microphone evidence. The new AgentProof demo makes those distinctions visible. It uses synthetic fixtures; six earlier provider cases remain a separate, small sample. Source and limitations are included for review.

Video (5 minutes): 0:00 business question; 0:40 architecture and synthetic data; 1:30 same invariant in EN/NL/FR; 2:30 historical evidence and missing audio measurements; 3:30 show failing tool boundary; 4:30 reproduce and state next experiment. Show actual files and local UI; do not narrate a fixture as a live call.

## 2 — Failure testing

LinkedIn: A correct tool name can accompany an incorrect answer. My new teaching corpus includes timeouts, malformed responses, conflicting knowledge and hostile instructions. AgentProof shows why a source error followed by “success” fails the contract. The 110-case run is deterministic and deliberately scripted; it demonstrates the test machinery, not real-agent accuracy.

Video: reproduce tool-error-01; inspect expected/observed outcome; show baseline code; compare candidate; explain category-conditioned fixtures; describe held-out provider experiment and uncertainty. End with one unresolved metric, not an unsupported reliability claim.

## 3 — AgentOps package

LinkedIn: I prepared an independent TypeScript AgentOps toolkit for ElevenLabs projects: redacted inspection, configuration diffs, explicit evaluation transports and evidence exports. It builds and runs a no-key example locally. The CLI is ours, not a native ElevenLabs command. Paid execution, registry publication and distributed spending coordination remain separate review items.

Video: build package; inspect fictional config; diff a prompt/tool change; demonstrate redaction; run tests; export HTML; inspect source commit and limitations. Explain heuristic findings versus security certification.

## 4 — Cost control

LinkedIn: Two agents reading the same balance can still overspend together. I kept Phase 3 provider generation off because account-wide coordination with the parallel session was unverified. The budget model preserves reservations, failed holds, other commitments and a buffer. A local lock only protects participants using that lock. The code and report make that boundary explicit.

Video: draw two concurrent balance checks; show reservation lifecycle; partial/large receipts; failed hold test; stale snapshot stop; distinguish local calculator from distributed dispatch. Never show the private ledger, API key or account billing details on screen.

## 5 — Production architecture

LinkedIn: A voice demo needs more than a good prompt before it can take business actions. My architecture walkthrough covers identity, tool authorization, validated source data, bounded spending and data retention. AgentProof's public surface is a static evidence demo with no provider key or live-generation endpoint. Real-user validation is still to come.

Video: static demo boundary; server-side live architecture proposal; authorization before side effect; source mismatch test; redacted reporting; retention/deletion limits; pilot success criteria and explicit remaining work.
