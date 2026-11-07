# Live hosting

Live URL: https://harborvoice-ai.vercel.app

The Vite frontend uses a same-origin Vercel function at `api/index.ts`. `vercel.json` rewrites `/api/*` to the gateway. The status endpoint exposes configuration booleans, never credentials. GitHub Pages builds with `VITE_STATIC_DEMO=true` and explicitly links to the live workspace.

## Production environment

Set `ELEVENLABS_API_KEY`, `ELEVENLABS_AGENT_ID` and a random `OPERATOR_TOKEN` as sensitive production environment variables using the official Vercel CLI. Supply secret values through stdin, never command arguments or source files. Deploy again after changing environment values. `.vercelignore` excludes all environment files and private `var/` records.

Open Settings and enter the operator access code. A successful login sets an HttpOnly, Secure, SameSite=Strict session cookie for eight hours, or 30 days with Keep me signed in selected. The access code is not persisted in localStorage or bundled into the app. API clients may also use a bearer operator token. Rotate `OPERATOR_TOKEN` to revoke all sessions. This is a private single-operator workbench, without enterprise SSO or independent reviewer roles.

## Storage and limits

Hosted shipment workspaces, escalation reviews and client-reported transcripts stay in each browser. Clearing browser data removes them. Hosted webhook intake and SQLite workspace routes return 409. Run the local server for persistent SQLite and signed webhook intake; the hosted API is not a durable webhook receiver.

Uploads are limited to 4 MiB on Vercel, beneath the platform request-body ceiling; local uploads allow 20 MiB. Long generation requests can time out; native asynchronous dubbing supports polling. API requests are not cached. Rate limits are per running instance; set account-level credit caps in ElevenLabs for a shared deployment.

The Vercel project is connected to this GitHub repository: main-branch pushes publish production. Production secrets are not exposed to branch previews. You can also deploy with `vercel --prod`. Then check `/api/status`, authenticate through `/api/auth/session`, and use `/api/connection/check`. A successful voice-library check proves API access; it does not prove microphone permission, account access to every model or generated-audio quality.

## Reproduce the hosted browser check

Run `npm run verify:hosted` with the private `var/hosted-operator.json` created during deployment, or provide `HARBORVOICE_ACCESS_CODE` through your environment. No credentials appear in the report or screenshots. The check signs in, reads provider access, issues an unopened signed-session URL and signs out. Add `-- --audio` only to explicitly request one short billable TTS generation; the default creates no audio. Results are saved in `docs/hosted-verification.json`.

## Visitor trial

Set ELEVENLABS_GUEST_AGENT_ID and GUEST_VOICE_EXPIRES_AT for the separate visitor agent provisioned by npm run guest:provision. Rerunning the script preserves its original expiry. Provider settings cap calls at two per day, concurrency one and duration 60 seconds; session issuance fails closed if these limits are missing or enlarged. The public trial accepts only a signed-session request and synthetic shipment lookup. Account management and paid audio-generation routes remain operator-only.

The initial trial ends on 8 November 2026 at 19:06:58 UTC. Signed URLs issued before cutoff remain valid for 15 minutes. Extending the trial requires explicitly reviewing its spend allowance and changing the expiry; it does not extend itself. Source-based IP throttling is not the authoritative spending control. The provider limits are shared by every visitor.

A live browser test used one visitor slot with a synthetic microphone question; see docs/visitor-voice-verification.json. Public playback has no slot limit and spends no generation credits.
