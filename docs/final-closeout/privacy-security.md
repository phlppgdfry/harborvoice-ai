# Privacy, retention and security review

17 November 2026. Technical controls only. No legal or GDPR compliance is claimed.

## Data and where it lives

| Data                                               | Where                                                   | Retention now                                                | Deleted by the app's delete feature?                                          |
| -------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Workspace (shipments, tickets, audit, transcripts) | Neon PostgreSQL, `harborvoice.workspace` (one JSON row) | until deleted                                                | Yes: removes the conversation from the workspace row and writes an audit line |
| Revoked session hashes                             | `harborvoice.revoked_sessions`                          | until the session's own expiry                               | n/a                                                                           |
| Webhook payloads                                   | `harborvoice.webhook_events`                            | until deleted (currently 0 rows)                             | No                                                                            |
| Conversation audio and transcripts at ElevenLabs   | ElevenLabs conversation history for agent `agent_6901…` | **unlimited** (`retention_days: -1`), voice recording **on** | **No.** Local deletion does not delete provider-side recordings               |
| Public static demo                                 | Visitor's browser storage                               | until the browser clears it                                  | Yes (browser-local)                                                           |

Provider settings read on 17 November (`platform_settings.privacy`): `record_voice: true`, `retention_days: -1`, `delete_transcript_and_pii: false`, `zero_retention_mode: false`, `conversation_history_redaction.enabled: false`, user memory off.

## Owner decision — provider retention

Recommended for a demo agent: keep `record_voice` on only if you review recordings; otherwise turn it off. Set `retention_days` to 30 and leave `apply_to_existing_conversations` off, so only new conversations expire. Consider enabling transcript redaction. Not applied here: it creates a new production agent version and schedules data deletion, which needs your decision. Change it in the agent's _Advanced → Privacy_ settings, then re-run the six-test regression (about 1,700 credits).

## Controls verified

- Operator authentication: constant-time code check, HMAC-signed `HttpOnly`, `Secure`, `SameSite=Strict` cookie, 8 h or 30 d lifetime, rate-limited sign-in, logout revocation stored server-side.
- Private routes return 401 anonymously; cross-origin requests are refused; webhooks require a valid, unexpired signature and cannot change shipment status (tests in `tests/api.test.ts`).
- Agent: authentication required for sessions, 2 concurrent / 30 daily / 300 s limits; tools cannot release cargo; escalations stay pending until an operator decides.
- Content Security Policy and security headers in `vercel.json` and the Express app.
- Public pages: synthetic data only, no analytics, cookies or third-party requests on the showcase and Learn pages (fonts are self-hosted).
- GitHub Actions: `contents: read` by default; Pages job adds only `pages: write` and `id-token: write`.
- `npm audit`: see [final-release-evidence.md](final-release-evidence.md). Secret scan of the diff: no key-shaped strings, signed URLs or workspace tokens.

## Limits

No penetration test. Prompt-injection resistance is tested on six to fifty-two scenarios per agent version, not proven. Provider-side deletion, data-processing agreements and a privacy notice for real users do not exist, because there are no real users.
