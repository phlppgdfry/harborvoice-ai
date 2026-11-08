# Creative production

The product commercial has English, Dutch and French authored narration, a 16:9 edit and an English 9:16 variant. The Enterprise explainer is 78 seconds. Source components are three real LTX 2 Fast fictional harbor takes, five genuine Eleven v4 narrations, one original 90-second Music v2.5 score, and real Playwright recordings of the deterministic application. The fictional business and recorded-demo scope are shown on screen.

The opening uses a moving cinematic port shot, followed by product footage, source/human-control narrative and an explicit project call to action. `scripts/elite/produce-films.py` performs the **local** edit, overlays and mix. It does not call paid services. Inter is used for marketing type; the bundled font and its OFL license are in assets/fonts. A normal ffmpeg build without drawtext/libass is supported by raster overlays.

Forced Alignment supplied word timings for all five narration scripts. Accessible WebVTT files accompany the films; author text is available in `public/elite/audio.json`. The separate native French dub demonstrates actual platform translation rather than confusing an authored French script with dubbing.

[Media integrity](media-integrity.json) records duration, dimensions, codecs, byte size and SHA256. Browser checks decode the three localized films and inspect desktop/mobile layouts. Visual frames were reviewed for hook, product and ending; subjective language and pronunciation quality still require native-speaker review. Do not claim testimonials, commercial adoption or real terminal integration.

Plan observed: active Creator. No stock-person endorsement, cloned real person, personal voice recording or unlicensed external music was used. Native generated sources remain in their original Flows, and project-owned delivery copies are retained in Git. Changes made in native Studio are tracked separately in [Studio evidence](studio.md).

## Reproduce the local delivery edit

Install Node24 dependencies with `npm ci`, provide ffmpeg/ffprobe on PATH, and install the pinned Pillow dependency from `scripts/elite/requirements.txt` in an isolated Python environment. The Inter font and OFL license are bundled. Start the demo, run `node --import tsx scripts/elite/capture.ts`, then `python3 scripts/elite/produce-films.py` and `python3 scripts/elite/master-audio.py`. These local capture/edit commands make no paid generation request. Reproducing upstream synthesis is a separate explicit operation guarded by the credit ledger; do not regenerate the existing source media just to run the editor.
