# Public website — visual audit and redesign

## Before (audit of the live site, 16 November 2026)

Screenshots: [before-desktop](screenshots/before-desktop.png), [before-mobile](screenshots/before-mobile.png), full pages alongside.

- The Pages root opened straight into the operator workbench. A first-time visitor saw a sidebar of 14 sections and a “Portfolio preview” banner, not an explanation of what HarborVoice is.
- The core message (_evidence and human control_) did not appear above the fold; the tools (AgentProof, AgentOps Kit, Learn) were not discoverable from the root.
- Good foundations to keep: navy/teal palette, Manrope + DM Sans, the terminal map illustration, the calm product UI.
- What was real versus synthetic was explained in several places, but not in one obvious spot.

## What changed

The Pages root is now a showcase landing page (`site/index.html`, `public/showcase/`); the workbench moved to `/app.html`. Old links such as `/#community-studio` are forwarded to the app. The Vercel build is unchanged: the swap happens only in the Pages workflow (`npm run build:pages`).

Sections: hero → the problem → how it works → product tour → three-minute film → evidence → developer toolkit → creative studio → Learn → open source & status → call to action.

- **Hero:** headline, one-paragraph explanation, two actions (demo, AgentProof), three “what you are looking at” chips (synthetic data, static demo, access-controlled live app), a real 2× screenshot in a browser frame and an animated waveform card.
- **How it works:** a six-step pipeline from the actual code (caller → agent → authorised tool → verified record → human review → outcome), with the human gate visually distinct and source links.
- **Product tour:** four tabs with real silent recordings (WAI-ARIA tabs, arrow keys), loaded on demand, autoplay only when visible and motion is allowed, with a pause button.
- **Evidence:** six cards, each labelled by evidence type, including the fresh 6/6 current-version result. Nothing is aggregated into one score.
- **Status table:** what is public, submitted, pending or rejected, with honest labels.

Design: editorial layout, chart-line contours as a maritime cue, mint and amber accents on navy, self-hosted fonts, no framework, no analytics.

## Accessibility and motion

One `h1` per page, skip link, visible focus (amber outline), alt text on every image, captions on both videos, 44 px touch targets for tabs and buttons, contrast-checked text on navy. `prefers-reduced-motion` turns off all animation and autoplay; a _Pause animation_ button covers the waveform and pipeline flow (WCAG 2.2.2). No audio autoplays.

## Verification

`node scripts/showcase/qa-site.mjs` against the built site ([receipt](qa/site-qa.json)):

- Chrome and WebKit (Safari engine): 46 page checks across desktop, tablet (Chrome), 390 px and 360 px on six pages — no horizontal overflow, no page errors, no failed requests, no broken images.
- Interactions in both engines: arrow keys move between tabs, the panel follows, the legacy hash link redirects, the motion pause works, the film loads 174 s with one caption track.
- Reduced motion (Chrome): waveform animation `none`, reveal content visible, pause button hidden.
- **Firefox: not tested.** Playwright's Firefox crashed at launch on this machine.
- Not done: screen-reader pass, physical phones, automated axe audit.

Performance (local, uncached, Chrome): landing 13 requests, 235 KB desktop / 395 KB mobile transferred, largest paint 0.1–0.9 s, layout shift 0. Fonts 165 KB + 240 KB (TTF, cached across the site); hero image 135 KB; clips and film load only on demand.
