# Cinematic Technology Soundtracks — Marketplace review package

**CREATED — TECHNICALLY TESTED — READY FOR HUMAN REVIEW — NOT SUBMITTED**

Three original 60-second Music v2.5 compositions, each structured as three 20-second chunks. No artist references, third-party audio, copied melodies, lyrics or finetunes were supplied. API song/request references are preserved in the private governor receipts. Completed review masters are also uploaded as native account assets in [the private review Flow](https://elevenlabs.io/app/flows/fRthJyA26LAFJ6NqNi6g). Uploading a review asset is not creating a Marketplace listing.

| Track              | Intended use                                | Musical direction                                                        | Suggested discovery tags                                        |
| ------------------ | ------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Future Systems     | Product launch, startup demonstration       | 104 BPM, restrained electronic motion, warm analog bass, resolved ending | cinematic, technology, electronic, instrumental, product-launch |
| Northern Lights    | Premium corporate film, reflective teaching | 76 BPM, felt piano, airy evolving textures, graceful close               | ambient, corporate, piano, atmospheric, instrumental            |
| Human Intelligence | Human-centred AI, business documentary      | 92 BPM, acoustic plucks, warm strings, optimistic cadence                | uplifting, documentary, acoustic, collaboration, instrumental   |

Original 1600×1600 artwork uses the project font and original geometric design. Titles/descriptions/tags and actual file hashes are in `music-collection.json`. Technical QA fully decodes each track, verifies duration and measures the final MP3 masters at approximately−14.9 to−15.2 LUFS and−3.3 to−3.0 dBTP. The original generation files remain private. No regeneration was used for mastering.

## Human review before submission

Listen to the complete tracks on headphones and ordinary speakers. Check opening, transitions around 20/40 seconds, final resolution, any artifacts, whether the mix leaves space for narration and whether the three tracks feel distinct. Record actual reviewer notes; automated loudness measurements do not establish subjective composition quality. Do not claim this listening review has occurred.

## Current official publishing rules

Official [Marketplace announcement](https://elevenlabs.io/blog/introducing-the-music-marketplace-in-elevencreative) and [creator earnings guidance](https://elevenlabs.io/docs/help-center/product/monetization-business/music-marketplace/how-do-creators-earn-money-on-music-marketplace) were researched. Published tracks can be used/licensed through the platform; eligibility, rights declarations, payout terms and current account publishing controls must be reviewed before submission. The documentation describes a five-track daily publication limit and one published variation per track. This sprint creates three distinct works and does not publish variants for activity.

A paid account's general commercial generation rights should not be described as blanket distribution or marketplace approval. The owner must confirm the current terms, the accepted publication path for these API-origin compositions, rights declarations, cover metadata and any required payout/tax verification. No payout account or third-party distribution agreement was created. No purchases, downloads or income are claimed.

## Cost and reproducibility

Each actual composition reserved 2,500 credits; three successful requests completed. Two earlier 422 schema-validation failures retained 2,500 each rather than assuming them free. The current Music v2.5 API uses `CompositionPlan.chunks`; older `MusicPrompt.sections` is a different model schema, and `forceInstrumental` belongs to prompt mode. The corrected generator uses typed chunks with explicit instrumental instructions and no automatic retries. Do not rerun completed tracks; receipts and file existence deduplicate them.

Exact itemized billing was not returned for every API request. Account-wide observations, conservative reservations and the native template quote remain separate in `credit-usage.json`.
