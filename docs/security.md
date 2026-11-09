# Security model and operational boundaries

This is a private, single-operator application with one workspace. It is not multi-tenant
SaaS and does not claim enterprise SSO, per-employee roles or customer account isolation.
Every privileged workspace/provider route requires operator authorization in production.
Only health/configuration metadata is public; readiness and agent metadata are protected.

Production requires a 32+ character random operator credential and HTTPS public origin.
Sign-in is rate limited and same-origin checked. The credential stays server-side;
cookies are signed with random nonces, HttpOnly, Secure and SameSite=Strict. Sessions
expire, logout revokes their hashes in durable storage, and rotating the operator key
invalidates signatures. Remember-me is opt-in. Bearer access remains an administrator
API mechanism; keep the shared credential in the secret manager and rotate on exposure.

PostgreSQL uses certificate-verified TLS, a bounded pool and statement/connection
timeouts. Workspace mutation locks the singleton row within one database transaction;
failure rolls back rather than committing a partial state. PUBLIC privileges on the
private schema/tables are revoked. Use a dedicated database/role; credentials are not
stored in workspace fields or frontend bundles. This does not prove cross-tenant RLS,
because tenant accounts do not exist in the selected application scope.

Input schemas bound JSON and transcript counts, MIME/size checks bound audio uploads,
and no uploaded file is executed or written by its supplied filename. This is not malware
scanning. Signed raw-body webhooks are timestamp-checked/deduplicated and do not approve
shipments. Global/per-paid-route limits and zero automatic SDK retries reduce abuse and
duplicate charges; in-memory limits are per function instance, not a distributed spend cap.
Use provider-level spending/concurrency limits before wider access.

CSP/Helmet protect production pages. Logs contain request IDs, method, matched route,
status and timing; no request bodies, cookies, signed URLs, API keys, raw audio or transcripts.
Unexpected production errors are redacted. CORS is not opened to arbitrary origins.
Origin matching and cookie policy protect browser mutations; a model cannot grant itself
authorization, choose another account's agent or invoke a cargo-release tool.

Local history is client-reported and may contain personal data if users provide it.
The UI discloses external audio processing; avoid sensitive content until retention,
provider terms/DPA, lawful basis and access/recovery procedures are reviewed by the owner.
Export/delete actions apply to local records. Browser import is explicit, merges only
validated conversation records, preserves source and does not import approval/shipments.
Provider recording/transcript deletion remains separate; never imply the local button
erases all copies. See [deployment](deployment.md) for retention and backups.

Verified: separate free preview/production databases, TLS migrations, public HTTPS,
protected readiness, logout and one capped real voice call. Physical microphone quality,
provider retention/DPA decisions, scheduled retention, operational backup ownership and
all account-restricted audio products have not been fully accepted. No secrets or private
voice recordings belong in Git. Never weaken TLS, disable auth or enable demo mode to
make readiness green.
