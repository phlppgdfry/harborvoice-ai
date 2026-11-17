# Cinematic Product Launch — template example and Explore decision

17 November 2026. **Status: not submitted to Explore. The required template example failed the quality gate.** Flow: [04Y2ZUoBsV1BQj9uMv9k](https://elevenlabs.io/app/flows/04Y2ZUoBsV1BQj9uMv9k). Earlier repair: [../creative-community/product-launch-final.md](../creative-community/product-launch-final.md).

## What was done

1. Re-read the Flow: all six outputs' nodes connected and completed; six template inputs with help text intact.
2. **New hypothesis for the soft-focus problem:** a product with large, simple shapes and type should be easier for the video model than a dense UI screenshot. Input: the real cover of the project's own book, unaltered, on a light 16:9 backdrop ([input](screenshots/product-launch-template-input.jpg)).
3. Budget check (11,396 available, counter quiet for five days, overage off), then one example run through the template dialog, quoted ~5,550 credits.
4. Inputs: name _Building Reliable Enterprise Voice AI Agents_; description of the book; audience _developers and architects who build voice agents for real operations_; tone _calm, precise and editorial_; call to action _Discover the book._

## Result (generation `QRRcbpm5j6jc1NxOVKkP`, charged 5,550)

| Gate                      | Result                                                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Product recognisable      | Yes. SSIM to the input 0.90–0.98 every second (previous example: 0.76 at worst)                                                                                                            |
| No changed brand text     | **Fail.** From about 0.5 s the title reads “Enterprise Voice **Voice** AI”; the small print becomes “INDEPENXDUT EDITION” ([frames](screenshots/product-launch-template-example-text.jpg)) |
| No invented elements      | **Fail.** A dark rounded pill appears top-right of the cover from about 1 s                                                                                                                |
| Correct English narration | Pass. “Need reliable voice agents? Building Reliable Enterprise Voice AI Agents helps design, test and limit agents. Discover the book.”                                                   |
| Audio fits picture        | Partial: audio 8.90 s, picture 8.02 s; the call to action ends after the last frame                                                                                                        |
| File integrity            | Pass: H.264 1920×1080 + AAC, full decode, −24.4 LUFS                                                                                                                                       |

A template example that rewrites the product's own title would advertise exactly the defect users must avoid. The example was **not saved and the template was not published**. The _Publish_ button became available after the run and was deliberately not used.

## Why no second run

Two very different inputs (a dense UI screenshot and a large-type book cover) both lost text fidelity with Veo 3.1 Lite. Another run would cost 5,550 of the 5,846 credits then left, with no change in method that addresses text repainting. Credits were used for the demo narration and the agent regression instead.

## Options for later (next billing period)

- A product photo with **no text at all** on the product (a mug, a device, packaging without print). Reasonable chance of passing; the template's help text already advises this.
- A model that preserves text better from start and end frames; compare with free `estimate_only` first. Earlier estimates: Kling 2.5 Turbo 4,242, Kling 3 Pro 6,787 for 10 s.
- Or keep the Flow private. The walkthrough on the Learn site already documents the method and its limits honestly.
