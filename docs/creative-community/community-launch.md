# Community launch package

11 November 2026. Everything on owner-controlled surfaces is published. Nothing has been posted to a third-party community or under the owner's personal identity; the drafts below wait for approval.

## Published resources

| Resource                                              | Public URL                                                                          |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Learn hub                                             | <https://phlppgdfry.github.io/harborvoice-ai/learn/>                                |
| Tutorial 1 — reliable voice agents                    | <https://phlppgdfry.github.io/harborvoice-ai/learn/reliable-voice-agents.html>      |
| Tutorial 2 — testing with AgentProof and AgentOps Kit | <https://phlppgdfry.github.io/harborvoice-ai/learn/testing-voice-agents.html>       |
| Walkthrough — narrated product film in Flows          | <https://phlppgdfry.github.io/harborvoice-ai/learn/narrated-product-film-flow.html> |
| Workshop page                                         | <https://phlppgdfry.github.io/harborvoice-ai/learn/workshop.html>                   |
| Demo workbench                                        | <https://phlppgdfry.github.io/harborvoice-ai/>                                      |
| AgentProof                                            | <https://phlppgdfry.github.io/harborvoice-ai/agentproof/>                           |
| Source and v2.2.0 release                             | <https://github.com/phlppgdfry/harborvoice-ai>                                      |

HTTP checks and dates are in [tutorial-publication.md](tutorial-publication.md).

## Workshop materials

The 90-minute workshop "Build Reliable Multilingual Voice AI Agents" is complete and runnable. What changed in this phase:

- A single public page with learning objectives, prerequisites, setup, a beginner introduction with an architecture diagram, the agenda, six exercises with expected results, cost-safe mode, facilitator notes, troubleshooting, materials and the feedback route.
- A runnable answer key (`community/elevenlabs-belgium/solutions/solutions.test.mjs`, 3 tests) for exercises 2, 3 and 6.
- The starter command now names the test file, so the documented count of 8 tests stays true.
- The core path costs 0 credits and needs no account. Optional live use is the participant's own choice, on their own account.

Existing kit, unchanged: starter (`agent.mjs`, 8 tests), slides (`slides.html`), handout, exercises, facilitator runbook, troubleshooting, launch checklist and community plan.

**No workshop is scheduled.** There is no date, venue, host community, sponsor or registration. Hackerspace Gent remains a research candidate only; it has not been contacted.

## Demo

A 3:30 script, shot list and real silent footage of the live demo are in [demo-video.md](demo-video.md). The finished narrated video has not been produced: it needs the owner's voice or a paid speech run.

## Feedback method

Two GitHub issue forms, linked from every Learn page:

