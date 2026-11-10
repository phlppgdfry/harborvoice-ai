# HarborVoice AI

**v2.2.0 — stable public demo and developer tools.** The protected PostgreSQL runtime is source-integrated; operational production acceptance remains separate. A fictional logistics voice workbench plus recorded creative workflows, reusable AgentOps tooling, a static AgentProof failure explorer and developer education. [Current Dutch consolidation report](docs/release-finalization/FINAL-CONSOLIDATION-REPORT-NL.md) · [Complete inventory](docs/final-excellence/complete-inventory.md) · [Capability evidence](docs/final-excellence/capability-matrix.md) · [Actual publication status](docs/final-excellence/publication-verification.md).

| Explore                                                                 | What it demonstrates                                                             | Validation boundary                                                                  |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [Public static workbench](https://phlppgdfry.github.io/harborvoice-ai/) | Synthetic logistics operations, recorded films/music, Academy and Mastery Lab    | No real terminal/customer system                                                     |
| [AgentProof](https://phlppgdfry.github.io/harborvoice-ai/agentproof/)   | Filters, failure analysis, comparison and downloadable evidence                  | 110 scripted scenarios plus 12 EN/NL/FR adversarial contracts; no model success rate |
| [AgentOps Kit](packages/agentops-kit)                                   | Redaction, drift, bounded evaluation, native receipt import and cost uncertainty | v0.2.0 candidate; not npm-published; no account-wide dispatch lock                   |
| [Protected voice application](https://harborvoice-ai.vercel.app)        | Existing deployed PostgreSQL/ElevenLabs runtime                                  | Separate draft PR #1; operational acceptance remains incomplete                      |
| [Education and community](community/elevenlabs-belgium)                 | No-key exercises, technical manuscript and proposed workshop                     | No event participants, external publication or official recognition claimed          |

Build with Node 24: `npm ci`, `npm run check`, `npm run phase3:verify`. The production build includes the static `/agentproof/` bundle. `npm run test:contracts` is offline. Provider credentials are server-only; paid operations require separate authorization. Phase 4 began at zero budget; the owner later authorized 10,000 credits for bounded native QA. See the final credit receipt for actual observed usage. The private learning visual/output contract is repaired and tested; The duplicate Studio caption overlay is corrected and the native export is verified. External submissions and registry publication retain explicit approval gates. The Vercel deployment freeze is preserved; merging these source changes does not authorize replacing the persistent runtime.

**Voice intelligence with evidence and human control.** A working logistics voice-AI portfolio, creative production studio and practical learning environment.

[Private live application](https://harborvoice-ai.vercel.app) · [Credential-free synthetic preview](https://phlppgdfry.github.io/harborvoice-ai/) · [Watch the product film](public/elite/commercial-en.mp4) · [Mastery Lab](https://harborvoice-ai.vercel.app/#mastery-lab) · [Capability matrix](docs/elite/capability-matrix.md) · [Release evidence](docs/elite/release-report.md)

[![HarborVoice product film](public/elite/film-poster.jpg)](public/elite/commercial-en.mp4)

**v2.1 Recognition & Community Sprint:** [Community Studio](https://harborvoice-ai.vercel.app/#community-studio) adds a multilingual rehearsal, three original review tracks, a complete technical book of more than 6,000 words and an EPUB and two isolated native agent experiments (**6/6** synthetic cases). Two Explore templates and the ElevenReader book were submitted in later phases. Official Showcase PR #113 and SDK PR #484 are open and unmerged (fresh GitHub check). Latest Explore/Reader approval states could not be reverified in this consolidation; no acceptance is claimed. Music Marketplace listing and program membership remain unverified. [Review the exact states and gaps](docs/recognition/final-report.md).

Nora looks up synthetic shipments, explains source-grounded procedures and prepares human-review requests. The surrounding platform makes the engineering inspectable: versioned tests, native ElevenLabs resources, a Credit Governor, drift previews and reproducible production media.

| Experience          | What is real                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enterprise voice    | Existing ElevenAgents deployment, four indexed knowledge documents, two controlled client tools and four languages                                      |
| Creative production | Three cinematic native shots, original Music v2.5 score, English/Dutch/French films, portrait cut and a 78-second explainer                             |
| Native workflows    | Four editable factories, a genuine French dub, native narration and native Scribe transcript                                                            |
| Studio and voices   | Native Studio timeline, Studio Agent, corrected caption export and three saved fictional Voice Design voices                                            |
| Learning            | Twelve audio lessons in four languages, native audiobook and fifteen interactive advanced modules                                                       |
| Engineering         | 52 executed provider scenarios: 50 initial passes, followed by 10/10 targeted corrective passes; locked budget ledger and managed-resource drift checks |

> Independent project by Philippe Godfroy, built with AI-assisted development. The terminal, customers and business records are fictional. Recorded app interactions use deterministic demo responses; real provider outputs are labeled separately. The final prompt did not receive another complete 52-case run. No official certification, partnership, Ambassador membership or Top User designation is claimed.

[Architecture](docs/elite/architecture.md) · [Setup and CLI](docs/elite/cli.md) · [Synchronization](docs/elite/synchronization.md) · [Security](SECURITY.md) · [Media provenance](docs/elite/creative-production.md)

## Live workspace

The [public static Experience lab](https://phlppgdfry.github.io/harborvoice-ai/#experience-lab) offers existing recordings, comparison takes and transcripts. The earlier bounded visitor trial has expired; the native Visitor agent still exists. The [protected hosted workbench](https://harborvoice-ai.vercel.app) uses server-side ElevenLabs configuration. Authorized operators can open **Settings** and use the existing operator sign-in. Never paste the ElevenLabs API key into the browser. New paid testing requires reconciled account liabilities and bounded reservations.

The PostgreSQL runtime and required operator authentication are consolidated through PR #1. Source integration does not promote production. The active protected alias remains at SHA `234281a806150a79b12220d182df3fc9e97534b9`; see the [fresh deployment receipt](docs/release-finalization/production-deployment.json). Automatic Vercel Git deployments remain disabled (`git.deploymentEnabled=false`). Main's static Pages preview uses browser storage; its local demo server uses SQLite. These environments must not be substituted for one another. See the [current architecture and acceptance audit](docs/final-excellence/technical-audit.md), [deployment receipt](docs/final-excellence/production-deployment.json) and [agent evidence](docs/final-excellence/agent-evaluation.md).

## Run locally

Requires Node.js **24 LTS** and npm.

```bash
git clone https://github.com/phlppgdfry/harborvoice-ai.git
cd harborvoice-ai
npm ci
npm run dev
```

Open **http://127.0.0.1:5173**. No credentials are needed for the demo. The API listens on port 3100. SQLite data lives in `var/harborvoice.sqlite`, excluded from Git. The GitHub Pages demo has no server: it uses browser storage instead, with the same domain logic. Browser data stays in that browser; it is not synchronised to GitHub or ElevenLabs.

## A two-minute walkthrough

1. Select a shipment on the terminal map. Filter the shipment desk by customer, reference or vessel.
2. Open **Voice agents** and ask `Where is HV-2048?`. The scripted adapter returns the recorded customs hold, location and ETA, with a source reference.
3. Select **Nederlands** and ask `Waar is HV-2049?`.
4. Ask `Escalate HV-2048 to an operator`. Open **Workflows** and approve or reject the proposal. Approval records the operator decision; it does not release cargo, remove a customs hold or send a message to anyone.
5. Run **Evaluations** and download the results. Open **Conversations** to inspect and export the actual saved transcript.
6. Configure ElevenLabs to use live voice, knowledge uploads, agent simulations and the audio studio.

## What's inside

- **Voice agent** — authenticated signed-URL sessions, microphone conversations, live transcript, four selectable languages, volume control and application tools.
- **Shipment integration** — exact-reference lookup against a synthetic TMS adapter; unknown-reference abstention; source-grounded demo answers.
- **Knowledge** — four versioned operating playbooks; text document creation and attachment to the configured live agent.
- **Human-reviewed workflows** — idempotent pending escalations, approve/reject decisions and a persisted activity trail. No external business-system writes.
- **Audio studio** — text to speech, speech to text with diarization, sound effects, voice isolation, dubbing jobs with completed automatic-dub download, instrumental music, voice changing and forced alignment. Audio outputs can be played/downloaded; JSON outputs are inspectable. Dubbing exposes job submission, status and the original automatic audio dub. Edited Studio renders are outside this version.
- **Evaluation** — six executable demo checks; a live ElevenLabs simulation test with invocation polling and evidence export. Demo checks and live results are explicitly separate.
- **Conversation analytics** — actual saved session/message counts, separated demo/live sessions and downloadable transcripts. Browser-reported live transcripts are not independently verified provider records.
- **Webhook intake** — HMAC verification over the raw body, five-minute timestamp tolerance, deduplication and separate event storage. Webhook events do not drive shipment changes or automatically populate conversation analytics.
- **Delivery** — responsive React interface, typed Node API, SQLite, Docker, CI, static demo publishing, tests and screenshots.

This is a broad ElevenLabs integration showcase, **not every endpoint or enterprise feature in ElevenLabs**. See the [coverage matrix](docs/feature-coverage.md) for explicit boundaries.

## Public experience and native ElevenLabs resources

Open **Experience lab** to play the actual v4 narration, Music v2.5 takes, Sound Effects v2/v3, changed voice, noisy/isolated comparison and Dutch dub. Playback spends no additional ElevenLabs credits. The user-owned [ElevenCreative flow](https://elevenlabs.io/app/flows/Xf1iuvlDWlQzdy9RhgdZ) stores native generations and imported completed API/CLI outputs. Editing requires membership in that workspace. Nora and Nora Visitor Trial live in ElevenAgents; source code, reproducible scripts and sanitized evidence live in this repository. These are separate resources, not a claim to implement every ElevenLabs product.

The visitor trial uses a separate read-only agent, authenticated signed URLs, two calls per day shared by all visitors, one concurrent call and a provider-enforced 60-second maximum. Issuing new visitor sessions stops at the fixed expiry configured in GUEST_VOICE_EXPIRES_AT (initially 8 November 2026 19:06:58 UTC). Already issued URLs can start a call for 15 more minutes. Browser/IP throttling is only supplementary; the provider enforces the agent call and duration limits. Visitors cannot access the private audio generation, knowledge or review routes. The original budget reserved 6,000 credits for this bounded trial; the reserve is an estimate, not a distributed credit meter.

## Live ElevenLabs setup

1. Create an ElevenLabs API key with the permissions needed for the features you intend to use. Enter it only into your local server environment; never into GitHub source or a `VITE_` variable.
2. Use the official project onboarding (it stores a private key in ignored `.env.local`):

   ```bash
   npx -y @elevenlabs/cli@latest onboard init
   ```

   Follow its printed steps. The server and provisioning script load `.env.local` first, then `.env`. Keep credentials server-side.

   To configure environment values manually:

   ```bash
   cp .env.example .env
   ```

   Set `ELEVENLABS_API_KEY` in your local environment file if you are configuring manually. Both `.env` and `.env.local` are ignored by Git.

3. Provision the agent:

   ```bash
   npm run agent:provision
   ```

   This creates four knowledge documents, two client tools and one authenticated Nora agent, and requests a RAG index for each document using the agent’s configured embedding model in your ElevenLabs account. Indexing runs asynchronously; `npm run verify:live` only succeeds once the configured sources are indexed. The ignored `var/agent-manifest.json` records completed steps so a retry can resume without recreating completed resources. It is a bootstrap script, not a reconciler: changes to local playbooks do not update existing account resources automatically. Keep the manifest to avoid duplicate resources. Account permissions, supported models and plan availability can affect provisioning.

4. Set the printed `ELEVENLABS_AGENT_ID` in `.env`, restart the server and reload the application.
5. Open **Voice agents → Start live voice**. Grant microphone access. The language selector is passed as a permitted language override. Test each intended language before relying on it.

Audio requests, live calls and simulations may consume account credits. An authenticated `verify:live` check reads voices/agent configuration and issues a signed session URL; it does not start a conversation or generate audio. Creating resources also depends on your account permissions and limits. No live requests are made just by opening the unconfigured demo. Voice lists are read when a configured audio studio is opened. The live simulation creates a new test resource per run; remove unwanted test resources in ElevenLabs.

After provisioning, `npm run agent:sync` idempotently attaches the multilingual settings, three evaluation criteria and six versioned simulation tests. `npm run agent:evaluate -- --run` starts one paid suite (six cases, four turns each, repeat count one). `npm run agent:evaluate` only refreshes the recorded invocation and exports sanitized evidence. Test resource IDs and full synthetic transcripts stay in ignored `var/`.

The agent's `lookup_shipment` and `request_escalation` tools execute through the connected HarborVoice browser. They are suitable for this browser demo, not standalone telephone calls. A telephony deployment needs authenticated server tools, caller authorisation and separate production infrastructure.

### Operator access

The default server binds to loopback. To bind to a network interface, set `HOST=0.0.0.0` and a strong `OPERATOR_TOKEN`. The server refuses non-loopback binding without a token. Enter that token in **Settings**. The server exchanges it for an HttpOnly session cookie lasting eight hours, or 30 days with Keep me signed in selected; the hosted cookie also requires HTTPS. Sign out to clear and durably revoke the current browser session. Rotating the server token invalidates all existing sessions.

This shared operator token is for a single-user workbench, not enterprise SSO or role separation. Do not deploy it as a public customer service without an authentication layer, TLS, per-user permissions, caller verification, retention controls and spend limits. Operator access includes all workspace data and paid features.

### Webhooks

Expose `POST /api/webhooks/elevenlabs` over HTTPS using your deployment infrastructure, set `ELEVENLABS_WEBHOOK_SECRET`, and configure the matching ElevenLabs webhook. Signature verification is covered by local tests. Real ElevenLabs webhook delivery has not been verified. Raw payloads are retained in the configured SQLite or PostgreSQL store. PostgreSQL prunes records older than 30 days on workspace mutation; scheduled retention and provider-side deletion still require owner decisions.

## Verification

```bash
npm run check                 # TypeScript + workbench/AgentProof builds + root tests
npm run verify:live           # Explicit read-only verification against your configured account
npm run verify:hosted         # Production browser/login check; requires a private operator code
npm run agent:evaluate        # Refresh existing real agent test results, no new suite
npm run dev                   # In another terminal
npm run test:browser          # Installed Google Chrome, or BROWSER_CHANNEL=chromium
```

The demo browser check masks configuration availability so running it never automatically exercises your local live account.

The API tests use temporary in-memory SQLite and an ephemeral local HTTP server. Contract tests run the real official SDK with a custom HTTP transport returning provider fixtures: they inspect the serialized requests for all eight audio tools, signed sessions, dubbing downloads, connection checks, concurrent knowledge attachments and test invocations. They never call ElevenLabs and never spend credits. The browser script performs a real demo conversation, Dutch reply, escalation approval, evidence export, history inspection, all-page navigation and a 390px mobile overflow check. It also checks contextual studio defaults, keyboard tabs, deep links, visible mobile navigation labels and all eight audio forms against explicitly mocked provider responses. It writes screenshots and a verification report to `docs/` and changes the local demo workspace while testing.

For CI, install the browser first with `npx playwright install --with-deps chromium`, then use `BROWSER_CHANNEL=chromium npm run test:browser` while the dev server is running.

The production build lazily loads the voice console and its SDK. The ElevenLabs voice bundle is sizeable; Vite currently reports a >500 kB chunk warning. The overview does not load that bundle until the voice console opens.

## Deploy

Static review demo: the included GitHub Actions workflow builds and publishes `dist` to GitHub Pages. No secrets or backend are bundled. Enable Pages with **GitHub Actions** as the source. A static demo cannot make live ElevenLabs calls.

Full local deployment:

```bash
npm run build
npm start
# http://127.0.0.1:3100
```

Docker (set a strong token in `.env` first):

```bash
docker compose up --build
# http://localhost:3100
```

The Docker volume persists SQLite. The container runs as an unprivileged user and publishes only on host loopback by default. Review [architecture and limitations](docs/architecture.md) before a network deployment.

## Project structure

```text
src/         Dashboard, voice console, static-demo adapter and shared domain logic
server/      API, SQLite store, ElevenLabs adapter and webhook verification
scripts/     Resumable agent bootstrap and browser walkthrough
tests/      Domain and API integration tests
docs/       Feature matrix, architecture, screenshots and verification evidence
```

## Version 1.1 improvements

- Dedicated, lazily loaded audio studio with per-tool forms, meaningful examples, upload checks, JSON exports, elapsed processing time and request cancellation on tool switch. Cancelling the browser wait does not promise to cancel provider work or charges.
- Complete automatic-dubbing flow: submit → inspect status → load and download the completed original dub.
- Voice connection state follows SDK callbacks; microphone mute is separate from speaker volume; navigation saves a nonempty live transcript.
- Accessible mobile navigation labels, keyboard audio tabs, skip link and hash-based deep links that survive refresh/back navigation.
- Nested browser-storage validation prevents malformed saved workspaces from crashing the interface. Latest-tag dependencies are pinned to the installed versions, and TypeScript rejects unused local declarations.
- Knowledge attachments are serialised per agent inside the server process; concurrent application uploads retain both documents. Independent external writers still need coordination.
- Settings can explicitly verify voice-library access through a read-only provider request. This does not certify agent calls or paid audio features.

## References

Built against the installed official [`@elevenlabs/react`](https://github.com/elevenlabs/packages) and [`@elevenlabs/elevenlabs-js`](https://github.com/elevenlabs/elevenlabs-js) packages. Versions are locked in `package-lock.json`. [ElevenAgents documentation](https://elevenlabs.io/docs/eleven-agents/overview) · [ElevenLabs API documentation](https://elevenlabs.io/docs/overview).

MIT licensed. This repository supplies project evidence, not proof of usage, certification or professional accreditation. LinkedIn Connected Apps, if available to your account, must be connected and validated in the relevant platforms.

Live verification also retrieved the correct customs policy through the remote MCP semantic search using Nora’s actual RAG defaults. This validates retrieval, not a complete spoken customer conversation.

## HarborVoice Academy

The **Academy** page adds twelve genuine Eleven v4 audio lessons in English, Dutch, French and German, transcripts, practice questions with browser-local progress, and an exportable practice record. Downloads include four complete MP3 courses and chaptered M4B bundles. This independent training does not award an ElevenLabs certificate or LinkedIn badge.

The English EPUB was also imported into the native ElevenLabs Audiobooks editor with a cover, Sarah narration and pronunciation aliases, then rendered and downloaded as a three-chapter audiobook. The native export is published separately from the locally packaged course bundles. Studio API access remains account-allowlisted; the normal Audiobooks interface worked.

Other real additions: an Eleven v3 two-speaker dialogue, before/after pronunciation dictionary samples transcribed by Scribe, three fictional Voice Design voices now saved privately (see Elite evidence), four illustrated covers, a six-second LTX 2 Fast video and a native brand kit. The courses, dialogue and native audiobook are stored on the [ElevenCreative Academy flow](https://elevenlabs.io/app/flows/DOwVWkHNl1M8XZpmGo1C).

See [audio evidence](docs/academy-audio-evidence.json), [native audiobook evidence](docs/academy-native-evidence.json), [creative evidence](docs/academy-creative-evidence.json), [pronunciation comparison](docs/academy-pronunciation-evidence.json) and [recognition research](docs/recognition-research.md). Run `npm run test:academy` for the public learning walkthrough without generating audio.

## Phase 3 developer tools

[AgentOps Kit](packages/agentops-kit/README.md), [AgentProof](apps/agentproof/README.md), the [110-scenario fixture corpus](benchmarks/voice-ai/README.md), [workshop](community/elevenlabs-belgium/README.md) and [article drafts](docs/phase3/articles/) are included as maintained developer tools. Run `npm run phase3:verify` and `npm run format:phase3:check`; start the AgentProof preview, then run `npm run phase3:browser`. `AGENTPROOF_URL` can select another local preview port. Offline CI runs without provider secrets. AgentProof is [publicly deployed](https://phlppgdfry.github.io/harborvoice-ai/agentproof/). AgentOps Kit is supplied as a downloadable package, not published to npm. The 110 scenarios are deterministic teaching fixtures; the separate 12-case contract study intentionally detects nine failures and accepts three controls. Neither establishes deployed model reliability.

See the [pre-Phase 4 audit](docs/final-mastery/pre-phase4-audit.md) for verified scope, account reconciliation, production acceptance blockers and owner decisions.

## Current release and operational boundaries

Stable scope: public synthetic demo, AgentProof and AgentOps Kit. Source-complete, demo-complete, production-accepted, publication-submitted and externally-approved are separate states. No unconditional production-readiness or ElevenLabs endorsement is claimed.

Run `npm run phase3:verify`, `npm run format:phase3:check`, `npm run elite:validate`, `npm run recognition:validate` and `npm audit --audit-level=high` in addition to the root checks. `npm run test:postgres` uses a disposable Docker database and verifies migrations, concurrency, rollback, authorization, persistence, deletion and pg_dump/pg_restore without touching production.

Before production rollout the owner must accept physical microphone quality, interruptions, Dutch/French pronunciation, retention/privacy policy, provider-side deletion, live backup ownership and a scheduled recovery exercise. No live migration, restore or alias promotion occurred during consolidation. The runtime remains a single-operator synthetic workspace. Saved text is client-reported, not provider-attested.

New paid tests require account-wide liability reconciliation and bounded reservations. The observed 20,026 credits are not automatically a safe spending budget. Historical uncertain liabilities keep new paid dispatch capped at zero. No media was regenerated for this release.

See the [branch inventory](docs/release-finalization/branch-inventory.md), [current handoff report](docs/release-finalization/FINAL-CONSOLIDATION-REPORT-NL.md), [security details](docs/security.md) and [production deployment/recovery procedures](docs/deployment.md). Font and worklet licenses are retained under `public/licenses/fonts/` and `public/vendor/`.
