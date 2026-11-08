# Official Showcase submission — READY FOR REVIEW

No external pull request has been submitted. The source project is already public; this submission is a new editorial proposal awaiting owner approval.

## Prepared files

- `submissions/showcase/authors/philippe-godfroy.yml`: factual project biography, Belgium, public GitHub avatar, no audience or employment claims.
- `submissions/showcase/projects/harborvoice-ai.mdx`: 145-character value proposition, architecture, integration specifics, reproducibility and scoped historical evaluation results.
- `submissions/showcase/projects/images/harborvoice-ai.jpg`: original project commercial cover. Native dimensions 1280×720; recommended upstream size is advisory, not a schema requirement.

Official [contribution guide](https://github.com/elevenlabs/showcase/blob/main/.github/CONTRIBUTING.md) and `apps/www/source.config.ts` were inspected on 8 November 2026. Existing projects reviewed for structure include the AI Caption Editor and voice-agent entries; their assets and descriptions were not reused. The guide has inconsistent image locations: its frontmatter points at `/images`, while its final step names `projects/images`. The actual upstream `scripts/sync-images.cjs` confirms **projects/images** as the canonical source and copies it into the application public directory.

## Editorial choices

No YouTube URL is fabricated. The MDX body links the directly playable existing commercial and explainer. `videoUrl` is omitted because the upstream page's external-video embed is not verified for an MP4 source. `isFeatured` remains false. No social handle is invented. The MIT source is free to use; provider generation requires a separately billed ElevenLabs account. Media redistribution rights must be reviewed independently before asserting Marketplace licensing. No other contributor's author identity is used.

## Review and submission

1. Review the author biography, cover, full MDX, live demo and source license.
2. Inspect the prepared fork `phlppgdfry/showcase`, branch [`add/harborvoice-ai`](https://github.com/phlppgdfry/showcase/tree/add/harborvoice-ai), commit `7a0ddd112b31d8427e8324de178f8563f6bf6cd7`.
3. Compare only the three submission files against upstream main.
4. Run the local submission validator and upstream image sync; the complete upstream application build has a separate dependency toolchain and must not be represented as passed unless actually run.
5. After explicit owner approval, open a PR against `elevenlabs/showcase:main` with the prepared description below.
6. Record its URL and move status from READY FOR REVIEW to SUBMITTED. Only a maintainer acceptance/merge permits APPROVED; a live Showcase entry permits PUBLISHED.

## Prepared PR description

HarborVoice is a multilingual voice-agent workbench using ElevenAgents, speech APIs and ElevenCreative. It demonstrates exact-reference lookup over synthetic shipment data, human-reviewed escalation and reproducible evaluation evidence.

Demo: https://harborvoice-ai.vercel.app

Source: https://github.com/phlppgdfry/harborvoice-ai

The project source is MIT-licensed and publicly available. The project cover and demonstration media are original project materials generated or captured for HarborVoice. No real customer data, credentials or cloned personal voices are included. Please review the documented limits: bounded live access, deterministic text demo, synthetic data, 50/52 original agent results and 10/10 targeted corrected regressions.

No X/Twitter announcement handle supplied. Independent project; no ElevenLabs employment or endorsement claimed.
