# Build Reliable Multilingual Voice AI Agents

A practical 90-minute ElevenLabs workshop, proposed for Ghent or Bruges. Status: materials prepared; no event booked, applications submitted, participants or partner endorsements.

The existing Phase 2 `examples/reliable-agent-workshop` remains the basic workshop. This extension teaches the evidence lifecycle using AgentProof and a stricter local tool boundary. All basic exercises run without an ElevenLabs account, subscription or API key.

Materials: `instructor-notes.md`, `slides.html` (editable HTML, keyboard accessible, printable), `handout.md`, `exercises.md`, `starter/`, `troubleshooting.md`, `community-plan.md`, `application.md`. No PPTX or Google Slides artifact is claimed. Native presentation artifact tooling was unavailable, so the deliverable is a local HTML presentation.

The complete public workshop page, with learning objectives, setup, exercises with expected results, cost-safe mode, facilitator notes, troubleshooting and the feedback route, is at <https://phlppgdfry.github.io/harborvoice-ai/learn/workshop.html> (source: `public/learn/workshop.html`).

```sh
node --test community/elevenlabs-belgium/starter/agent.test.mjs
node --test community/elevenlabs-belgium/solutions/solutions.test.mjs
```

The first command runs the eight starter tests. The second is the runnable answer key for exercises 2, 3 and 6; try the exercises before reading it.

Serve slides with a local static server or open the HTML file. Presentation uses no remote fonts, scripts or API. Preparation includes reviewing the live official dashboard interface before an event; UI menus can change.
