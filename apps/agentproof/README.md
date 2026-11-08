# AgentProof Pilot v0.1.0 candidate

Independent developer evidence workbench. No credentials, provider SDK, backend, cookies, analytics or live testing in the browser. Synthetic requests and policy traces are explicitly identified as fixtures. Historical six-case results are a separately attributed Phase 2 import.

From repository root:

```sh
npm ci
node --import tsx scripts/phase3/benchmark.ts
npm run build --prefix apps/agentproof
npm run preview --prefix apps/agentproof
```

Open http://127.0.0.1:4313. Filter failed scenarios, inspect `tool-error-01`, compare the corrected policy and export the report. The UI uses semantic HTML, visible focus, associated input labels, responsive tables and no animation. Screenshots and exact browser-check scope live in `docs/phase3`.

Standalone: install the app's declared devDependencies or use the parent lockfile as above. No shared application entrypoints or deployment configuration were changed. `dist/` is a static build; public publication/pilot launch awaits owner approval. A future authenticated live test service is deliberately outside this static pilot. See the threat model before adding one.

Feedback is downloaded to the participant device and is never automatically submitted. No participants or adoption are claimed. User-testing instructions: `docs/phase3/pilot-kit.md`.
