# Draft PR: Add an offline tool-boundary regression example

A tool-call trace can contain the expected lookup while the answer still claims success after a source failure. This example teaches three independent assertions: honest outcome after a source error, authorization before privileged effects and a bounded tool allowlist.

The example runs without credentials and distinguishes local contract checks from provider evaluation. It includes failing/passing synthetic observations and five Node tests. It does not call ElevenLabs, grade subjective conversation quality or claim production certification.

Validation: `node --test example.test.mjs`. Placement and prompt/scaffolding files to be adapted after maintainer/owner scope review. This local proposal is not yet an upstream patch and upstream CI has not run. No generated SDK files changed.
