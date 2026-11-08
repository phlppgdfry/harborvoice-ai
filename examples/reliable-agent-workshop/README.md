# Reliable multilingual agent workshop starter

A safe runnable companion, inside the existing MIT repository. It is not a second hosted repository or an official ElevenLabs SDK.

```sh
node --test examples/reliable-agent-workshop/starter.test.mjs
node --input-type=module -e 'import {answer} from "./examples/reliable-agent-workshop/starter.mjs"; console.log(answer("HV-2048","nl"))'
```

No key, paid generation or network required. Exercise: add a failure result distinct from `found:false`; test that the caller does not claim an arrival or review success after a failure. Then implement duplicate-proposal protection in a durable adapter. The starter deliberately does not pretend that its in-memory records are production persistence.

For real voice, follow the root README, use the existing private Nora agent and its authenticated session path, and review the budget and provider permissions before making a call. Never paste a provider key into browser code or this starter. The local logic tests do not establish live model reliability.
