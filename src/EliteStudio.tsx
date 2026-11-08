import { useState } from "react";
import {
  ArrowUpRight,
  Download,
  Workflow,
  Film,
  ShieldCheck,
} from "lucide-react";
import flows from "../config/elite-flows.json";
import audio from "../public/elite/audio.json";
import evaluation from "../docs/elite/evaluation.json";
import remediation from "../docs/elite/remediation.json";
import sync from "../docs/elite/synchronization.json";
import budget from "../docs/elite/credit-usage.json";
import "./elite.css";
const asset = (file: string) => import.meta.env.BASE_URL + "elite/" + file;
const studioViews = ["Productions", "Automation", "Engineering"];
const repo = "https://github.com/phlppgdfry/harborvoice-ai/blob/main/";
const stages = [
  [
    "Product brief",
    "Cinematic shots",
    "Narration + score",
    "Local composition",
    "Human QA",
  ],
  [
    "Source recording",
    "Native French dub",
    "Language review",
    "Caption review",
    "Export",
  ],
  [
    "Versioned lesson",
    "Native synthesis",
    "Transcript",
    "Practice criteria",
    "Academy",
  ],
  [
    "Executive briefing",
    "Native Scribe",
    "Transcript review",
    "Reusable article",
    "Export",
  ],
];
export default function EliteStudio() {
  const [view, setView] = useState("Productions"),
    [language, setLanguage] = useState("en"),
    [flow, setFlow] = useState(0);
  const clip = audio.clips.find(
    (c) => c.file === `elite/commercial-${language}.mp3`,
  )!;
  return (
    <div className="elite-studio">
      <div
        className="elite-tabs"
        role="tablist"
        aria-label="Elite studio views"
      >
        {studioViews.map((name) => (
          <button
            key={name}
            role="tab"
            tabIndex={view === name ? 0 : -1}
            aria-controls="elite-panel"
            onKeyDown={(event) => {
              const i = studioViews.indexOf(view);
              const next =
                event.key === "ArrowRight"
                  ? (i + 1) % 3
                  : event.key === "ArrowLeft"
                    ? (i + 2) % 3
                    : event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? 2
                        : -1;
              if (next < 0) return;
              event.preventDefault();
              setView(studioViews[next]);
              event.currentTarget.parentElement
                ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
                [next]?.focus();
            }}
            aria-selected={view === name}
            onClick={() => setView(name)}
          >
            {name === "Productions" ? (
              <Film size={17} />
            ) : name === "Automation" ? (
              <Workflow size={17} />
            ) : (
              <ShieldCheck size={17} />
            )}{" "}
            {name}
          </button>
        ))}
      </div>
      <div
        id="elite-panel"
        role="tabpanel"
        aria-label={view}
        className="elite-panel"
      >
        {view === "Productions" ? (
          <>
            <section className="elite-feature">
              <div className="elite-story">
                <span className="soft-tag">Recorded ElevenLabs output</span>
                <h2>An answer is waiting.</h2>
                <p>
                  A fictional port. A real engineering question: how do you give
                  customers useful answers while keeping consequential decisions
                  with people?
                </p>
                <p>
                  Original ElevenCreative footage and music, genuine Eleven v4
                  narration, and recorded application interactions come together
                  in a short product story.
                </p>
                <label className="field">
                  Film language
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="nl">Nederlands</option>
                    <option value="fr">Français</option>
                  </select>
                </label>
              </div>
              <div className="elite-screen">
                <video
                  key={language}
                  controls
                  preload="metadata"
                  poster={asset("film-poster.jpg")}
                  aria-label="HarborVoice product commercial"
                  src={asset(`commercial-${language}.mp4`)}
                >
                  <track
                    kind="captions"
                    src={asset(`commercial-${language}.vtt`)}
                    srcLang={language}
                    label="Captions"
                  />
                </video>
                <div className="elite-downloads">
                  <a href={asset(`commercial-${language}.mp4`)} download>
                    <Download size={14} />
                    Download film
                  </a>
                  <a href={asset(`commercial-${language}.vtt`)} download>
                    Download captions
                  </a>
                </div>
              </div>
            </section>
            <details className="panel padded">
              <summary>Read the product film transcript</summary>
              <p lang={language}>{clip.text}</p>
              <small>
                The three film narrations are authored localizations. The native
                dubbing comparison below is a separate platform-generated
                translation.
              </small>
            </details>
            <div className="two-column">
              <section className="panel padded">
                <h2>Inside the enterprise workflow</h2>
                <p>
                  A 78-second explanation of grounding, tool execution, human
                  review and the limits of the evidence. App interactions use
                  the deterministic demo and synthetic business data.
                </p>
                <video
                  controls
                  preload="metadata"
                  aria-label="Enterprise explainer"
                  src={asset("enterprise-explainer.mp4")}
                  poster={asset("film-poster.jpg")}
                >
                  <track
                    kind="captions"
                    src={asset("enterprise-explainer.vtt")}
                    srcLang="en"
                    label="English captions"
                  />
                </video>
                <a
                  className="inline-download"
                  href={asset("enterprise-explainer.vtt")}
                  download
                >
                  Download explainer captions
                </a>
                <details>
                  <summary>Explainer transcript</summary>
                  <p>
                    {
                      audio.clips.find(
                        (c) => c.file === "elite/explainer-en.mp3",
                      )?.text
                    }
                  </p>
                </details>
              </section>
              <section className="panel padded">
                <h2>One story, a vertical frame</h2>
                <p>
                  The portrait edit preserves the complete desktop application
                  frame. It does not imply a separate mobile app.
                </p>
                <video
                  className="elite-portrait"
                  controls
                  preload="metadata"
                  poster={asset("portrait-poster.jpg")}
                  aria-label="Portrait commercial"
                  src={asset("commercial-en-portrait.mp4")}
                />
                <a
                  className="inline-download"
                  href={asset("commercial-en-portrait.mp4")}
                  download
                >
                  Download portrait film
                </a>
              </section>
            </div>
            <div className="two-column">
              <section className="panel padded">
                <span className="soft-tag">Recorded native Dubbing output</span>
                <h2>Compare native French localization</h2>
                <p>
                  The English narration was translated through the native
                  ElevenCreative Dubbing v2 workflow. Compare it with the
                  authored French film above; translation and voice consistency
                  need human review.
                </p>
                <audio
                  controls
                  preload="metadata"
                  aria-label="Native French dub"
                  src={asset("native-dub-fr.mp3")}
                />
                <a
                  className="inline-download"
                  href={flows[1].url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open editable localization flow
                  <ArrowUpRight size={14} />
                </a>
              </section>
              <section className="panel padded">
                <h2>A reusable operations briefing</h2>
                <p>
                  A synthetic training briefing describes the customs and
                  human-review boundary. Native Scribe produced an inspectable
                  transcript.
                </p>
                <audio
                  controls
                  preload="metadata"
                  aria-label="Operations briefing"
                  src={asset("briefing-en.mp3")}
                />
                <a
                  className="inline-download"
                  href={asset("native-briefing-transcript.json")}
                  download
                >
                  Download native Scribe transcript
                </a>
              </section>
            </div>
            <section className="panel padded">
              <h2>Keep the production assets</h2>
              <p>
                Reuse the original soundtrack and project-owned illustration.
                These image variants were processed natively in ElevenCreative:
                transparent background and a 2560 × 1440 print-size copy.
              </p>
              <div className="elite-evidence-links">
                <a href={asset("academy-transparent.png")} download>
                  Transparent illustration
                  <Download size={14} />
                </a>
                <a href={asset("academy-print.png")} download>
                  Print-size illustration
                  <Download size={14} />
                </a>
                <a href={asset("original-score.mp3")} download>
                  Original soundtrack
                  <Download size={14} />
                </a>
                <a href={asset("native-studio-captions.srt")} download>
                  Native Studio captions
                  <Download size={14} />
                </a>
              </div>
            </section>
          </>
        ) : view === "Automation" ? (
          <section className="panel padded">
            <span className="soft-tag">Native editable workflows</span>
            <h2>Keep the useful parts. Change the brief.</h2>
            <p>
              Four reusable workflows separate expensive generation from review
              and delivery. Native generation and transcription are preserved in
              ElevenCreative. Film editing and packaging are reproducible local
              steps.
            </p>
            <div
              className="elite-flow-choice"
              role="group"
              aria-label="Choose a workflow"
            >
              {flows.map((f, i) => (
                <button
                  key={f.id}
                  aria-pressed={flow === i}
                  onClick={() => setFlow(i)}
                >
                  {f.name}
                </button>
              ))}
            </div>
            <h3>{flows[flow].name}</h3>
            <ol className="elite-pipeline">
              {stages[flow].map((s, i) => (
                <li key={s}>
                  <span>{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <p>
              {flow === 0
                ? "Three native cinematic takes feed the locally edited product films. This is a hybrid production workflow, not an automatically composed native template."
                : flow === 1
                  ? "A completed English source feeds a genuine French Dubbing v2 node. The Dutch branch remains an editable option and was not executed for this source."
                  : flow === 2
                    ? "A versioned text input feeds a native Eleven v4 narration. Quiz metadata and Academy delivery stay in the repository."
                    : "A completed briefing feeds native Scribe transcription. A person must review the text before treating it as a publishable article."}
            </p>
            <a
              className="button primary"
              href={flows[flow].url}
              target="_blank"
              rel="noreferrer"
            >
              Open this native flow
              <ArrowUpRight size={15} />
            </a>
            <p>
              <a
                href={repo + "docs/elite/flows.md"}
                target="_blank"
                rel="noreferrer"
              >
                Input contracts, execution evidence and reuse instructions
              </a>
            </p>
            <small>
              Opening a project is free. Running native nodes consumes your
              account credits. Creator-tier template publishing and Templates
              API availability are documented separately.
            </small>
          </section>
        ) : (
          <>
            <section className="panel padded">
              <span className="soft-tag">Measured project evidence</span>
              <h2>Inspect what happened.</h2>
              <p>
                Initial Enterprise evaluation:{" "}
                <strong>
                  {evaluation.passed} / {evaluation.scenarioCount}
                </strong>{" "}
                provider simulations passed. After correcting two observed
                problems,{" "}
                <strong>
                  {remediation.passed} / {remediation.total}
                </strong>{" "}
                targeted regression cases passed.
              </p>
              <p>
                The complete 52-case suite was not rerun against the corrected
                prompt. Tool results were synthetic fixtures. These tests do not
                measure microphone quality or production-terminal outcomes.
              </p>
              <div className="elite-evidence-links">
                {[
                  ["Evaluation", "docs/elite/evaluation.json"],
                  ["Corrections and regression", "docs/elite/remediation.json"],
                  ["Capability matrix", "docs/elite/capability-matrix.md"],
                  ["Resource registry", "config/resources.json"],
                  ["Credit Governor", "docs/elite/credit-usage.md"],
                ].map(([label, path]) => (
                  <a
                    key={path}
                    href={repo + path}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {label}
                    <ArrowUpRight size={14} />
                  </a>
                ))}
              </div>
            </section>
            <section className="panel padded">
              <h2>Versioned source, editable native resources.</h2>
              <p>
                Agent source snapshot: {sync.agent.status.toLowerCase()}. All
                four knowledge documents are compared against actual remote
                content. Native Studio and Flow edits are preserved for manual
                reconciliation.
              </p>
              <p>
                Release budget: at most{" "}
                {budget.maximumAdditional.toLocaleString()} additional credits.
                The governor maintains a {budget.billingBuffer.toLocaleString()}
                -credit billing buffer. Read the dated report for actual
                observed usage and pending reservations.
              </p>
              <p>
                Public playback uses recorded outputs. Private API keys stay on
                the server. The bounded visitor voice agent is separate from
                privileged operator tools.
              </p>
              <a
                className="button"
                href={repo + "docs/elite/synchronization.md"}
                target="_blank"
                rel="noreferrer"
              >
                Review synchronization boundaries
                <ArrowUpRight size={14} />
              </a>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
