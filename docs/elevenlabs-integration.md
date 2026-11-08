# ElevenLabs integration and verification boundary

The application uses the official pinned `@elevenlabs/elevenlabs-js` server SDK and
`@elevenlabs/react` browser SDK. Secrets stay server-side. The operator selects only the
server-approved agent returned by `GET /api/agents`; there is no public agent CRUD surface.

`POST /api/agent/session` requires operator authorization and rate limiting. Production
checks that the configured agent requires authenticated sessions, then issues a short-lived
signed WebSocket URL. The browser uses `startSession({signedUrl,connectionType:'websocket'})`.
The signed URL is necessarily a client capability; responses are no-store and it must
never appear in logs or committed evidence. The private API key is never returned.

The SDK's actual callbacks drive connected/listening/speaking/disconnected state. The
microphone uses `getUserMedia` on HTTPS/localhost after the user's start action. The UI
states that audio is sent to ElevenLabs. `setMuted` controls input independently from
speaker volume, and `endSession` terminates the call. Cancelling pending initialization
does not claim to dismiss a browser permission prompt or undo provider charges.

Transcripts are client-reported SDK events, persisted on session end through the private
API with timestamps, duration and provider conversation ID when available. They are not
independently attested provider records. A failed save is reported and the in-memory
transcript is retained for retry; do not promise delivery after a tab/browser crash.

`lookup_shipment` reads synthetic records. `request_escalation` creates a human-review
proposal; neither the model nor these tools release cargo or remove a customs hold.
The production profile disables public guest voice and the deterministic chat endpoint.
Demo mode remains explicit and is never a network-error fallback.

## Tests versus genuine provider verification

- Contract tests call the real server SDK with fixture transport; they do not establish
  live provider behavior or spend credits.
- `npm run test:production-browser` uses the actual browser SDK with fixture WebSocket
  messages and a synthetic microphone. It checks session lifecycle and error handling,
  but does not establish real model inference, human microphone access or audio quality.
- `npm run verify:live` reads the real account/agent/knowledge configuration and issues
  a signed URL. It does not start a conversation or generate audio. The latest execution
  is stored privately under `var/`; historical committed evidence is preserved.
- A real production voice smoke test requires a deployed database-backed API, explicit
  audio/credit budget, suitable synthetic test content and actual audio/response evidence.
  No successful real conversation is claimed for this branch until that is executed.

Current read-only verification found Nora, four indexed knowledge sources, two client
tools, authenticated sessions and signed-session issuance. These checks are narrower than
'voice operational in production'. The other eight audio workflows retain their existing
implementation and fixture coverage; permissions/plan/credits can differ by product.

## Production content security policy

The SDK's default blob/data AudioWorklets are blocked by the strict script policy. The
application imports matching processors from the pinned SDK and its pinned resampler
as separate same-origin Vite assets (`?url&no-inline`) and sets `workletPaths` and
`libsampleratePath`. This avoids allowing arbitrary blob/data scripts or loading the
resampler from a CDN. Vendor license notices ship under `public/vendor`. CI repeats the
SDK fixture journey against the actual built Express app with production CSP headers.
