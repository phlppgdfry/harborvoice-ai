# Demonstration privacy and retention policy

Scope: public synthetic portfolio and proposed pilot, reviewed 9 November 2026. This is an operational policy draft, not a GDPR compliance claim or legal advice.

AgentProof is a static demonstration. It requests local bundled JSON, font and application assets. It does not request a microphone, connect to ElevenLabs, accept an API key or dispatch tests. Feedback stays in the current tab and is downloaded only on request. No feedback collector, cookies or analytics are included. Browser downloads remain on the visitor's device until deleted. Hosting providers may retain normal request logs under their own policies.

HarborVoice's production runtime is separate. Authenticated voice use transmits audio and conversation content to ElevenLabs; recordings/transcripts may be retained there independently of local deletion. Local workspace records and persisted conversation metadata use the deployed runtime's database. Public reports use synthetic records and reviewed summaries. Never put actual customer details, tokens, signed URLs or private transcripts in GitHub issues, benchmark exports or workshop materials.

Before a real-data pilot, the owner must name a support/privacy contact, identify controller/processor roles and lawful basis, review provider terms/DPA and regional processing, set actual recording and transcript retention, choose authorized operators, and test deletion across local and provider stores. No contact address, legal basis or completed DPA is invented here.

Recommended pilot retention for owner adoption: no recording by default; collect only consented task feedback; delete raw research notes within 30 days of collection; keep only de-identified aggregate findings after review. This target is not currently scheduled or enforced. The production branch has a protected retention endpoint; idle cleanup requires an accepted schedule. Public Git history cannot guarantee complete erasure, so raw personal data must never enter it. Establish encrypted backup retention and deletion propagation before accepting personal data.

User notice for a future approved pilot: explain synthetic tasks, optional voice use and provider transfer before the action; provide an alternative no-key path; obtain separate consent for recording/research; allow withdrawal through the named owner contact. Do not recruit participants until that contact and process exist.
