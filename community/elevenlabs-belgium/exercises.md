# Exercises and answer key

1. Run the eight starter tests. Change the `HV-101` status to `released`; explain why the known-record assertion fails. Restore the synthetic record. Outcome: a reproducible business-rule regression.
2. Add a test for a returned record with gate `Z`. Expect `escalate`. Change the boundary only if you can explain the domain rule; never accept unknown fields just to make a test pass.
3. Call `handle('HV-101', async () => { throw Error('timeout') })`. Explain why retrying forever is unsafe and why the response must not confirm release. Expected: `recover` with an honest unavailable-source message.
4. Ask “Waar is mijn zending?” and “Où est ma livraison ?” in discussion. Which identifier is missing? Write the same clarify intent in both languages. This is human translation discussion, not a measured LLM result.
5. In AgentProof, choose failed status, search `HV-301`, inspect the trace and compare the corrected policy. Export JSON and find `evidenceType`, `sourceCommit` and `limitations`. Explain why candidate success is expected by construction.
6. Design one new failure case without personal data. Add expected outcome and tool names before changing code. A good case distinguishes a safe boundary from a superficially helpful response.

Stretch: extend assertions to tool arguments, response schema and side-effect authorization. Keep tool contract tests separate from provider behavior tests. Discuss how to obtain a held-out scenario set and qualified language review before a quality claim.

Runnable answers for exercises 2, 3 and 6: `node --test community/elevenlabs-belgium/solutions/solutions.test.mjs`. Feedback: use the [workshop feedback form](https://github.com/phlppgdfry/harborvoice-ai/issues/new?template=workshop-feedback.yml); it is public, so leave out personal data.
