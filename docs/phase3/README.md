# Phase 3 — Ecosystem Leadership

Independent feature branch; unreleased candidates. Begin with [Dutch execution report](execution-report-nl.md), [quality review](quality-review.md) and [integration plan](integration-plan.md).

- [AgentOps toolkit](../../packages/agentops-kit/README.md): reusable strict TypeScript package and safe CLI.
- [AgentProof pilot](../../apps/agentproof/README.md): local static evaluation workbench.
- [Corpus and reproduction](../../benchmarks/voice-ai/README.md), [benchmark report](benchmark-report.md): explicit synthetic fixtures; real historical provider cases remain separate.
- [Belgian workshop](../../community/elevenlabs-belgium/README.md): full no-key teaching package and HTML presentation.
- [Five article drafts](articles/), [LinkedIn/video drafts](articles/launch-materials.md).
- [Upstream example proposal](contribution/README.md): tested locally, no external PR.
- [Recognition portfolio](recognition-portfolio.md), [pilot kit](pilot-kit.md), [threat model](threat-model.md).
- [Budget](budget-report.md): zero new paid calls; shared account consumption remains separately reported.

Offline verification: `bash scripts/phase3/verify.sh`. Start the app preview, then run `node --import tsx scripts/phase3/browser-check.ts` for browser evidence. No live test is launched by those commands. Proposed CI is a file under scripts, not an active shared workflow.
