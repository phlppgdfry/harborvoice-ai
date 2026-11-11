# Cinematic Product Launch — root cause, repair and status

11 November 2026. Native Flow: [04Y2ZUoBsV1BQj9uMv9k](https://elevenlabs.io/app/flows/04Y2ZUoBsV1BQj9uMv9k).

**Status: Flow repaired and verified. Template draft prepared. NOT published and NOT submitted to Explore.** Publishing needs one more paid example run (provider estimate about 5,550 credits) that was deliberately not started. See [Submission status](#submission-status).

## Root cause

Both defects were structural and are visible in the Flow as it stood on 9 November, not guesses from the output.

| Defect                           | Evidence                                                                                                                                                                                                                                                                                                                                         | Cause                                                                                                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Abstract animation, no product   | Frame 0 of generation `ArE29aHJwAeyf6yTqMCC` is the product screenshot; by 1.2 s the frame is an abstract network and stays so for the remaining 11 s. The node was `ltx-v2-fast`, 12 s, with the image on `start_frame` only and its prompt wired from an LLM node (`max_output_tokens` 1500) that wrote a full scene description from a brief. | A start frame fixes only the first frame. The provider's own model guide says LTX fast "drifts on multi-beat narratives" and wants three sentences or fewer. The prompt drove a cut. |
| No verifiable English voice-over | The Flow contained no text-to-speech node. The brief asked the LLM to "include one complete spoken line" inside the video prompt, with `generate_audio: true` on the video model.                                                                                                                                                                | Narration was delegated to the video model's incidental audio. There was no script output and no speech asset to inspect.                                                            |
| Cropped input                    | The product image was 1440×1375 feeding a 16:9 video.                                                                                                                                                                                                                                                                                            | Aspect mismatch.                                                                                                                                                                     |

## Fix

Repaired in place; the historic nodes and their generations were left untouched.

- **Inputs:** five single-purpose text nodes (Product name, Product description, Target audience, Brand tone, Call to action) and one image (Product photo). The old 1,250-character brief was replaced.
- **Script:** the LLM node (`mCu4riZWPpb3Fn4opdkL`, Gemini 2.5 Flash, temperature 0.3) now writes only the narration: three grammatical sentences, 15–17 words, facts from the description only, inputs treated as data.
- **Voice-over:** new TTS node `c3ob4vKRwjO613mO8t51`, Eleven v4, language `en`, library voice "Justin Case - Warm, Trustworthy, and Clear" (`DtQLDxHbTiQTpVVanTy1`).
- **Music:** new node `cfWCnGePxWK4ceokPnw8`, Eleven Music v2.5, instrumental, mood taken from Brand tone.
- **Film:** node `WnGtk2F9abS600R9aT0V` moved to Veo 3.1 Lite, 8 s, 1080p, model audio off, with the product photo wired to **both** `start_frame` and `end_frame`, a fixed camera-only prompt and a negative prompt. The LLM no longer feeds the video.
- **Mix:** new composition node `GDlPjPEPndglRIb19jug` combining film, voice-over and music.
- **Example image:** a 1920×1080 screenshot of the owner's public demo (asset `Dd7cQcOJqOXmVinmOCXf`, sha256 `5bff3b6e…78c2d097`).

Model choice was made on free estimates for the same clip: Veo 3.1 Lite 2,424 credits; Kling 2.5 Turbo (10 s) 4,242; Kling 3 Pro (10 s) 6,787; Seedance 2.5 (10 s, 1080p) 62,648.

## Actual example

Final export: generation `buHj1uamO0G8japCdGAB`, published for inspection at [learn/media/product-film-example.mp4](https://phlppgdfry.github.io/harborvoice-ai/learn/media/product-film-example.mp4) (sha256 `4bcdc329ad66136164fc17f7edde12bced0c658b7f2781f1a7b7065496ad1307`). Narration: "Need trusted voice agents? HarborVoice AI is an open-source learning workbench. Explore the demo and the source."

Two film runs were made, each with a stated hypothesis:

1. `e23czK0hYWGezjUXQ8P6` — product stayed on screen for all 8 s, but a banner was recoloured and its text replaced, and small labels were garbled. **Rejected.** Diagnosis: the prompt itself asked for "a faint sheen passing once across the surface".
2. `d1UGB7P4ZoW6S9QJn2sM` — sheen and lighting language removed. No invented or rewritten content. **Best version.** Remaining defect: soft focus and slight dimming between about 1.5 s and 3.5 s.

## Quality verification

All checks were run locally on the downloaded files.

| Check                         | Method                                                  | Result                                                                                        |
| ----------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Product retained              | SSIM of one frame per second against the supplied image | 0.96, 0.93, 0.76, 0.76, 0.94, 0.96, 0.96, 0.96, 0.96 at 0–7.9 s (encoding ceiling about 0.96) |
| Nothing invented              | Visual review of sampled frames                         | No new text, logos or objects in run 2                                                        |
| Narration present and correct | MLX Whisper (small) on the audio of the final export    | Matches the script word for word                                                              |
| Narration fits                | ffprobe                                                 | Voice 7.44 s, music 7.48 s, picture 8.02 s                                                    |
| File integrity                | Full ffmpeg decode                                      | H.264 1920×1080 + AAC, no errors                                                              |
| Loudness                      | EBU R128                                                | −24.4 LUFS integrated, peak −4.0 dBFS (quiet for social platforms)                            |

Against the brief's gate: recognizable product **yes**; shape and branding preserved **yes**; no invented logos **yes**; no unrelated abstract animation **yes**; verified English narration **yes**; no unreadable labels **partly** (unreadable only during the roughly two-second soft passage; sharp otherwise). No human listening or viewing panel was used.

## Credit spending

5,617 credits by the account counter (20,026 → 14,409), 5,621 by receipts. Of that, 4,848 is the two film runs, 131 is one voice-over take wasted by starting it in parallel with the script node, and the rest is script, voice and music takes. Full operation list: [credit-ledger.json](credit-ledger.json). No upgrade, purchase or overage.

## Template ID

The template is drafted on the Flow itself (`04Y2ZUoBsV1BQj9uMv9k`); a published template ID does not exist yet. Draft settings entered in the native panel on 11 November: six inputs with help text; outputs "Final product launch film" and "English voice-over"; access "Just me".

## Submission status

**Not submitted.** The native Publish step showed, verbatim: "Selected generations don't match the current template. Create generations from the template as examples." The Publish button is disabled until an example is generated through the template dialog, and that dialog quoted **~5,550 credits** for one run.

That run was not started, for three reasons:

1. It would roughly double the spend on this objective (to about 11,200 credits) and exceed the 6,000-credit cap set before the first dispatch.
2. A new run produces a new film. Two runs so far gave two different mid-clip defects, so the published example could be worse than the verified one.
3. On 11 November the account counter showed 3,013 credits of movement that did not come from this task (a 3:04 song in Music History). Another consumer is active, so the conditions for a safe dispatch no longer hold.

No Explore submission confirmation exists, and no approval is claimed.

## Public/review link

- Flow (owner only): <https://elevenlabs.io/app/flows/04Y2ZUoBsV1BQj9uMv9k>
- Verified example and method (public): <https://phlppgdfry.github.io/harborvoice-ai/learn/narrated-product-film-flow.html>

## Remaining limitations

- About two seconds of soft focus in the best example; a dense screenshot with small text is a hard input for generative video.
- One accepted run; results vary between runs.
- The template dialog's ~5,550-credit estimate is about double the sum of single takes (about 2,650). The reason was not established; it should be understood before publishing, because it is also what every user of the template would pay.
- English narration only; final loudness left at composition defaults.
- The earlier unrelated nodes (three LTX clips, Academy illustration, uploaded media) are still on the canvas. They are not upstream of the outputs.

## Owner decision

Either (a) approve one template example run of about 5,550 credits, review the result, and submit to Explore only if it is at least as good as the verified example; (b) first test a product photo with large, simple features, which should be easier for the model; or (c) keep the Flow private and use the public walkthrough as the deliverable. Recommendation: (c) now, and (b) after the next credit reset if Explore still matters.
