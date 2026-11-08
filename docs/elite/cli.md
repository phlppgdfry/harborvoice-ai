# ElevenLabs CLI operating guide

Verified local binary: **ElevenLabs CLI 1.9.0**, 7 November 2026. This project uses the installed shared executable rather than reinstalling a second copy. Run `/Users/philippegodfroy/.local/bin/agent-tools run elevenlabs` if the command is absent from a shell's PATH.

The CLI is an official interface; authentication, successful reads, permission to mutate a particular resource and permission to generate paid media are separate checks. Its current help and embedded schema expose agents-as-code plus audio, creative, usage and workspace operations. The official [CLI guide](https://elevenlabs.io/docs/eleven-agents/operate/cli) documents the development workflow.

## Inspect first

```bash
elevenlabs --version
elevenlabs auth status
elevenlabs agents --help
elevenlabs agents pull --help
elevenlabs agents push --help
elevenlabs agents list --format json
elevenlabs flows --schema
```

`--schema` and `--spec` provide the installed command definitions. Inspect them before an unfamiliar mutation. Avoid `--debug` in recorded sessions because HTTP diagnostics can include sensitive material. A local dry-run is not an authorization or billing test against the provider.

The root execution rechecked `auth status` outside the sandbox and found active OAuth in macOS Keychain. A sandbox-only check had reported the Keychain entry missing; that was not grounds to copy credentials or reinstall the CLI. The API key loaded by the application and the CLI's OAuth identity are independently managed. When spawning the CLI from a process that loaded `.env.local`, explicitly select the intended authentication mechanism; an inherited `ELEVENLABS_API_KEY` can take precedence over OAuth. Never copy the OAuth token into project files.

## First pull in isolation

Create a new ignored directory such as `var/elite/agents-code`. Initialize it using `elevenlabs agents init` from that directory, then pull only the registry's intended agent. Replace the placeholder below with the stable ID from the resource inventory; it is a resource reference, not a credential.

```bash
elevenlabs agents init
elevenlabs agents pull --agent '<registered-agent-id>' --yes
```

The installed `pull --help` also exposes `--branch`, `--all-branches`, `--output-dir`, `--update` and `--all`. Use one agent initially; do not pull every workspace resource into the public repository. The generated structure contains `agents.json`, `tools.json`, `tests.json`, `agent_configs/`, `tool_configs/` and `test_configs/`.

Inspect the downloaded JSON for private prompts, service URLs, tool authentication metadata and personal content before choosing what to version. Keep the full remote snapshot private. A separate sanitized configuration and hash can be committed. A pull proves retrieval, not deployment.

## Reviewed push

```bash
elevenlabs agents push --agent '<registered-agent-id>' --dry-run
elevenlabs agents push --agent '<registered-agent-id>' --version-description 'HarborVoice reviewed configuration'
```

The real push is only appropriate after the intended local configuration is validated, the remote snapshot is current, and the reconciliation report has no unresolved conflict. Preserve manual native edits rather than treating the latest local file as automatically authoritative. Inspect the provider again after publishing and record the resulting version. Do not attach a paid test run to every push.

Versioning on an existing agent is irreversible. Review that separately and use a development resource or branch before changing traffic on Nora. [Agent versioning](https://elevenlabs.io/docs/eleven-agents/operate/versioning).

## Version-matched assistant guidance

```bash
elevenlabs generate-skills --output-dir var/elite/cli-skills
```

This command builds guidance from the installed CLI's embedded definition and works offline. Read generated instructions before adopting them; they describe syntax, not additional user authorization. Keep generated output isolated rather than installing a large unreviewed instruction library globally.

## Resumable paid operations

Before a billable CLI action, reserve its maximum conservative allowance in the Credit Governor. Record the command family, input hash, native resource/job ID, start time and status without secrets. Set `--no-retry` for a potentially billable request where supported by that command; inspect the command's own options rather than assuming a retry flag exists everywhere. On ambiguous failure, poll the known job or inspect history before any new generation. A failed command may have been accepted remotely and may still be charged.

Do not use a CLI endpoint to evade Studio allowlisting, plan restrictions or public voice verification. Those restrictions remain even when a command appears in `--help`.

Executed `generate-skills` with the isolated output directory:34 files were produced from the installed CLI. They were not installed globally or treated as extra authorization. Agent pull and push dry-run were repeated after the Enterprise merge; a no-change real push was omitted to avoid manufacturing a deployment.
