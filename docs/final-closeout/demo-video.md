# Demo video — finished

**Status: finished and published on the showcase (`#film`).** Supersedes the plan in [../creative-community/demo-video.md](../creative-community/demo-video.md).

| Output            | File                                                                        | Detail                                                        |
| ----------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Full video, 16:9  | `public/showcase/media/harborvoice-demo.mp4`                                | 2:54, 1920×1080, H.264 + AAC, 17 MB, −17 LUFS, peak −1.3 dBFS |
| Preview           | `public/showcase/media/harborvoice-preview.mp4`                             | 0:46 (title + review flow + AgentProof)                       |
| Poster            | `public/showcase/media/harborvoice-demo.jpg`                                | Title card                                                    |
| Captions          | `harborvoice-demo.vtt`, `harborvoice-demo.srt`                              | 41 cues, English                                              |
| Transcript        | `harborvoice-demo-transcript.txt`                                           | The narration text                                            |
| Reproducible edit | `scripts/showcase/assemble-demo.py`, `render-cards.mjs`, `record-media.mjs` | ffmpeg + Playwright                                           |

Structure: title card → problem → two tools only → rules in code (starter tests) → human approval (escalation, approval, shipment unchanged) → AgentProof → AgentOps Kit → limits → creative work → close → end card.

Narration: nine ElevenLabs text-to-speech segments, Eleven v4, library voice “Justin Case – Warm, Trustworthy, Clear”, flow `iaFZxWqsK4PLNq2ZE0bn`, 2,274 credits. No voice was cloned. Music: the project's three original Eleven Music instrumentals, crossfaded and ducked under the voice.

Checks: full decode passes; a local speech recogniser reproduces the script (its spellings “11 labs” and “Reach to” are recogniser errors for “ElevenLabs” and “Switch to”). The video was watched as frame sheets and spot frames, not by a person with sound.

**Owner check (5 minutes):** watch it once with sound. Listen for the pronunciation of “HarborVoice”, “AgentProof”, “AgentOps” and the word “Switch” at about 1:38, and for music level under the voice.
