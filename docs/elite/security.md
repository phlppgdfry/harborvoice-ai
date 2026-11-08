# Security model

This project uses fictional customers, shipments and operating rules. It must remain unsuitable for claiming real customs authority, real terminal access or official certification. Security controls protect the portfolio account and its bounded demonstrations; they do not constitute an enterprise assurance assessment.

## Credentials and authentication

- Load ElevenLabs credentials only on the server or explicit developer scripts. Official onboarding owns ignored `.env.local`; inherited process environment values remain authoritative. Do not print or open credentials for diagnostics.
- Never place keys in `VITE_` variables, client code, public artifacts, CLI arguments, signed-link documentation or Git history.
- Git, Docker and Vercel ignore private environment files and `var/`. Ignore rules must be supplemented with publication checks, not treated as proof that a staged file is safe.
- Hosted startup requires `OPERATOR_TOKEN`. Local network binding without a token fails closed. Loopback-only unauthenticated development is intentional.
- A correct operator code creates an HMAC-signed HttpOnly cookie; hosted cookies are Secure and SameSite=Strict. Sessions last eight hours, or 30 days when explicitly remembered. Logout clears the current cookie; secret rotation revokes all signed cookies.
- This is one trusted operator credential. There are no user identities, tenant isolation, independent approval roles, MFA or enterprise SSO. Do not put customer data behind it and call that enterprise access control.
- The existing client retains compatibility for a legacy `sessionStorage` bearer token; the normal UI removes it after cookie sign-in/sign-out. Prefer the HttpOnly path and remove compatibility if it is no longer needed.

## API boundary

Origin/host checks reject mismatched browser origins; credential comparison uses constant-time equality for equal-length buffers. Inputs have Zod schemas, text and payload ceilings, and explicit enums. Ordinary requests and paid requests have separate process-level throttles. These limits do not implement distributed account-level spending caps.

Uploads are memory-resident, limited to 4 MiB hosted or 20 MiB locally, and restricted by reported MIME category. A MIME label is not a full file-content security or duration inspection. Long or malformed media still needs explicit validation and bounded processing.

Provider errors expose actionable safe messages; the key is redacted from generic errors. Review newly added logging/error paths for tokens, raw request headers, signed URLs and private payloads. Application-wide CSP is disabled at the baseline; a tested policy for the SDK's media/WebSocket origins is a hardening opportunity.

## Agent and business boundaries

The prompt treats caller text, retrieved documents and tool responses as untrusted data. It forbids cargo release, customs clearance, guaranteed arrival, booking changes, compensation promises and personal driver data. Exact-reference lookup and human-review proposals reinforce those limits in code.

Prompt instructions are not authorization. Browser client tools are controlled by the browser and are used only with synthetic data. A real integration requires service-side authentication and authorization, independent caller identity and validated consequential actions. Public visitor access must never execute operator review or paid creative routes.

The visitor agent uses authenticated signed-session URLs, provider daily/concurrency/duration limits and a fixed expiry. The gateway checks those limits before issuing a URL. An issued URL can remain usable for its provider validity window. Per-IP request throttling is supplementary and does not prove one real person per slot.

## Spend safety

Use locked persistent reservations, operation identifiers, explicit statuses and conservative uncertain-charge treatment before any expensive request. A timeout or browser cancellation is not proof that work stopped or was free. Inspect asynchronous provider status before any repeat. The SDK already disables automatic retries (`maxRetries: 0`).

The local governor cannot block independent native UI or other application activity. Reconcile account-wide balance observations, preserve a delayed-billing buffer and stop new work on inconsistent counters, stale balances, unresolved pending work or insufficient remaining allowance. Never put billable generation in ordinary push/scheduled CI.

## Webhooks and retention

Local intake verifies HMAC over the raw body, accepts only a five-minute timestamp window, rejects malformed JSON and deduplicates by payload hash. This route stores separate events and does not update shipment state. Tests prove fixture behavior; native delivery/reconciliation requires its own evidence.

Hosted webhook retention is disabled with an explicit error because a serverless ephemeral store is not durable persistence. The local SQLite database and browser transcripts have no automatic retention/deletion workflow. Continue using synthetic data until deletion, audit, consent, backups and access boundaries are deliberately implemented.

## Release checks

Before publication: run code/contract/security tests; inspect changed staged files; check for actual loaded secrets without printing them; reject expiring signed links; validate public media provenance; gate deployments on passing checks. After publication: confirm unauthenticated paid-route rejection, safe status output, required native resource settings, public media playback and absence of client-bundled credentials.

Do not broaden service permissions, connect LinkedIn, clone a real voice, upgrade plans, send applications or publish private information without the specific owner approval required by the project brief. Do not bypass provider allowlisting, verification or plan restrictions.

## Changes in v2

Release automation now uses an exclusive filesystem lock, atomic ledger replacement, single-attempt operation IDs, a retained failed-job allowance and a5,000-credit delayed-billing buffer. Tests exercise competing reservations and counter drift. This is deliberately local automation, not a pretend distributed serverless ledger. A separate production build gate checks the exact GitHub Verify result before Vercel builds, and Pages follows successful Verify. Missing CI state fails closed.

Public media is pre-generated. No broader API scopes, LinkedIn authorization, new cloud credentials or telephony permissions were granted. The read-only scheduled drift workflow is opt-in and skips when a dedicated secret is absent; the developer key is not automatically copied to GitHub.
