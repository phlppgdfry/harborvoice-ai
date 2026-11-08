# Sprint audit — 8 November 2026

Base release: v2.0.0, commit `9001fb4931a7619cfb4452986ce220660c861ed8`. Clean checkout before a new `feat/recognition-v2.1` branch. Existing v2.0 functionality and media are retained. The production/persistent-runtime worktree also exists and is not modified by this sprint.

The current provider balance was **74,484** at 18:11:14 UTC. The previous execution has zero pending/reserved jobs. Its 50,000 ceiling, 35,716 account-wide observed usage, 44,850.04 conservative liability, 500 failed hold and 5,000 buffer are preserved in a private snapshot. The additional execution has its own 25,000 ceiling and 3,000 internal buffer; routine planned commitments can total at most 22,000. The original governor policy remains the default; the new caller explicitly selects the new authorized envelope. Tests prevent treating the new ledger as valid under the old stricter policy.

Multiple Codex and MCP host processes exist. Process presence alone does not establish paid work; no ongoing HarborVoice generation worker was identified, and no previous job remains pending. This is not a distributed account lock. A private coordination notice identifies this sprint and ledger. All requests in this sprint run sequentially with reservations; an unexplained account decrease requires inspection rather than increased spending. Other sessions must not generate against this account concurrently.

## Existing gaps

- Studio API allowlisting remains provider-controlled. Existing native captions are real, but its source video is the earlier cut. Final masters are already preserved in the Commercial Flow. Check native replacement without regenerating the film.
- Four native factories are useful assets but are not automatically published templates. Template publication requires explicit native input/output declarations and sharing. Public API run support is Pro+; the Creator account must use supported UI controls. MCP does not currently publish templates.
- Nora's first native suite was 50/52; final changes have 10/10 targeted regressions. Preserve that scope.
- Public visitor voice has an intentionally bounded expiry. Recorded outputs and deterministic text remain available; do not silently renew an unlimited public budget.
- Exact v2.0 CI passed and production is configured. Rerun relevant checks for the new source and inspect deployment against its exact commit.

## State vocabulary

CREATED: artifact exists. TESTED: stated checks ran. READY FOR REVIEW: prepared for the owner, not sent. SUBMITTED: sent to an external recipient/platform. APPROVED: accepted by its authorized reviewer. PUBLISHED: accessible on its named destination. A local script is never native usage, a Flow is not automatically a published template, and a private draft is not Explore approval.
