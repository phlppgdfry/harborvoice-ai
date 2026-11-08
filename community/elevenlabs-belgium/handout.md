# Participant handout

Voice agent loop: user audio → recognition → agent decision → optional validated tool → response → speech. Each boundary can fail independently. A fixture only exercises the boundaries it implements.

Quickstart: use Node 24; clone/download HarborVoice; run `node --test community/elevenlabs-belgium/starter/*.test.mjs`. Full AgentProof instructions are in `apps/agentproof/README.md`. No key is needed. Never paste personal credentials into shared workshop files.

Expected policies: missing ID → clarify; unknown verified record → abstain; tool error → recover honestly; contradictory/invalid source → escalate; unauthorized instruction → reject. A business action needs server-side identity and authorization even if a model selects the correct tool.

Before deployment: authenticate sensitive routes, validate inputs and tool outputs, bound duration and spending, redact logs, minimize retained conversations, test recovery and review evidence provenance. A configuration checker is not a security certificate.

Resources: [official SDK](https://github.com/elevenlabs/elevenlabs-js), [examples](https://github.com/elevenlabs/examples), [developer documentation](https://elevenlabs.io/docs), AgentOps package README, benchmark methodology and local pilot feedback instructions. Recheck current pricing and SDK documentation before optional live work.

Follow-up: create one new synthetic failure contract, inspect a sanitized configuration diff, and explain what additional live/human evidence would be needed to verify the fix. Feedback is voluntary; no audio recording by default.
