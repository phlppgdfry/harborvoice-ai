# Integration plan

Base `a5b7c20`; branch `feat/elevenlabs-ecosystem-phase3`; worktree `/Users/philippegodfroy/harborvoice-phase3`. Original worktree and production/persistent-runtime left untouched. Owned paths: packages/agentops-kit, apps/agentproof, benchmarks/voice-ai, community/elevenlabs-belgium, docs/phase3, scripts/phase3. No root package/config/workflow/agent or native resource changes.

Phase 2 report exists and v2.1.0 is visible. This does not establish that its session is idle. No automatic integration, main update, production deployment or polling loop.

After both sessions are confirmed complete: fetch origin; inspect Phase 2 final report and latest commits; create a new integration branch from latest main; merge this feature branch without force push; review path conflicts and deployment invariants. Run Phase 3 verification plus existing npm check and relevant browser suites. Preserve Nora authentication, guest expiry/quotas, creative resources, budgets and private environment files. Do not carry the local node_modules symlink into Git.

Shared changes deferred: root package convenience scripts, GitHub Actions activation, static app route/domain and security headers, release/publishing workflow. Proposed workflow is in scripts/phase3/ci-workflow.yml, not activated. It performs no paid calls. Static AgentProof deploy requires owner approval for public pilot; a live server requires a separate security/budget design review. npm publication requires explicit approval and a fresh namespace check. No separate repo until reuse demand warrants it.
