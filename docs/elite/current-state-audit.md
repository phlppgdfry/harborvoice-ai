# HarborVoice v2 baseline audit

Audit date: 7 November 2026. Baseline commit: `116395ecf6a82efafe23eeb3234a043f5fd9d8a0`, package version `1.4.0`. This document records the starting state of the Elite execution. Subsequent remediation and fresh native checks belong in the release report and resource inventory; the findings below are not a claim that every baseline limitation persists after v2.

## Audit method and evidence boundary

Reviewed application and domain code, server/gateway/authentication, agent prompts and scenarios, provisioning and generation scripts, Academy and Experience assets, tests, deployment configuration, Git history and existing reports. No credential file was opened. No media generation, native mutation, visitor call or paid evaluation was performed for this audit.

A fresh `npm run check` passed at the baseline: strict TypeScript, production Vite build and **50 tests**, zero failures. The build reports a 615.53 kB voice-console chunk; it is lazy-loaded. Test transport responses are fixtures and cannot establish current ElevenLabs account health.

Existing native reports are historical observations dated 7 November, not fresh account inventory. Their media files remain present in `public/`. Root execution must refresh native resources and permissions before representing them as currently live.

## Existing implementation

| Area                       | Existing behavior                                                                                                                   | Evidence and validation scope                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Nora                       | Authenticated multilingual agent; English/Dutch/French/German; source-grounded prompt; language detection and end-call system tools | `agent/settings.ts`; historical `docs/live-verification.json`                                       |
| Synthetic business adapter | Four shipment records, exact-reference lookup, explicit unknown-reference response                                                  | `src/domain.ts`; fresh domain/API tests                                                             |
| Human review               | Deduplicated pending escalation, approve/reject; approval never changes cargo/customs state                                         | Domain/API tests; browser evidence                                                                  |
| Client tools               | `lookup_shipment`, `request_escalation` execute in the HarborVoice browser                                                          | `src/VoiceAgent.tsx`; not standalone telephone/server integrations                                  |
| Knowledge                  | Four versioned playbooks, attached documents and asynchronous RAG indexing                                                          | Historical four-of-four index verification; local attachment contract test                          |
| Agent evaluation           | Six four-turn provider simulations with synthetic tool fixtures; three post-conversation criteria                                   | Historical `docs/agent-evaluation.json`, six passed, 1,714 provider-reported credits                |
| Public visitor agent       | Separate authenticated read-only agent; global two calls/day; concurrency one; 60 seconds maximum                                   | Historical actual ASR → lookup → speech observation; fixtures verify limit checks                   |
| Voice/audio API            | Eight forms: TTS, STT, sound effects, isolation, dubbing, music, voice changing, alignment                                          | Real SDK serialization tests plus historical actual media reports                                   |
| Experience lab             | Published recorded outputs; comparisons/transcripts; playback does not request new generation                                       | Existing public media; historical browser verification                                              |
| Academy                    | Twelve recorded v4 lessons in four languages, transcripts, local quizzes/progress/export, MP3/M4B/EPUB                              | Historical Academy browser report; actual media present                                             |
| Creative resources         | Two editable Flows; voice/music/effects; covers/video/brand kit; imported outputs                                                   | Historical creative reports; canonical native URLs below                                            |
| Native audiobook           | Three-chapter English EPUB import, Sarah/v4, pronunciation aliases, completed MP3 export                                            | `docs/academy-native-evidence.json`; 185.66-second file; actual editor usage rather than Studio API |
| Voice Design               | Three fictional previews downloaded; not saved to library at audit start                                                            | `docs/academy-creative-evidence.json`; requires current save verification                           |
| Pronunciation              | Three-rule native dictionary; original/expanded samples and Scribe transcripts                                                      | `docs/academy-pronunciation-evidence.json`; quality not independently scored                        |
| Developer workflow         | SDK, official CLI OAuth and MCP used; reproducible partial provisioning                                                             | Existing scripts/reports; fresh CLI/account health still required                                   |

## Historical native references

