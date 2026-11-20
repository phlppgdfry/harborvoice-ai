# Native ElevenLabs publication status

Checked 17 November 2026 in the authenticated ElevenLabs app and Gmail. **Updated 20 November 2026** (ElevenReader, SDK PR, Explore re-checked).

| Item                                                                                                     | Status                                                             | Evidence                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [AI Learning Content Creator](https://elevenlabs.io/app/templates/DkSzGeLnRPG557cTaRSf)                  | Submitted to Explore; **not listed**; no decision                  | Opens under _My templates_; Explore search for “HarborVoice” returns “No templates found”; no review email                                                    |
| [Multilingual Campaign Factory](https://elevenlabs.io/app/templates/autfYixTUdY8eSnjlDOb)                | Submitted to Explore; **not listed**; no decision                  | Same                                                                                                                                                          |
| Cinematic Product Launch (Flow `04Y2ZUoBsV1BQj9uMv9k`)                                                   | **Not submitted** — failed quality gate                            | [product-launch.md](product-launch.md)                                                                                                                        |
| [ElevenReader book](https://elevenlabs.io/app/audiobooks) “Building Reliable Enterprise Voice AI Agents” | **Draft — byline corrected, awaiting owner's final _Submit_**      | 20 Nov: author profile, book author, copyright line and manuscript byline changed to “Philippe Godfroy”. Original rejection 11 Nov: author name not accepted. |
| Music Marketplace (three tracks)                                                                         | **No listings**; support request sent                              | [music-marketplace.md](music-marketplace.md)                                                                                                                  |
| [Showcase PR #113](https://github.com/elevenlabs/showcase/pull/113)                                      | Open; no reviews; Vercel check needs ElevenLabs team authorization | Last activity 9 Nov (Vercel bot)                                                                                                                              |
| [SDK PR #484](https://github.com/elevenlabs/elevenlabs-js/pull/484)                                      | **Merged** 18 Nov 2026 08:57 UTC after maintainer approval         | Merge commit `4e88c8a`                                                                                                                                        |

## ElevenReader — status 20 November

The content was not rejected; the byline was. On the owner's instruction the byline is now “Philippe Godfroy” everywhere it appears:

- author profile name and bio (“Philippe Godfroy builds HarborVoice, …”);
- the book's _Author name_ and _Author profile_;
- copyright line “Copyright © 2026 Philippe Godfroy”;
- the opening line of the manuscript (“By Philippe Godfroy.”), edited in the Studio editor without regeneration (dynamic narration, 0 credits).

Unchanged: title, cover, description, genres, free, worldwide, English, no mature content, no Stripe account.

**Left for the owner (2 minutes):** the final step re-confirms the copyright-ownership statement and the terms under your own name. That is a legal declaration, so it was not clicked on your behalf. Open <https://elevenlabs.io/app/audiobooks> → the book → status button (_Draft_) → **Create submission** → _Continue_ through the saved steps → **Submit**.

## Showcase PR — decision

Not changed. The submission has no reviewer feedback, the only failing check is the maintainer-side Vercel authorization, and a new cover would add churn without an identified requirement. If a maintainer asks, `public/showcase/img/og-cover.jpg` (1200×630, real screenshot) is a ready replacement.