- [Tutorial feedback](https://github.com/phlppgdfry/harborvoice-ai/issues/new?template=tutorial-feedback.yml)
- [Workshop feedback](https://github.com/phlppgdfry/harborvoice-ai/issues/new?template=workshop-feedback.yml)

They are public and need a GitHub account. The forms ask for no personal data and warn against including any. The Learn pages have no analytics, cookies or third-party requests, so nothing is collected from readers who do not write. GitHub Discussions is not enabled on the repository; enabling it is an owner setting and was left alone.

## Genuine adoption measurements

Counted from GitHub on 11 November 2026. Only real events are counted; nothing is estimated.

| Measure                                     | Value | How to re-check                                               |
| ------------------------------------------- | ----- | ------------------------------------------------------------- |
| Published tutorials and walkthroughs        | 3     | Learn hub                                                     |
| Published workshop pages                    | 1     | Learn hub                                                     |
| Verified public page URLs                   | 5     | `tutorial-publication.md`                                     |
| Feedback issues received                    | 0     | `gh issue list -R phlppgdfry/harborvoice-ai --label feedback` |
| Bug reports from people outside the project | 0     | `gh issue list -R phlppgdfry/harborvoice-ai`                  |
| External contributors                       | 0     | `gh api repos/phlppgdfry/harborvoice-ai/contributors`         |
| Workshop registrations                      | 0     | no registration exists                                        |
| Workshops delivered                         | 0     | none scheduled                                                |

Page views, likes, followers and downloads are not tracked and are not reported.

## External posting drafts (not posted)

Each is written for its place. Do not paste the same text in several places. Post only what you are willing to answer questions about.

### ElevenLabs developer community (Discord, a showcase or builders channel)

Check the channel's rules on self-promotion first. Post once.

> I wrote two free tutorials on making ElevenLabs agents dependable, using a small open-source logistics demo. They run offline with Node 24 — no key, no credits.
>
> 1. Tools, grounding and human approval — why "escalated" must never be reported as "approved": https://phlppgdfry.github.io/harborvoice-ai/learn/reliable-voice-agents.html
> 2. Testing agents: asserting tool arguments and stated facts, not just the outcome: https://phlppgdfry.github.io/harborvoice-ai/learn/testing-voice-agents.html
>
> It's an independent project and all data is synthetic. The checks are fixtures; they test your contracts, not the model. I'd like to know where the examples break for you.

### Discord, in reply to someone asking how to test an agent

Use only as an answer to a real question, adapted to what they asked.

> One thing that helped me: check what the agent _stated_, not only which outcome it chose. I had a case where it correctly refused an injected instruction and still said the shipment was released. An outcome-only test passed it. There's a 30-line runnable example here if useful: https://phlppgdfry.github.io/harborvoice-ai/learn/testing-voice-agents.html#assertions

### GitHub Discussions (only if the owner enables Discussions)

> **Title:** Tutorials and a workshop are live — what's missing?
>
> The Learn section is published: https://phlppgdfry.github.io/harborvoice-ai/learn/
>
> If you try a tutorial or the workshop exercises, I'd value three things: a command that didn't work on your machine, a step that was unclear, and a failure case you think the starter should cover. Issue forms are linked on every page.

### LinkedIn (technical audience)

> Most voice-agent demos show the happy path. The interesting part is what happens when the lookup system is down, the reference doesn't exist, or the caller says "ignore your rules".
>
> I've published two free tutorials and a 90-minute workshop on exactly that, built on an open-source ElevenLabs project with synthetic data:
>
> • Tools, grounding and human approval
> • Testing agents with scenario contracts
> • A workshop you can run yourself — no account or credits needed
>
> Two things I learned doing it. An agent can pick the right outcome and still state a wrong fact, so test the facts. And "I've escalated this" must never sound like "this is approved".
>
> It's an independent project, not affiliated with ElevenLabs, and the tests are fixtures rather than model benchmarks.
>
> https://phlppgdfry.github.io/harborvoice-ai/learn/

### Belgian developer meetup (message to an organiser)

Send only to a specific organiser, after reading how that community takes proposals.

> Hello — I have a hands-on 90-minute workshop on building reliable voice AI agents, and I'm looking for a first group to run it with. It is free, needs only a laptop with Node 24, and no participant needs an account or credits. Materials are open source: https://phlppgdfry.github.io/harborvoice-ai/learn/workshop.html
>
> It has not been delivered before, so I'd treat the first session as a pilot with 10–15 people and ask for honest feedback. Would this fit one of your evenings? I'm flexible on date and happy to adapt the level. I'm not representing ElevenLabs.

## Ambassador application

The owner has already submitted the ElevenLabs Ambassador application. No second application was made, and the existing one was not opened, changed or followed up. No status is known and none is claimed.

Evidence that could support a follow-up or an introduction call, if ElevenLabs asks:

- The five public Learn URLs above.
- Open upstream pull requests: [elevenlabs/showcase #113](https://github.com/elevenlabs/showcase/pull/113) and [elevenlabs/elevenlabs-js #484](https://github.com/elevenlabs/elevenlabs-js/pull/484). Both are open and unmerged.
- The workshop page and its runnable starter.
- The demo script in `demo-video.md`.

Publishing this material does not make acceptance more or less certain.

## Owner actions

1. Decide which, if any, of the drafts to post, and post them yourself or approve them one by one.
2. Decide whether to enable GitHub Discussions.
3. Record the narration for the demo video, or approve a paid speech run after the next credit reset.
4. If you want to run the workshop, pick a community and send the organiser message.