- [Public Experience flow](https://elevenlabs.io/app/flows/Xf1iuvlDWlQzdy9RhgdZ).
- [Academy flow](https://elevenlabs.io/app/flows/DOwVWkHNl1M8XZpmGo1C).
- Native agents: `HarborVoice · Nora` and `HarborVoice · Nora Visitor Trial`; use the refreshed private manifest/resource registry for identifiers.
- Native audiobook: `HarborVoice Academy: Reliable Voice AI`; user-owned workspace membership is required to edit native projects. Public playback uses published copies.

No Git repository can be treated as one complete ElevenLabs project. Native Flows, agents, voices and Studio projects have separate lifecycles.

## Deployment split

| Capability                        | Local API                        | Public Vercel                      | GitHub Pages                    |
| --------------------------------- | -------------------------------- | ---------------------------------- | ------------------------------- |
| Frontend and recorded media       | Yes                              | Yes                                | Yes                             |
| Demo workspace                    | SQLite                           | Browser-local                      | Browser-local                   |
| Paid provider API                 | Environment credentials          | Operator-protected server function | Unsupported; links to Vercel    |
| Live operator voice               | Yes, configured account required | Operator cookie required           | Unsupported                     |
| Visitor voice                     | Explicit configured trial        | Explicit configured trial          | Links to live site              |
| Escalation review/history         | SQLite                           | Browser-local synthetic records    | Browser-local synthetic records |
| Signed webhook retention          | SQLite                           | Disabled with 409                  | No backend                      |
| Durable multi-user identity/roles | No                               | No                                 | No                              |

The `/api/status` endpoint reports configuration availability, not successful authorization for each provider product. `configured: true` is not evidence of Studio or dubbing permissions.

## Prioritized gaps

| Priority | Finding                                                                                        | Consequence                                                                                             | Required improvement                                                                                                             |
| -------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Academy budget uses independent file read/modify/write and account counter deltas              | Concurrent processes can race; pending work/delayed billing not fully reconciled                        | Locked persistent Credit Governor, reservations before work, provider IDs, conservative uncertain-charge handling and hard stops |
| P0       | Paid HTTP operations have per-instance rate limits but no durable account-wide budget          | Operator activity can exceed project-generation ledger; distributed instances do not share counters     | Explicit scope, production paid-route budget policy/provider caps; never imply local ledger meters unrelated UI/CLI traffic      |
| P1       | Vercel main-push deployment and Pages workflow do not depend on Verify                         | Publication can occur before tests complete or despite browser-test failure                             | Gate deployment; reject production publication when validation fails                                                             |
| P1       | `agent:sync` overwrites selected live settings without drift preview                           | Manual prompt/settings edits can be lost                                                                | Snapshot, managed field policy, dry-run, hashes and conflict detection before approved apply                                     |
| P1       | Bootstrap uses names/private manifest to skip resources; no content reconciliation             | Local knowledge edits do not update remote documents; lost manifest can create duplicates               | Stable registry and content hashes; explicit native lookup/recovery; no blind recreation                                         |
| P1       | Only six versioned agent scenarios                                                             | Narrow language/adversarial coverage                                                                    | At least 50 meaningful versioned cases; selectively execute within reservations and report actual results                        |
| P1       | Native Studio API denied account allowlisting; project key denied `dubbing_write`              | Native UI success does not unlock API creation                                                          | Recheck official permissions; document provider/account restriction and supported UI path; do not bypass                         |
| P2       | Shared operator secret; eight-hour/30-day signed cookie                                        | Single trusted operator, no separation of caller/reviewer/admin                                         | Preserve as a bounded portfolio deployment; enterprise identity is a separate project boundary                                   |
| P2       | Client-reported transcripts; webhook events not reconciled                                     | Analytics are not authoritative provider truth                                                          | Read-only provider analytics/evidence reconciliation with explicit provenance                                                    |
| P2       | Visitor trial has fixed cutoff on 8 November 2026 19:06:58 UTC                                 | Live trial naturally ends; recordings remain functional                                                 | Display expiry honestly; any extension requires reviewed allowance and provider limits                                           |
| P2       | Media MIME/category checks, memory uploads and synchronous requests                            | Content validation incomplete; long requests may time out; browser cancellation does not cancel billing | File integrity validation, asynchronous operation IDs/status, bounded jobs and honest cancellation messaging                     |
| P2       | CSP disabled; legacy session-storage token compatibility remains                               | Less browser hardening; unused auth compatibility expands code surface                                  | Test a restrictive CSP compatible with media/WebSockets; retire legacy token handling if unnecessary                             |
| P2       | No automated retention/deletion, durable hosted queues, backups or load evidence               | Not ready for personal-data/customer production                                                         | Keep fictional data; document boundaries rather than implying enterprise operational readiness                                   |
| P3       | `docs/architecture.md` contains an older statement that most audio tools still need live runs  | Contradicts newer genuine output reports                                                                | Refresh documentation around latest evidence and keep test types distinct                                                        |
| P3       | TypeScript strict but generic `request<T = any>` and a few fixture `any` values                | Weaker API result contracts                                                                             | Replace implicit response shapes with shared schemas/types where valuable                                                        |
| P3       | No release tag at baseline; nested `docs/elite` excluded from existing `docs/*.md` format glob | Release/review and doc checks incomplete                                                                | Versioned release and recursive documentation validation                                                                         |

## Quality conclusions

The baseline is a working, well-bounded portfolio application with broad real media evidence and unusually explicit demo/live distinctions. It is not a multi-tenant terminal system. Preserve its synthetic adapter and human-review boundaries while adding resource lifecycle management, broader measured evaluations and coherent finished productions.

Baseline credit evidence is separate from the new authorization: the prior Academy report records a 9,967 account-counter delta and 19,810 conservative reservations under a 20,000 ceiling. This is not the starting balance for the 50,000-credit Elite run; a fresh balance is mandatory.
