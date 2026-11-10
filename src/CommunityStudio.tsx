import { useState } from "react";
import { ArrowUpRight, BookOpen, Headphones, ShieldCheck } from "lucide-react";
import music from "../docs/recognition/music-collection.json";
import lesson from "../public/recognition/learning-revised-transcript.json";
import experiments from "../docs/recognition/agent-experiments.json";
import { initialState } from "./domain";
import "./community.css";
const base = import.meta.env.BASE_URL + "recognition/";
const repo = "https://github.com/phlppgdfry/harborvoice-ai/blob/main/";
const languages = {
  en: {
    name: "English",
    question: "Where is shipment",
    recorded: "Recorded status:",
    found:
      "The recorded shipment is on customs hold. I cannot clear it. Human review is required.",
    missing:
      "I cannot find this reference. Please verify it; I will not select another shipment.",
    review: "A review would remain pending until an authorized person decides.",
  },
  nl: {
    name: "Nederlands",
    question: "Waar is zending",
    recorded: "Geregistreerde status:",
    found:
      "De geregistreerde zending staat onder douaneblokkade. Ik kan deze niet vrijgeven. Menselijke beoordeling is nodig.",
    missing:
      "Ik vind deze referentie niet. Controleer deze; ik kies geen andere zending.",
    review:
      "Een beoordeling blijft in afwachting tot een bevoegde persoon beslist.",
  },
  fr: {
    name: "Français",
    question: "Où se trouve l’envoi",
    recorded: "Statut enregistré:",
    found:
      "L’envoi enregistré est bloqué en douane. Je ne peux pas le libérer. Une validation humaine est nécessaire.",
    missing:
      "Cette référence est introuvable. Vérifiez-la; je ne choisis pas un autre envoi.",
    review:
      "Une demande reste en attente jusqu’à la décision d’une personne autorisée.",
  },
};
export default function CommunityStudio() {
  const [lang, setLang] = useState<keyof typeof languages>("en"),
    [reference, setReference] = useState("HV-2048"),
    [submitted, setSubmitted] = useState("HV-2048");
  const copy = languages[lang],
    shipment = initialState.shipments.find((s) => s.id === submitted);
  const trace = {
    mode: "DETERMINISTIC DEMO",
    data: "SYNTHETIC BUSINESS DATA",
    tool: "lookup_shipment — local fixture",
    arguments: { reference: submitted },
    result: shipment
      ? {
          found: true,
          id: shipment.id,
          status: shipment.status,
          eta: shipment.eta,
        }
      : { found: false },
    actionsExecuted: 0,
  };
  return (
    <div className="community-studio">
      <section className="community-hero">
        <span className="eyebrow">HARBORVOICE / CONTRIBUTION EDITION</span>
        <h1>
          Built to be understood.
          <br />
          Ready to be reviewed.
        </h1>
        <p>
          Original teaching, reproducible experiments and useful creative work.
          Every publication has a visible review state.
        </p>
        <div className="community-facts">
          <span>
            <ShieldCheck size={17} /> Independent project
          </span>
          <span>No official endorsement</span>
          <span>No credits for playback</span>
        </div>
      </section>
      <section className="panel padded">
        <div className="community-heading">
          <div>
            <span className="eyebrow">VOICEBRIDGE BELGIUM</span>
            <h2>Three languages. One business rule.</h2>
          </div>
          <span className="badge">DETERMINISTIC REHEARSAL</span>
        </div>
        <p>
          Switch languages without changing the reference or approval boundary.
          This walkthrough uses local fixtures; it makes no AI or provider
          calls.
        </p>
        <div className="community-controls">
          <label>
            Rehearsal language
            <select
              value={lang}
              onChange={(e) =>
                setLang(e.target.value as keyof typeof languages)
              }
            >
              {Object.entries(languages).map(([id, l]) => (
                <option key={id} value={id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(reference.trim().toUpperCase());
            }}
          >
            <label>
              Fictional shipment reference
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                maxLength={32}
              />
            </label>
            <button className="btn primary" type="submit">
              Check local fixture
            </button>
          </form>
        </div>
        <div className="community-duo">
          <div className="community-dialogue" aria-live="polite">
            <p>
              <strong>Caller</strong>
              <br />
              {copy.question} {submitted}?
            </p>
            <p lang={lang}>
              <strong>Assistant · scripted</strong>
              <br />
              {shipment
                ? shipment.status === "Customs hold"
                  ? copy.found
                  : `${copy.recorded} ${shipment.status}.`
                : copy.missing}
            </p>
            {shipment && <p lang={lang}>{copy.review}</p>}
            <p className="muted">
              No proposal is saved and no business action is executed.
            </p>
          </div>
          <pre aria-label="Visible local tool trace">
            {JSON.stringify(trace, null, 2)}
          </pre>
        </div>
        <div className="community-links">
          <a href="#voice-agents">
            Open real Nora voice interface <ArrowUpRight size={15} />
          </a>
          <a
            href={repo + "docs/recognition/hackathon.md"}
            target="_blank"
            rel="noreferrer"
          >
            Three-minute demo runbook
          </a>
        </div>
        <p className="muted">
          Real voice requires authorized access and provider availability. The
          public trial has a fixed expiry. A Ghent event on 11 December 2026 has
          not been confirmed.
        </p>
      </section>
      <section className="community-duo">
        <article className="panel padded community-book">
          <img
            src={base + "book-cover.png"}
            alt="Building Reliable Enterprise Voice AI Agents — review edition cover"
            loading="lazy"
          />
          <div>
            <BookOpen size={23} />
            <span className="eyebrow">COMPLETE REVIEW MANUSCRIPT</span>
            <h2>Engineering you can explain.</h2>
            <p>
              Ten chapters on facts, tools, human review, language, evaluation
              and cost. More than 6,000 words before the references. Text-only
              EPUB with practical exercises.
            </p>
            <a
              className="btn primary"
              href={base + "reliable-enterprise-voice-ai.epub"}
              download
            >
              Download review EPUB
            </a>
            <p className="muted">
              Submitted to ElevenReader as HarborVoice Project after owner
              approval. Pending external review; no public listing or provider
              acceptance verified. The downloadable EPUB is the imported
              edition; subsequent native formatting edits are documented.
            </p>
          </div>
        </article>
        <article className="panel padded">
          <span className="eyebrow">TWO NATIVE AGENT EXPERIMENTS</span>
          <h2>Test the boundary, not the applause.</h2>
          <div className="community-score">
            {experiments.passed}
            <small>/{experiments.total}</small>
          </div>
          <p>
            Code-switched handoffs and hostile instructions in tool content,
            across English, Dutch and French.
          </p>
          <p>
            Six synthetic provider text simulations on an isolated branch; one
            repeat each. These results do not measure real-user satisfaction,
            speech recognition or voice latency.
          </p>
          <a
            href={repo + "docs/recognition/agent-experiments.json"}
            target="_blank"
            rel="noreferrer"
          >
            Inspect the provider results <ArrowUpRight size={15} />
          </a>
        </article>
      </section>
      <section className="panel padded community-duo">
        <div>
          <span className="eyebrow">RECORDED NATIVE TEMPLATE OUTPUT</span>
          <h2>A complete lesson, with inspectable words.</h2>
          <p>
            This revised 61-second example comes from the tested private
            Learning Content Creator template. A real Scribe pass produced the
            accompanying transcript. It is an educational review sample, not an
            official qualification.
          </p>
          <audio
            controls
            preload="none"
            aria-label="Native learning example"
            src={base + "learning-revised.mp3"}
          />
          <details>
            <summary>Read the lesson transcript</summary>
            <p>{lesson.text}</p>
          </details>
          <a href={base + "learning-revised-quiz.txt"} download>
            Download the reviewed quiz and answers
          </a>
          <a
            href="https://elevenlabs.io/app/templates/DkSzGeLnRPG557cTaRSf"
            target="_blank"
            rel="noreferrer"
          >
            Owner-only private template
          </a>
        </div>
        <div
          className="community-process"
          aria-label="Companion engineering process, original application diagram"
        >
          <span className="eyebrow">COMPANION PROCESS</span>
          <ol>
            <li>
              <strong>01 · Ask for the exact reference</strong>
              <span>
                Keep the caller's identifier visible across languages.
              </span>
            </li>
            <li>
              <strong>02 · Check the authoritative source</strong>
              <span>
                A tool result supplies facts; untrusted notes do not supply
                authority.
              </span>
            </li>
            <li>
              <strong>03 · Preserve human review</strong>
              <span>
                A proposed request remains pending until an authorized person
                decides.
              </span>
            </li>
          </ol>
          <p className="muted">
            Original application diagram. The native template's generated
            illustration failed visual QA and is withheld from this public
            preview.
          </p>
        </div>
      </section>
      <section>
        <div className="community-heading">
          <div>
            <span className="eyebrow">CINEMATIC TECHNOLOGY SOUNDTRACKS</span>
            <h2>Three moods. Deliberate composition.</h2>
          </div>
          <Headphones />
        </div>
        <p>
          Recorded ElevenLabs Music v2.5 outputs. Original instrumental review
          collection; not submitted to the Music Marketplace.
        </p>
        <div className="community-tracks">
          {music.tracks.map((t) => (
            <article className="panel" key={t.id}>
              <img
                src={base + t.id + ".png"}
                alt={t.title + " cover"}
                loading="lazy"
              />
              <div className="padded">
                <h3>{t.title}</h3>
                <p>{t.description}</p>
                <audio
                  controls
                  preload="none"
                  aria-label={t.title}
                  src={import.meta.env.BASE_URL + t.file}
                />
                <p className="muted">
                  60-second review master · human listening review pending
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="panel padded">
        <span className="eyebrow">PUBLICATION BOARD</span>
        <h2>Prepared does not mean approved.</h2>
        <div className="community-board">
          {[
            [
              "Official Showcase",
              "PR #113 submitted and open; maintainer CI authorization and review pending.",
              "../publication-launch/showcase.md",
            ],
            [
              "Learning template",
              "Working native example submitted for Explore review; no Explore approval verified.",
              "../publication-launch/explore.md",
            ],
            [
              "Launch & campaign templates",
              "Fixed English-to-Dutch/French campaign submitted for review. Product Launch withheld for output-quality defects.",
              "../publication-launch/explore.md",
            ],
            [
              "Official SDK contribution",
              "PR #484 open with 29 offline tests and passing Bugbot; maintainer review required, not merged.",
              "../publication-launch/open-source.md",
            ],
            [
              "Ambassador & Creator Partner",
              "Truthful portfolio and application drafts; not submitted.",
              "applications.md",
            ],
            [
              "Belgium workshop",
              "90-minute kit, tested starter and instructor guide; no event has happened.",
              "workshop.md",
            ],
          ].map(([name, status, file]) => (
            <a
              key={name}
              href={repo + "docs/recognition/" + file}
              target="_blank"
              rel="noreferrer"
            >
              <strong>{name}</strong>
              <span>{status}</span>
              <ArrowUpRight size={17} />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
