import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Download,
  Search,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { masteryModules, type MasteryModule } from "../agent/mastery-content";
import { findShipment, initialState } from "./domain";
import { exportJson } from "./api";
import "./mastery.css";

type ModuleProgress = { criteria: boolean[]; notes: string; updatedAt: string };
type Progress = Record<string, ModuleProgress>;
const storageKey = "harborvoice-mastery-v2";
const repo = "https://github.com/phlppgdfry/harborvoice-ai/blob/main/";
const asset = (file: string) => import.meta.env.BASE_URL + file;
function restore(): Progress {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(storageKey) || "{}",
    );
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
    const result: Progress = {};
    for (const module of masteryModules) {
      const raw = (parsed as Record<string, unknown>)[module.id];
      if (!raw || typeof raw !== "object") continue;
      const value = raw as Partial<ModuleProgress>;
      if (
        Array.isArray(value.criteria) &&
        value.criteria.length === module.criteria.length &&
        value.criteria.every((item) => typeof item === "boolean") &&
        typeof value.notes === "string" &&
        typeof value.updatedAt === "string"
      ) {
        result[module.id] = {
          criteria: value.criteria,
          notes: value.notes.slice(0, 4000),
          updatedAt: value.updatedAt,
        };
      }
    }
    return result;
  } catch {
    return {};
  }
}
function moduleMarkdown(module: MasteryModule) {
  return [
    "# " + module.title,
    "",
    "Independent HarborVoice project practice. Not an official ElevenLabs certification.",
    "",
    "## Objective",
    module.objective,
    "",
    "## Explanation",
    ...module.explanation,
    "",
    "## Example",
    module.example,
    "",
    "## Process",
    module.process.join(" → "),
    "",
    "## " + module.codeLabel,
    "```text",
    module.code,
    "```",
    "",
    "## Exercise",
    module.exercise,
    "",
    "## Self-review criteria",
    ...module.criteria.map((c) => "- [ ] " + c),
    "",
    "## Limitations",
    module.limitation,
    "",
    "## References",
    ...module.references.map((r) => "- [" + r.label + "](" + r.url + ")"),
    "- [Project evidence](" + repo + module.evidence + ")",
    "",
  ].join("\n\n");
}
function downloadGuide(module?: MasteryModule) {
  const text = module
    ? moduleMarkdown(module)
    : masteryModules.map(moduleMarkdown).join("\n\n---\n\n");
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/markdown;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = module
    ? "harborvoice-" + module.id + ".md"
    : "harborvoice-mastery-guide.md";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function BoundaryExplorer() {
  const [reference, setReference] = useState("HV-2048"),
    [mode, setMode] = useState("available"),
    [result, setResult] = useState<{ message: string; tool: unknown } | null>(
      null,
    );
  function inspect() {
    if (mode === "unavailable") {
      setResult({
        message:
          "The system cannot be checked right now. Offer human review; do not infer a shipment status.",
        tool: { error: "lookup_unavailable", statusKnown: false },
      });
      return;
    }
    const shipment = findShipment(initialState, reference);
    setResult(
      shipment
        ? {
            message:
              "Use the recorded status: " +
              shipment.status +
              ". An ETA remains an estimate. This result does not authorise a cargo release.",
            tool: {
              found: true,
              reference: shipment.reference,
              status: shipment.status,
              cargoStatusChanged: false,
            },
          }
        : {
            message:
              "No matching shipment was found. Ask the caller to verify the reference. Do not invent an ETA or a location.",
            tool: { found: false, cargoStatusChanged: false },
          },
    );
  }
  return (
    <section className="mastery-boundary" aria-labelledby="boundary-heading">
      <div className="mastery-section-heading">
        <ShieldCheck size={20} />
        <h3 id="boundary-heading">Explore a tool boundary</h3>
      </div>
      <p>
        This deterministic example uses the project's fictional shipment lookup.
        It makes no AI request and uses no credits.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          inspect();
        }}
      >
        <label className="field">
          Shipment reference
          <input
            value={reference}
            maxLength={80}
            onChange={(event) => {
              setReference(event.target.value);
              setResult(null);
            }}
          />
        </label>
        <label className="field">
          System condition
          <select
            value={mode}
            onChange={(event) => {
              setMode(event.target.value);
              setResult(null);
            }}
          >
            <option value="available">Lookup available</option>
            <option value="unavailable">Lookup unavailable</option>
          </select>
        </label>
        <button className="button primary">Inspect boundary</button>
      </form>
      {result && (
        <div className="mastery-result" role="status">
          <p>{result.message}</p>
          <pre>
            <code>{JSON.stringify(result.tool, null, 2)}</code>
          </pre>
        </div>
      )}
    </section>
  );
}
export default function MasteryLab() {
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState("All"),
    [selectedId, setSelectedId] = useState(masteryModules[0].id),
    [progress, setProgress] = useState<Progress>(restore),
    [view, setView] = useState<"learning" | "capabilities">("learning"),
    [storageNotice, setStorageNotice] = useState("");
  const visible = masteryModules.filter(
    (module) =>
      (category === "All" || module.category === category) &&
      (
        module.title +
        " " +
        module.objective +
        " " +
        module.explanation.join(" ")
      )
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const selected = masteryModules.find((module) => module.id === selectedId)!;
  const current = progress[selected.id] || {
    criteria: selected.criteria.map(() => false),
    notes: "",
    updatedAt: "",
  };
  const isCompleted = (module: MasteryModule) =>
    progress[module.id]?.criteria.length === module.criteria.length &&
    progress[module.id].criteria.every(Boolean);
  const completed = masteryModules.filter(isCompleted).length;
  function update(patch: Partial<ModuleProgress>) {
    const next = {
      ...progress,
      [selected.id]: {
        ...current,
        ...patch,
        updatedAt: new Date().toISOString(),
      },
    };
    setProgress(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setStorageNotice("");
    } catch {
      setStorageNotice(
        "Browser storage is unavailable. You can continue and export your practice record before leaving.",
      );
    }
  }
  return (
    <div className="mastery">
      <section className="mastery-intro">
        <div>
          <span className="soft-tag">Independent project learning</span>
          <h2>From a voice interface to a dependable system.</h2>
          <p>
            Fifteen practical modules connect business boundaries, agent
            engineering and creative production. Follow real project examples,
            inspect their evidence and build your own reviewable result.
          </p>
          <div className="mastery-intro-actions">
            <button className="button" onClick={() => downloadGuide()}>
              <Download size={15} />
              Download the complete guide
            </button>
            <a className="button" href="#academy">
              Listen to the foundation course
              <BookOpen size={15} />
            </a>
          </div>
        </div>
        <div className="mastery-progress">
          <p>Your project practice</p>
          <strong>
            {completed}
            <span> / {masteryModules.length}</span>
          </strong>
          <progress
            value={completed}
            max={masteryModules.length}
            aria-label="Self-reported modules reviewed"
          />
          <p>
            Self-reported, stored in this browser. Completion is not an
            ElevenLabs certificate, LinkedIn badge or independent assessment.
          </p>
          <button
            className="inline-download"
            onClick={() =>
              exportJson(
                {
                  exportedAt: new Date().toISOString(),
                  scope:
                    "Self-reported HarborVoice project learning. No identity verification, proctored assessment or official ElevenLabs credential.",
                  progress,
                },
                "harborvoice-mastery-progress.json",
              )
            }
          >
            Export practice record
            <Download size={14} />
          </button>
        </div>
      </section>
      <div className="mastery-controls">
        <label className="mastery-search">
          <Search size={17} />
          <span className="sr-only">Search Mastery modules</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search topics, tools and examples"
          />
        </label>
        <label className="field">
          Skill category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {["All", "Architecture", "Agents", "Creative", "Operations"].map(
              (value) => (
                <option key={value}>{value}</option>
              ),
            )}
          </select>
        </label>
        <div className="mastery-view" aria-label="Mastery views">
          <button
            className={view === "learning" ? "active" : ""}
            aria-pressed={view === "learning"}
            onClick={() => setView("learning")}
          >
            Learning modules
          </button>
          <button
            className={view === "capabilities" ? "active" : ""}
            aria-pressed={view === "capabilities"}
            onClick={() => setView("capabilities")}
          >
            Capability explorer
          </button>
        </div>
      </div>
      <p className="mastery-filter-status" role="status">
        {visible.length} {visible.length === 1 ? "module" : "modules"} match
        your filters.
      </p>
      {view === "capabilities" ? (
        <section className="mastery-capabilities panel padded">
          <h2>Inspect the evidence behind a capability.</h2>
          <p>
            These links connect learning topics to existing project receipts. A
            historical result is not proof that every account feature is
            currently available. The full capability matrix records live
            verification and restrictions.
          </p>
          <a
            className="inline-download"
            href={repo + "docs/elite/capability-matrix.md"}
            target="_blank"
            rel="noreferrer"
          >
            Open the full platform capability matrix
            <ArrowUpRight size={14} />
          </a>
          <div className="mastery-capability-list">
            {visible.map((module) => (
              <article key={module.id}>
                <div>
                  <span className="soft-tag">{module.category}</span>
                  <h3>{module.title}</h3>
                  <p>{module.objective}</p>
                </div>
                <div>
                  <a
                    href={repo + module.evidence}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Inspect project evidence
                    <ArrowUpRight size={14} />
                  </a>
                  <button
                    onClick={() => {
                      setSelectedId(module.id);
                      setView("learning");
                    }}
                  >
                    Study this module
                    <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!visible.length && (
            <p>Try another topic or choose All skill categories.</p>
          )}
        </section>
      ) : (
        <div className="mastery-workbench">
          <aside className="mastery-index panel padded">
            <h3>Choose your next subject</h3>
            <nav aria-label="Mastery modules">
              {visible.map((module) => (
                <button
                  key={module.id}
                  className={selected.id === module.id ? "active" : ""}
                  aria-current={selected.id === module.id ? "page" : undefined}
                  onClick={() => setSelectedId(module.id)}
                >
                  <span>{module.category}</span>
                  <strong>{module.title}</strong>
                  {isCompleted(module) && (
                    <CheckCircle2
                      size={17}
                      aria-label="Self-review completed"
                    />
                  )}
                </button>
              ))}
            </nav>
            {!visible.length && (
              <p>
                No matching modules. Clear the search or choose another
                category.
              </p>
            )}
          </aside>
          <article className="mastery-module panel padded" key={selected.id}>
            <div className="mastery-module-top">
              <span className="soft-tag">{selected.category}</span>
              <button
                className="inline-download"
                onClick={() => downloadGuide(selected)}
              >
                <Download size={14} />
                Download module
              </button>
            </div>
            {!visible.some((module) => module.id === selected.id) && (
              <p className="mastery-selection-note">
                You are reading a module outside the current filter. Choose a
                matching subject from the navigation.
              </p>
            )}
            <h2>{selected.title}</h2>
            <p className="mastery-objective">{selected.objective}</p>
            {selected.explanation.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <figure className="mastery-process">
              <figcaption>Process to inspect</figcaption>
              <ol>
                {selected.process.map((step, index) => (
                  <li key={step}>
                    <span>{index + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </figure>
            <section className="mastery-example">
              <h3>In HarborVoice</h3>
              <p>{selected.example}</p>
            </section>
            <h3>{selected.codeLabel}</h3>
            <pre className="mastery-code">
              <code>{selected.code}</code>
            </pre>
            {selected.audio && (
              <section className="mastery-recording">
                <h3>Related recorded example</h3>
                <p>
                  Reused ElevenLabs output from the existing Academy. This is an
                  illustration, not narration of this advanced module.
                </p>
                <audio
                  controls
                  preload="metadata"
                  src={asset(selected.audio)}
                  aria-label="Mastery recorded example"
                  onPlay={(event) =>
                    document.querySelectorAll("audio").forEach((audio) => {
                      if (audio !== event.currentTarget) audio.pause();
                    })
                  }
                />
                {selected.transcript ? (
                  <a
                    className="inline-download"
                    href={asset(selected.transcript)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read the source transcript
                    <ArrowUpRight size={14} />
                  </a>
                ) : (
                  <a
                    className="inline-download"
                    href={repo + selected.evidence}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read the source text and provenance
                    <ArrowUpRight size={14} />
                  </a>
                )}
              </section>
            )}
            <section className="mastery-exercise">
              <h3>Put it into practice</h3>
              <p>{selected.exercise}</p>
              <label className="field">
                Your exercise notes
                <textarea
                  rows={5}
                  maxLength={4000}
                  value={current.notes}
                  onChange={(event) => update({ notes: event.target.value })}
                  placeholder="Record your reasoning, output references and observed limitations. Keep secrets and personal data out."
                />
              </label>
              <fieldset>
                <legend>Self-review against the criteria</legend>
                {selected.criteria.map((criterion, index) => (
                  <label key={criterion}>
                    <input
                      type="checkbox"
                      checked={current.criteria[index]}
                      onChange={(event) =>
                        update({
                          criteria: current.criteria.map((value, i) =>
                            i === index ? event.target.checked : value,
                          ),
                        })
                      }
                    />
                    <span>{criterion}</span>
                  </label>
                ))}
              </fieldset>
              <p className="mastery-self-report">
                Tick a criterion after checking your own work. No automatic
                assessment or official credential is implied.
              </p>
              {isCompleted(selected) && (
                <p className="mastery-complete" role="status">
                  <CheckCircle2 size={17} />
                  Self-review recorded for this module.
                </p>
              )}
              {storageNotice && <p role="status">{storageNotice}</p>}
            </section>
            {selected.id === "tools" && <BoundaryExplorer />}
            <section className="mastery-limitations">
              <h3>Know the limit</h3>
              <p>{selected.limitation}</p>
            </section>
            <h3>Sources and implementation</h3>
            <ul className="mastery-references">
              {selected.references.map((reference) => (
                <li key={reference.url}>
                  <a href={reference.url} target="_blank" rel="noreferrer">
                    {reference.label}
                    <ArrowUpRight size={13} />
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={repo + selected.evidence}
                  target="_blank"
                  rel="noreferrer"
                >
                  Inspect the historical project evidence
                  <ArrowUpRight size={13} />
                </a>
              </li>
            </ul>
          </article>
        </div>
      )}
    </div>
  );
}
