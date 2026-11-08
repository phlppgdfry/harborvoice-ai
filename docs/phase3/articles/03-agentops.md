# AgentOps for ElevenLabs: Configuration, Evaluation and Deployment

Voice-agent development produces more than prompts. It produces configuration versions, tools, knowledge attachments, evaluation runs, costs and deployment decisions. The operational problem is keeping those artifacts connected well enough that someone else can review a change.

The [ElevenLabs AgentOps Kit](../../../packages/agentops-kit/README.md) is an independent TypeScript package candidate inside HarborVoice. It adds a small evidence layer around the official SDK rather than reimplementing speech generation. Its runtime uses Node built-ins; a developer can build it, inspect a fictional configuration and replay fixture contracts without credentials.

The first operation is inspection. `inspect` returns the redacted configuration with a canonical SHA-256 fingerprint. Keys are sorted before hashing so JSON property order does not create false drift. Secret-shaped fields and URL credentials/query strings are removed. This has a deliberate consequence: secret-only changes do not alter the public fingerprint. The diff engine can still report a changed secret field while withholding both values. A redacted fingerprint is evidence of the public configuration, not a comprehensive private-state attestation.

Run the local CLI after building:

```sh
node packages/agentops-kit/dist/cli.js inspect packages/agentops-kit/examples/config.json
node packages/agentops-kit/dist/cli.js diff before.json after.json
node packages/agentops-kit/dist/cli.js validate config.json
```

These are this package's commands, not native ElevenLabs CLI commands. Arrays are treated atomically, so a tool-list change is visible without a sophisticated per-tool identity merge. Paths involving tools, prompts, models, knowledge or authorization are marked potentially breaking. That label requests review; it does not establish that the change will fail in production.

The safety checker similarly provides narrow heuristics. It can flag explicit disabled authentication, insecure HTTP endpoints and suspicious allowances. It cannot prove that an endpoint validates authorization, that escalation works or that a prompt resists every injection. The report always asks the reviewer to verify those boundaries. Read [the source and tests](../../../packages/agentops-kit/src/index.ts) before adapting it to a deployment gate.

Evaluation uses an explicit transport with an explicit evidence type. A fixture transport and a live provider adapter must not look interchangeable in the report. Transport failures become failed cases without public exception text, and no automatic retries occur. JSON, Markdown and HTML exports retain source commit, configuration version, cost scope and limitations. HTML escapes untrusted content.

The current SDK read adapter uses `client.conversationalAi.agents.get` through an injected server-side client. Current official documentation describes `runTests` for native tests; this candidate does not ship an automatic paid runner. That missing piece is intentional while account-wide credit coordination is unverified, and it remains an implementation gap rather than a claimed production capability.

Deployment should follow reviewed evidence, not just a green local suite. Run relevant contracts, inspect redacted drift, verify authorization and preserve old resource/budget state. The [integration plan](../integration-plan.md) keeps Phase 3 isolated until the concurrent work is reconciled. The toolkit is useful today for local review; a production operating system needs additional storage, identity and distributed spending guarantees.
