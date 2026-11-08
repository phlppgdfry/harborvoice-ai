# Limitations and exact boundaries

These limitations are intentionally explicit. A completed implementation, a historical platform result and a fresh live verification are different claims. Consult the release report and capability matrix for the final status of each v2 workstream.

## Baseline provider restrictions

- **Studio API:** the existing account receipt records explicit Studio API allowlisting required. A normal native Audiobooks project and export succeeded through the UI. UI access does not prove API allowlisting. Recheck officially; only ElevenLabs can grant restricted account access.
- **Dubbing creation with the project key:** the recorded denial is `missing_permissions` / `dubbing_write`. A separate official CLI OAuth request successfully created the published Dutch dub. Different authenticated interfaces can have different granted permissions. A CLI success does not silently authorize or repair the project key.
- **Voice Design:** three fictional previews exist at the baseline; a preview is not a saved library voice. Library creation must be verified after saving. Library publication, voice sharing and Professional Voice Cloning have distinct platform rules.
- **Cloning, paid telephony, external publishing and LinkedIn:** require the owner's specific authorization where applicable. LinkedIn connection remains explicitly owner-managed.

## Product and operational scope

The company, customer names and shipment records are synthetic. No real terminal, customs system, customer database, email service, payment service or telephone infrastructure is connected. Operator approval only records a local/browser proposal decision. It does not release cargo or contact a human outside the app.

Nora's business tools run through the connected HarborVoice browser. They are not service-side integrations for standalone telephone calls. Hosted workspaces and transcripts are browser-local; there is no cross-user synchronized CRM or authoritative conversation record. Local deployment adds SQLite, not enterprise identity or durable cloud operations.

The operator credential is shared single-user access, with no per-user role separation, independent reviewer identity, tenant isolation or SSO. Public recordings are unlimited playback; live visitor sessions are separately restricted and can expire. Do not imply that every visitor can generate freely.

## Evidence limitations

- SDK fixture tests prove request serialization and handling, not provider access or audio quality.
- Provider simulations use synthetic business-tool fixtures and short bounded scenarios. They do not measure telephony, production TMS availability, full conversation distribution or human speech quality.
- One historical visitor call used prerecorded synthetic microphone input. It does not establish every browser, microphone, accent or language works.
- Media decoding and checksums prove file integrity and technical properties. They do not independently verify naturalness, factual accuracy, native-speaker fluency or commercial impact.
- Scribe output is automated transcription. A transcript matching intended words is useful evidence, not an independent pronunciation quality grade.
- Account-counter changes can include unrelated activity and delayed charges. Estimates, reservations, provider reports and observed deltas must remain separate.
- No controlled experiment at the baseline establishes a quantitative latency, cost, accuracy or conversion improvement. Do not fabricate before/after gains.

## Synchronization limits

The repository versions code, desired configuration, knowledge and generation specifications. Native Studio/Flows are separate platform objects. Importing finished assets does not reproduce their editable timelines. Unsupported export/apply interfaces require explicit manual reconciliation. Never overwrite remote edits merely because a local file differs.

The baseline bootstrap avoids duplicate resources only while its private manifest remains intact. Knowledge attachment serialization covers one server process, not independent native editors or distributed instances. The v2 registry/reconciler should improve this while documenting remaining manual boundaries.

## Deployment and performance

The baseline Vercel/Pages publication paths are not gated on Verify; v2 must correct this before relying on green builds as a publication guarantee. A lazy voice SDK chunk exceeds the build warning threshold; that warning is not a runtime failure. Long synchronous requests can time out even if provider work continues.

There is no documented production load test, backup restore drill, independent accessibility audit, multi-tenant penetration test or personal-data retention program. Current upload checks trust MIME category within size limits. Hosted webhook intake remains disabled until durable infrastructure is available.

## Recognition

HarborVoice, Academy progress and the internal engineering scorecard award no official credential. A capability statement, LinkedIn Top User, ElevenLabs Power User, Ambassador participation and a formal certification are separate concepts. No verified credit threshold guarantees any recognition. Application drafts and launch materials must not be presented as submitted or accepted.

## Release remediation and remaining boundaries

The v2 release adds locked release-automation reservations, native job reconciliation, a managed-field drift preview, actual knowledge-text comparison and CI-dependent publication. These supersede the baseline weaknesses described above. The local governor is not a distributed multi-user meter; private hosted operator tools remain single-owner. Public generation remains unavailable except the separate bounded visitor voice trial.

The original52-case suite passed50 tests. After two corrections, ten targeted regressions passed; the full suite was not rerun against the final prompt. Language quality has not been independently scored. Native Studio now has a real imported timeline, actual Studio Agent interaction, corrected caption text and downloaded SRT; the primary film composition remains local and its soundtrack is embedded, not separate native tracks.

Provider allowlisting still blocks the Studio API. Creator-tier Pro-only capabilities are not unlocked by CLI/MCP. Lossless bidirectional synchronization of native Studio/Flows is unavailable through the supported interfaces used here. Optional unexecuted capabilities remain explicitly PLANNED in the capability matrix. LinkedIn, external applications/messages, real voice cloning, public Voice Library distribution and paid telephone provisioning were not performed.
