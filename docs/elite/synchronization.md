# Resource synchronization

Git versions source, prompts, managed agent settings, scenarios, tools, knowledge text, generation specifications and delivery code. ElevenLabs owns its running agents, generated media, voices, Studio timeline and editable Flows. A Git repository is not a complete native ElevenLabs project and cannot be uploaded as one.

The [resource registry](../../config/resources.json) links stable native identifiers to local paths, environment, version, content hash, last verification, direction and status. [Asset hashes](../../config/assets.json) verify download-safe project media. Raw native responses, signed media URLs, CLI snapshots and credentials stay private.

```bash
npm run resources:inventory
npm run sync:dry-run
npm run sync:drift
npm run sync:apply -- '<exact-reviewed-remote-hash>'
npm run assets:verify
npm run verify:live
```

Dry-run and drift only read the provider. Managed-field projection preserves unrelated remote fields. Three-way hashes distinguish IN SYNC, LOCAL CHANGES, REMOTE CHANGES and CONFLICT. Applying requires the exact freshly reviewed remote hash; remote changes or missing baseline refuse mutation. Initial baseline acceptance is explicit and requires local and remote managed content to be identical. Tests cover stale previews, conflicts, canonical ordering and projection behavior.

Knowledge comparison fetches the **actual remote document text**, not just names or document counts. All four original source documents matched at verification. Changed knowledge is reported for explicit review rather than blindly creating another copy. Indexing and attachment remain necessary after a deliberate replacement; the existing attachment code serializes updates and polls indexing through its live verifier.

Native Flow and Studio edits require MANUAL ACTION REQUIRED reconciliation. Their resources are inventoried, linked and verified, but no supported Creator-tier serializer provides a lossless bidirectional project merge. The reconciler does not overwrite those edits. The native Enterprise branch was reviewed through a no-conflict merge preview before merging into the existing agent; its source branch was preserved.

Read-only scheduled drift checking is opt-in: the workflow skips live checks when the dedicated repository secret is absent. Never copy a developer's general API key into GitHub just to make a workflow green. No workflow generates paid media on a push or schedule.

## Versioned knowledge updates

`npm run knowledge:sync` compares actual remote text with the source and committed baseline. `npm run knowledge:sync -- apply <reviewed-plan-hash>` updates only changed, non-conflicting text documents in place, preserving IDs/attachments, reserving indexing allowance and verifying content/index status. It refuses remote edits and duplicate retries. The current release exercised the unchanged dry-run path; changed-content mutation is implemented but not claimed as live-exercised. If indexing remains pending, inspect its recorded document ID/status before attempting another billable request.

The old `agent:sync` npm command now previews the v2 reconciler. Direct legacy v1 publication is guarded to prevent silently downgrading Nora. Read-only inventory can reconstruct resource references from the committed registry on a new clone; the first approved write still requires an explicit matching baseline and the correct owner account.
