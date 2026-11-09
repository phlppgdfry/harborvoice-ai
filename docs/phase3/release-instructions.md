# Release candidates

AgentOps Kit v0.1.0 and AgentProof Pilot v0.1.0 are local unreleased candidates. Build/check offline, inspect npm pack manifest, confirm MIT/source/font licensing, review changelog and new evidence artifacts. A final benchmark run includes its execution source commit; generated artifacts naturally land in a later delivery commit. Record both rather than replacing provenance with an invented self-referential hash.

Use `npm pack --dry-run --json` from `packages/agentops-kit` to inspect distribution contents. Package runtime has no third-party dependencies. Registry availability is transient; check again immediately before publication. No registry publication authorized by this work. No stable guarantee implied by 0.1.0.

After approved integration, run existing regression suite and Phase 3 checks, then build a static app artifact. Owner reviews deployment/pilot launch and package publication separately. Do not enable provider tests on PR events. Any live test dispatch requires explicit bounded authorization and verified shared account coordination.

Registry check on 8 November 2026: `npm view harborvoice-agentops-kit version --json` returned E404. The name was not visible in the public registry at that moment; it was not reserved. Correct package dry-run manifest: nine files, about 8.1 KB compressed at the check time, built JS/declarations plus README/license/package.json only. No HarborVoice media or credentials included.

Local packaging: `bash scripts/phase3/package.sh` after verification. It creates a real toolkit tarball and static app ZIP under ignored `var/phase3/releases`, runs the unpacked CLI without dependencies, and makes no publication call. See release-artifacts.json for the latest recorded hashes. The source branch carries code and receipts; build archives remain local until an approved release.
