# Tutorial publication record

Last verification: **12 November 2026, 02:57 UTC**, against deployed build `4ab3e7a` (version 2.2.0).

## Published titles

| Title                                                                          | Kind        | URL                                                                                 |
| ------------------------------------------------------------------------------ | ----------- | ----------------------------------------------------------------------------------- |
| Building Reliable ElevenLabs Voice Agents: Tools, Grounding and Human Approval | Tutorial 1  | <https://phlppgdfry.github.io/harborvoice-ai/learn/reliable-voice-agents.html>      |
| Testing ElevenLabs Voice Agents with AgentProof and AgentOps Kit               | Tutorial 2  | <https://phlppgdfry.github.io/harborvoice-ai/learn/testing-voice-agents.html>       |
| A narrated product film in ElevenCreative Flows                                | Walkthrough | <https://phlppgdfry.github.io/harborvoice-ai/learn/narrated-product-film-flow.html> |
| Workshop: Build Reliable Multilingual Voice AI Agents                          | Workshop    | <https://phlppgdfry.github.io/harborvoice-ai/learn/workshop.html>                   |
| HarborVoice Learn (hub)                                                        | Index       | <https://phlppgdfry.github.io/harborvoice-ai/learn/>                                |

Source: `public/learn/`. The pages are plain HTML with one stylesheet and a 20-line copy-button script. They load no external fonts, scripts or analytics.

## Relation to earlier material

The five Phase 3 articles in `docs/phase3/articles/` are short essays (17–25 lines each) that describe the tools. They were not duplicated. The two tutorials replace description with steps: commands to run, the output to expect, and exercises. The walkthrough is new material from the Product Launch repair of 10 November. The workshop page consolidates the existing kit in `community/elevenlabs-belgium/`.

## Repository commits

| Commit    | Content                                                               |
| --------- | --------------------------------------------------------------------- |
| `8a2ff01` | Learn pages, media and the offline validator                          |
| `1d4030b` | Workshop answer key, feedback issue forms, demo footage recorder      |
| `d928fb8` | Links from the app and README; validator added to the Verify workflow |
| `c3644c6` | Product Launch record, credit ledger, Music Marketplace record        |

Pull request: [#8](https://github.com/phlppgdfry/harborvoice-ai/pull/8), merged 11 November 2026 19:14 UTC as `4ab3e7a`. The closeout documents follow in a separate documentation pull request.

## Technical validation

Every command shown in the tutorials was run on the feature branch with Node 24.22 on macOS, and the quoted output was compared with the real output. Corrections made during that pass:

- The budget example was rewritten after the first policy file was rejected by the calculator (its built-in floor rule); the page now shows a policy that runs and its actual output.
- The failing-test output in Tutorial 1 was replaced with the real assertion text.
- AgentProof steps were reworded to match the labels in the live interface.
- The starter command was pinned to `agent.test.mjs` so that it reports 8 tests.

| Check                                                                   | Result                                                          |
| ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| `node --test community/elevenlabs-belgium/starter/agent.test.mjs`       | 8 pass                                                          |
| `node --test community/elevenlabs-belgium/solutions/solutions.test.mjs` | 3 pass                                                          |
| `npm run check --prefix packages/agentops-kit`                          | 40 pass                                                         |
| `npm run test:contracts`                                                | 12 contracts: 3 accepted controls, 9 detected failures          |
| `node --import tsx scripts/phase3/benchmark.ts`                         | 110 scenarios; baseline 80/110, candidate 110/110               |
| `agentops inspect`, `diff`, `validate` (exit 2), `budget`, `report`     | Output matches the pages                                        |
| `eval-demo.mjs` from Tutorial 2                                         | `false [ 'facts' ]`, `true []`, `[]`                            |
| `npm run learn:validate`                                                | 5 pages: links, anchors, media, alt text, disclosure statements |
| `npm run check`                                                         | 65 tests: 64 pass, 0 fail, 1 PostgreSQL skip                    |
| Phone widths 390 and 360 px (Chrome)                                    | No horizontal overflow on any page; no page errors              |
| Secret scan of new files                                                | No signed URLs, workspace tokens or key-shaped strings          |

Not done: Safari, Firefox, a physical phone, a screen reader, and a reader other than the author following the steps.

## Screenshots and media

In `public/learn/img/` and `public/learn/media/`:

| File                                | What it is                                                             |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `img/agentproof-desktop.jpg`        | Hosted AgentProof, captured 10 November 2026                           |
| `img/flow-input-product.jpg`        | The product image supplied to the Flow (screenshot of the public demo) |
| `img/flow-before.jpg`               | Frames at 0, 1.2 and 6 s of the failed film                            |
| `img/flow-after.jpg`                | Frames at 0, 2.5 and 6 s of the repaired film                          |
| `img/product-film-poster.jpg`       | Poster frame of the example film                                       |
| `media/product-film-example.mp4`    | Final 8-second export, sha256 `4bcdc329…496ad1307`                     |
| `media/product-film-voice-over.mp3` | Accepted voice-over take, sha256 `d0e76f66…a0d55706`                   |

There is no screenshot of the Flow canvas: at the zoom levels the canvas offered, node text was unreadable, so the walkthrough uses a drawn diagram of the same wiring instead.

## Reproduction instructions

```sh
git clone https://github.com/phlppgdfry/harborvoice-ai.git
cd harborvoice-ai
node --test community/elevenlabs-belgium/starter/agent.test.mjs   # Tutorial 1 and workshop
npm ci
npm run check --prefix packages/agentops-kit                     # Tutorial 2
npm run test:contracts
npm run learn:validate                                           # the pages themselves
```

The Creative Flow walkthrough cannot be reproduced for free; it needs a paid ElevenLabs plan and about 2,650 credits per run as built.

## Live verification

`node scripts/creative-community/verify-live.mjs docs/creative-community/live-verification.json`, run 12 November 2026 at 02:57 UTC after the Pages deploy of merge commit `4ab3e7a` ([Publish demo run 43085616895](https://github.com/phlppgdfry/harborvoice-ai/actions/runs/43085616895), success).

| URL (under `phlppgdfry.github.io/harborvoice-ai/`) | HTTP | Title present                                                    |
| -------------------------------------------------- | ---- | ---------------------------------------------------------------- |
| `learn/`                                           | 200  | yes                                                              |
| `learn/reliable-voice-agents.html`                 | 200  | yes                                                              |
| `learn/testing-voice-agents.html`                  | 200  | yes                                                              |
| `learn/narrated-product-film-flow.html`            | 200  | yes                                                              |
| `learn/workshop.html`                              | 200  | yes                                                              |
| `learn/learn.css`, `learn/learn.js`                | 200  | —                                                                |
| `learn/img/*` (3 checked), `learn/media/*` (2)     | 200  | —                                                                |
| `/`, `agentproof/`                                 | 200  | —                                                                |
| `build-info.json`                                  | 200  | commit `4ab3e7a2ed5d9fb1aaed2578c24f74be6cc03e70`, version 2.2.0 |

The example film is served as `video/mp4`, 6,443,308 bytes, identical to the committed file. Full receipt: [live-verification.json](live-verification.json).
