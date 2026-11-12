# Demo video package (3–4 minutes)

11 November 2026. **Status: production-ready package, not a finished video.** Real silent browser footage of the live public demo has been recorded. The narration has not been recorded: it needs either the owner's own voice or a paid text-to-speech run, and no further paid operation was dispatched in this phase.

Nothing here is a mock-up. The footage is an automated Chrome session on the deployed public pages, with no overlays added. It must not be described as a human using the product, as a customer session or as a live voice call.

## Assets

| Asset                                            | Where                                                                                                                    | Notes                                                                                                                                                                                                         |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Raw footage, 1280×720, silent, 69.7 s            | [learn/media/demo-footage.mp4](https://phlppgdfry.github.io/harborvoice-ai/learn/media/demo-footage.mp4)                 | Recorded 12 Nov 2026 from the deployed site (build `4ab3e7a`): workbench, voice agents, evaluations, Community Studio, AgentProof failure, AgentProof corrected run, Learn hub. SHA-256 `b4855279…b4196f0d10` |
| Recorder                                         | `scripts/creative-community/record-demo-footage.mjs`                                                                     | `node scripts/creative-community/record-demo-footage.mjs <dir>` re-records from the live site                                                                                                                 |
| Product film with narration (8 s)                | [learn/media/product-film-example.mp4](https://phlppgdfry.github.io/harborvoice-ai/learn/media/product-film-example.mp4) | Usable as a cold open; generated media, label it as such                                                                                                                                                      |
| Existing commercial, explainer and Academy media | `public/elite/`, `public/academy/`                                                                                       | Already generated in earlier phases; optional B-roll                                                                                                                                                          |
| Existing music beds                              | `public/recognition/*.mp3`                                                                                               | Owner listening approval still open; keep under −20 dB below the voice                                                                                                                                        |
| Architecture diagrams                            | Tutorial 1 and the workshop page (inline SVG)                                                                            | Screen-capture from the page                                                                                                                                                                                  |

## Shot list and script

Target length 3:30. Read at a calm pace, about 140 words a minute. Total narration: about 470 words.

| #   | Time      | Picture                                                                                                     | Narration                                                                                                                                                                                                                                                                                                                 |
| --- | --------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 0:00–0:20 | Footage shot 1: workbench overview, slow scroll to the shipment desk                                        | "A voice agent that sounds confident and is wrong is a liability. This is HarborVoice AI: a fictional port terminal, with an ElevenLabs agent called Nora who answers shipment questions in four languages. Every record you see is synthetic."                                                                           |
| 2   | 0:20–0:50 | Tutorial 1 architecture diagram, then footage shot 2: voice agent screen                                    | "Nora can do two things. She can look up a shipment by its exact reference, and she can ask for a human review. That is all. There is no tool to release cargo, so no wording from a caller can make her release it. The model proposes. The server decides what is true."                                                |
| 3   | 0:50–1:25 | Terminal: the eight starter tests passing; then the code of `handle()`                                      | "The rules live in code you can test without a model. No reference: ask for one. Unknown reference: say so, and invent nothing. Lookup system down: say it is down, and confirm nothing. A record that looks wrong: send it to a person. Eight tests, no API key, no credits."                                            |
| 4   | 1:25–1:55 | Code of `proposeEscalation` and `decideTicket`; test output                                                 | "Asking for a human is where many agents quietly lie. Here an escalation is a ticket marked pending review. Only an authenticated operator can approve or reject it, once. And approval does not change the shipment. The agent is told to say pending, never approved."                                                  |
| 5   | 1:55–2:35 | Footage shots 5 and 6: AgentProof, search `tool-error-01`, expected versus observed, then the corrected run | "To check behaviour, we write down what should happen before we look. AgentProof shows a deliberately unsafe policy failing thirty of a hundred and ten scenarios, and exactly which ones. Here the source failed and the answer still claimed success. Switch to the corrected policy, and that case recovers honestly." |
| 6   | 2:35–2:55 | Terminal: `agentops diff` and `validate` exiting with code 2                                                | "AgentOps Kit does the same for configuration. Turn authentication off or add a plain H T T P tool, and the check fails the build. Secrets are removed before anything is printed."                                                                                                                                       |
| 7   | 2:55–3:15 | AgentProof banner "Deterministic fixture study"; limitations section of Tutorial 2                          | "Be clear about what this shows. These are scripted fixtures. They prove the checks work. They do not prove a language model is reliable, and they say nothing about audio. The few real provider tests we ran are reported separately, and they are small."                                                              |
| 8   | 3:15–3:30 | Footage shot 7: Learn hub; end on the URL                                                                   | "Everything is open source. Two tutorials and a ninety-minute workshop are free, and run offline. HarborVoice is an independent project and is not affiliated with ElevenLabs. Try it, break it, and tell us what you find."                                                                                              |

On-screen text, one line at a time: "Synthetic data only" (shot 1), "0 credits, no API key" (shot 3), "Pending review ≠ approved" (shot 4), "Fixtures, not model results" (shot 7), `phlppgdfry.github.io/harborvoice-ai/learn` (shot 8).

## Terminal captures still to record

Run these in a clean terminal at a large font size and capture the screen. They are the same commands as in the tutorials, so the output is already known.

```sh
node --test community/elevenlabs-belgium/starter/agent.test.mjs
node packages/agentops-kit/dist/cli.js diff before.json after.json
node packages/agentops-kit/dist/cli.js validate after.json; echo "exit=$?"
```

## Production steps

1. Record the narration in one take per row; leave a second of room tone at the start.
2. Lay the footage and captures against the narration in any editor. Cuts only, no transitions.
3. Add captions from the script above; it is the transcript.
4. Music, if used, sits at least 20 dB under the voice and stops before the last line.
5. Export 1920×1080 or 1280×720 H.264 with AAC. Check the first and last second and listen once on laptop speakers.
6. Publish only after watching the whole export. Suggested home: `public/learn/media/` with a link from the Learn hub.

## What the video must not claim

No customers, users, attendees, downloads or testimonials. No "official", "partner", "certified" or "ambassador". No reliability percentage for the agent. No statement that the Product Launch template or the music is published. No live voice call is shown, so none may be implied.
