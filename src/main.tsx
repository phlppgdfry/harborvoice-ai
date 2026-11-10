import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
const ConnectionSettings = React.lazy(() => import("./ConnectionSettings"));
const PortfolioEvidence = React.lazy(() => import("./PortfolioEvidence"));
const ExperienceLab = React.lazy(() => import("./ExperienceLab"));
const Academy = React.lazy(() => import("./Academy"));
const MasteryLab = React.lazy(() => import("./MasteryLab"));
const CommunityStudio = React.lazy(() => import("./CommunityStudio"));
const EliteStudio = React.lazy(() => import("./EliteStudio"));
import { LIVE_APP_URL } from "./deployment";
const AudioStudio = React.lazy(() => import("./AudioStudio"));
const VoiceAgent = React.lazy(() => import("./VoiceAgent"));
import {
  Anchor,
  AudioLines,
  LayoutDashboard,
  Mic,
  BookOpen,
  Workflow,
  FlaskConical,
  Settings,
  ArrowUpRight,
  ArrowRight,
  Play,
  Search,
  ChevronRight,
  Ship,
  Check,
  Download,
  Headphones,
  ShieldCheck,
  AlertTriangle,
  X,
  Plus,
  LoaderCircle,
  Activity,
  ClipboardCheck,
  ChevronDown,
} from "lucide-react";
import {
  config,
  init,
  getState,
  escalation,
  review,
  request,
  exportJson,
  deleteConversation,
} from "./api";
import {
  initialState,
  knowledge,
  runEvaluations,
  type State,
  type Shipment,
} from "./domain";
import "./styles.css";
const tabs = [
  ["Overview", LayoutDashboard],
  ["Experience lab", Play],
  ["Elite studio", Workflow],
  ["Academy", BookOpen],
  ["Mastery lab", FlaskConical],
  ["Community studio", BookOpen],
  ["Voice agents", Mic],
  ["Audio studio", AudioLines],
  ["Knowledge base", BookOpen],
  ["Workflows", Workflow],
  ["Evaluations", FlaskConical],
  ["Conversations", Headphones],
  ["Portfolio evidence", ClipboardCheck],
  ["Settings", Settings],
] as const;

function pageFromHash() {
  return (
    tabs.find(
      ([title]) =>
        `#${title.toLowerCase().replaceAll(" ", "-")}` === window.location.hash,
    )?.[0] || "Overview"
  );
}
function App() {
  const [page, setPageState] = useState<string>(pageFromHash),
    [state, setState] = useState<State>(() => structuredClone(initialState)),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [selected, setSelected] = useState("HV-2048"),
    [search, setSearch] = useState("");
  const setPage = (title: string) => {
    setPageState(title);
    window.location.hash = title.toLowerCase().replaceAll(" ", "-");
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    const change = () => setPageState(pageFromHash());
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  const refresh = async () => {
    try {
      setState(await getState());
    } catch (e) {
      setError((e as Error).message);
    }
  };
  useEffect(() => {
    init().then(() => {
      setReady(true);
      refresh();
    });
  }, []);
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(""), 4500);
      return () => clearTimeout(t);
    }
  }, [notice]);
  const notify = (s: string) => setNotice(s);
  const fail = (e: unknown) =>
    setError(e instanceof Error ? e.message : String(e));
  if (
    ready &&
    (config.deployment === "unavailable" ||
      (config.production &&
        config.operatorRequired &&
        !config.operatorAuthenticated))
  ) {
    return (
      <main className="app">
        <h1>HarborVoice operator workspace</h1>
        {error && <p role="alert">{error}</p>}
        <p>
          {config.deployment === "unavailable"
            ? "Backend unavailable. Your workspace has not been replaced with browser demo data."
            : "Sign in before accessing persistent workspace data and live voice."}
        </p>
        <React.Suspense fallback={<p>Loading connection settings…</p>}>
          <ConnectionSettings notify={notify} />
        </React.Suspense>
      </main>
    );
  }
  const active =
    state.shipments.find((s) => s.id === selected) || state.shipments[0];
  const pending = state.tickets.filter(
    (t) => t.status === "Pending review",
  ).length;
  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <aside className="sidebar">
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            setPage("Overview");
          }}
        >
          <span className="brand-icon">
            <AudioLines size={24} />
          </span>
          <span>
            HarborVoice<span className="brand-ai">AI</span>
          </span>
        </a>
        <div className="workspace">
          <span className="workspace-avatar">N</span>
          <div>
            <strong>North Sea Terminal</strong>
            <small>Logistics workspace</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-label">Workspace</div>
        <nav aria-label="Main navigation">
          {tabs.map(([title, Icon]) => (
            <button
              key={title}
              aria-label={title}
              title={title}
              aria-current={page === title ? "page" : undefined}
              className={page === title ? "nav active" : "nav"}
              onClick={() => setPage(title)}
            >
              <Icon size={18} />
              <span className="nav-name">{title}</span>
              {title === "Workflows" && pending > 0 && (
                <span className="count">{pending}</span>
              )}
              {title === "Voice agents" && <span className="tiny-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="powered">
            <AudioLines size={19} />
            <div>
              Built with ElevenLabs<small>Voice meets operations.</small>
            </div>
          </div>
          <a
            href="https://github.com/phlppgdfry/harborvoice-ai"
            target="_blank"
            rel="noreferrer"
            className="source-link"
          >
            Explore the source <ArrowUpRight size={15} />
          </a>
          <div className="profile">
            <div className="avatar">PG</div>
            <div>
              <strong>Philippe Godfroy</strong>
              <small>Solution builder</small>
            </div>
          </div>
        </div>
      </aside>
      <main id="main-content" tabIndex={-1}>
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <ChevronRight size={13} />
            <strong>{page}</strong>
          </div>
          <div className="header-right">
            <span className="mode-pill">
              <i />
              {ready
                ? config.configured
                  ? "API configured"
                  : "Demo workspace"
                : "Loading…"}
            </span>
            <a
              href="https://elevenlabs.io/docs/eleven-agents/overview"
              target="_blank"
              rel="noreferrer"
            >
              Documentation <ArrowUpRight size={14} />
            </a>
          </div>
        </header>
        <div className="content">
          {ready && config.deployment === "static" && (
            <div className="environment-banner">
              <div>
                <strong>Portfolio preview</strong>
                <span>
                  Live voice and audio are available in the operator workspace.
                </span>
              </div>
              <a className="button primary" href={LIVE_APP_URL}>
                Open live workspace
                <ArrowUpRight size={14} />
              </a>
            </div>
          )}
          {ready &&
            config.deployment === "hosted" &&
            config.operatorRequired &&
            !config.operatorAuthenticated && (
              <div className="environment-banner">
                <div>
                  <strong>Live API connected</strong>
                  <span>
                    {config.guestVoice?.enabled
                      ? "Public audio examples and a limited live visitor trial are available."
                      : "Public audio examples and the text demo are ready. Sign in for private generation tools."}
                  </span>
                </div>
                <button
                  className="button primary"
                  onClick={() => setPage("Experience lab")}
                >
                  Listen and try Nora
                </button>
              </div>
            )}

          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {page === "Overview"
                  ? "Your terminal, in conversation"
                  : "HarborVoice workspace"}
              </div>
              <h1>
                {page === "Overview" ? "Voice operations. All in view." : page}
              </h1>
              <p>
                {page === "Overview"
                  ? "From the first question to the next action. Keep your cargo moving."
                  : descriptions[page]}
              </p>
            </div>
            <button
              className="button primary"
              onClick={() =>
                setPage(
                  page === "Voice agents" ? "Audio studio" : "Voice agents",
                )
              }
            >
              <Mic size={16} />
              {page === "Voice agents"
                ? "Open audio studio"
                : "Try the voice agent"}
              <ArrowUpRight size={15} />
            </button>
          </div>
          {error && (
            <div role="alert" className="alert">
              <AlertTriangle size={18} />
              <span>{error}</span>
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {page === "Overview" && (
            <>
              <div className="metrics">
                <Metric
                  title="Tracked shipments"
                  value={String(state.shipments.length).padStart(2, "0")}
                  detail="Across the North Sea network"
                  icon={<Ship size={19} />}
                />
                <Metric
                  title="Conversations"
                  value={String(state.sessions.length).padStart(2, "0")}
                  detail={
                    state.sessions.length
                      ? "Saved in this workspace"
                      : "Start your first conversation"
                  }
                  icon={<AudioLines size={19} />}
                />
                <Metric
                  title="Awaiting review"
                  value={String(pending).padStart(2, "0")}
                  detail="Human approval before action"
                  icon={<Workflow size={19} />}
                  amber
                />
                <Metric
                  title="Knowledge sources"
                  value="04"
                  detail="Versioned terminal playbooks"
                  icon={<BookOpen size={19} />}
                />
              </div>
              <div className="overview-grid">
                <section className="panel terminal-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Terminal overview</h2>
                      <p>
                        Zeebrugge, Belgium <span className="muted-dot">·</span>{" "}
                        Synthetic scenario
                      </p>
                    </div>
                    <span className="soft-tag">
                      <span className="status-dot" />4 shipments
                    </span>
                  </div>
                  <TerminalMap
                    shipments={state.shipments}
                    selected={selected}
                    onSelect={setSelected}
                  />
                  <div className="map-footer">
                    <span>
                      <i className="legend-teal" />
                      Ready / booked
                    </span>
                    <span>
                      <i className="legend-amber" />
                      Needs attention
                    </span>
                    <span>
                      <i className="legend-blue" />
                      At sea
                    </span>
                    <span className="map-coordinates">
                      51.33° N &nbsp; 3.20° E
                    </span>
                  </div>
                  <div className="shipment-detail">
                    <div className="shipment-symbol">
                      <Ship size={22} />
                    </div>
                    <div>
                      <strong>
                        {active.id}
                        <span
                          className={
                            "status " +
                            (active.status === "Customs hold" ? "amber" : "")
                          }
                        >
                          {active.status}
                        </span>
                      </strong>
                      <p>
                        {active.customer} <span className="muted-dot">·</span>{" "}
                        {active.route}
                      </p>
                    </div>
                    <button
                      className="button quiet"
                      onClick={() => {
                        setPage("Voice agents");
                      }}
                    >
                      Ask about shipment <ArrowRight size={15} />
                    </button>
                  </div>
                </section>
                <section className="agent-feature">
                  <div className="feature-top">
                    <span className="soft-tag dark">
                      <i />
                      Your operations copilot
                    </span>
                    <AudioLines size={24} />
                  </div>
                  <h2>
                    A voice for every
                    <br />
                    moving part.
                  </h2>
                  <p>
                    Meet Nora. Your multilingual terminal assistant, grounded in
                    shipment data.
                  </p>
                  <div className="voice-orb">
                    <div className="orb-core">
                      <AudioLines size={57} strokeWidth={1.2} />
                    </div>
                    <span className="orbit o1" />
                    <span className="orbit o2" />
                  </div>
                  <div className="agent-name">
                    <span className="status-dot" />
                    Nora <span>Terminal assistant</span>
                  </div>
                  <div className="language-row">
                    EN <span /> NL <span /> FR <span /> DE
                  </div>
                  <button
                    className="button light"
                    onClick={() => setPage("Voice agents")}
                  >
                    <Mic size={16} />
                    Start a conversation
                    <ArrowUpRight size={15} />
                  </button>
                  <small>
                    Demo available. Live voice requires configuration.
                  </small>
                </section>
              </div>
              <section className="panel shipments-panel">
                <div className="panel-heading">
                  <div>
                    <h2>
                      Shipment desk{" "}
                      <span className="number-badge">
                        {state.shipments.length}
                      </span>
                    </h2>
                    <p>The context behind every conversation.</p>
                  </div>
                  <label className="search">
                    <Search size={16} />
                    <input
                      placeholder="Find a shipment…"
                      aria-label="Find a shipment"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Shipment / customer</th>
                        <th>Route / vessel</th>
                        <th>Status</th>
                        <th>Estimated arrival</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {state.shipments
                        .filter((s) =>
                          JSON.stringify(s)
                            .toLowerCase()
                            .includes(search.toLowerCase()),
                        )
                        .map((s) => (
                          <tr
                            key={s.id}
                            className={selected === s.id ? "selected-row" : ""}
                            onClick={() => setSelected(s.id)}
                          >
                            <td>
                              <strong>{s.id}</strong>
                              <small>{s.customer}</small>
                            </td>
                            <td>
                              {s.route}
                              <small>{s.vessel}</small>
                            </td>
                            <td>
                              <span
                                className={
                                  "status " +
                                  (s.status === "Customs hold"
                                    ? "amber"
                                    : s.status === "At sea"
                                      ? "blue"
                                      : "")
                                }
                              >
                                {s.status}
                              </span>
                            </td>
                            <td>{s.eta}</td>
                            <td>
                              <button
                                aria-label={`Ask about ${s.id}`}
                                className="icon-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelected(s.id);
                                  setPage("Voice agents");
                                }}
                              >
                                <ArrowUpRight size={17} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {!state.shipments.some((s) =>
                    JSON.stringify(s)
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  ) && <p className="empty">No shipments match your search.</p>}
                </div>
              </section>
              <div className="bottom-note">
                <ShieldCheck size={15} />
                Fictional terminal. Synthetic shipment data. Real integration
                architecture.<span>Designed & built by Philippe Godfroy</span>
              </div>
            </>
          )}
          {page === "Voice agents" && (
            <React.Suspense
              fallback={
                <div className="panel empty">Loading voice console…</div>
              }
            >
              <VoiceAgent
                shipment={active}
                refresh={refresh}
                fail={fail}
                notify={notify}
              />
            </React.Suspense>
          )}
          {page === "Audio studio" && (
            <React.Suspense
              fallback={
                <div className="panel empty">Loading audio studio…</div>
              }
            >
              <AudioStudio
                fail={fail}
                onConfigure={() => setPage("Settings")}
              />
            </React.Suspense>
          )}
          {page === "Knowledge base" && (
            <Knowledge fail={fail} notify={notify} />
          )}
          {page === "Workflows" && (
            <Workflows
              state={state}
              refresh={refresh}
              fail={fail}
              notify={notify}
            />
          )}
          {page === "Evaluations" && <Evaluations fail={fail} />}
          {page === "Conversations" && (
            <Conversations state={state} refresh={refresh} fail={fail} />
          )}
          {page === "Academy" && (
            <React.Suspense fallback={<p>Loading the training course…</p>}>
              <Academy />
            </React.Suspense>
          )}
          {page === "Elite studio" && (
            <React.Suspense fallback={<p>Loading productions…</p>}>
              <EliteStudio />
            </React.Suspense>
          )}
          {page === "Community studio" && (
            <React.Suspense fallback={<p>Loading contribution materials…</p>}>
              <CommunityStudio />
            </React.Suspense>
          )}
          {page === "Mastery lab" && (
            <React.Suspense fallback={<p>Loading the Mastery lab…</p>}>
              <MasteryLab />
            </React.Suspense>
          )}
          {page === "Experience lab" && (
            <React.Suspense fallback={<p>Loading audio examples…</p>}>
              <ExperienceLab />
            </React.Suspense>
          )}
          {page === "Portfolio evidence" && (
            <React.Suspense fallback={<p>Loading evidence…</p>}>
              <PortfolioEvidence />
            </React.Suspense>
          )}
          {page === "Settings" && (
            <React.Suspense
              fallback={
                <div className="panel empty">Loading connection settings…</div>
              }
            >
              <ConnectionSettings notify={notify} />
            </React.Suspense>
          )}
        </div>
      </main>
      {notice && (
        <div className="toast" role="status">
          <Check size={18} />
          {notice}
        </div>
      )}
    </div>
  );
}
const descriptions: Record<string, string> = {
  "Elite studio":
    "Explore the productions, reusable workflows and engineering evidence.",
  "Mastery lab":
    "Explore the architecture. Practice the decisions. Inspect the evidence.",
  Academy: "Learn with real audio, transcripts and self-guided practice.",
  "Experience lab": "Listen, compare and try the public voice experience.",
  "Voice agents":
    "Talk to Nora, inspect the transcript, and turn questions into reviewed actions.",
  "Audio studio": "Create, transcribe and transform audio with ElevenLabs.",
  "Knowledge base": "The operating procedures that keep every answer grounded.",
  Workflows: "Let the agent prepare. Let an operator decide.",
  Evaluations:
    "Reproducible checks, with a clear distinction between demo logic and live agent tests.",
  Conversations:
    "Your conversation history and the evidence behind each answer.",
  "Portfolio evidence":
    "Real test results and official recognition information.",
  Settings: "Check the live connection and manage your operator session.",
};
function Metric({
  title,
  value,
  detail,
  icon,
  amber = false,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  amber?: boolean;
}) {
  return (
    <div className="metric">
      <div className="metric-top">
        {title}
        <span className={amber ? "amber-icon" : ""}>{icon}</span>
      </div>
      <strong>
        {value}
        <span className="metric-line" />
      </strong>
      <small>{detail}</small>
    </div>
  );
}
function TerminalMap({
  shipments,
  selected,
  onSelect,
}: {
  shipments: Shipment[];
  selected: string;
  onSelect: (s: string) => void;
}) {
  return (
    <div className="terminal-map">
      <svg
        viewBox="0 0 800 330"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="Illustrative terminal layout, not a geographic navigation map"
      >
        <defs>
          <pattern
            id="water"
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <path d="M0 11h22M11 0v22" stroke="#d3e2e8" strokeWidth=".5" />
          </pattern>
          <pattern
            id="yard"
            width="18"
            height="11"
            patternUnits="userSpaceOnUse"
          >
            <rect x="2" y="2" width="13" height="6" rx="1" fill="#c5d0c8" />
          </pattern>
        </defs>
        <rect width="800" height="330" fill="#e6eff2" />
        <rect width="800" height="330" fill="url(#water)" />
        <path
          d="M0 300L120 240 175 155 365 155 430 90 630 90 680 0H800V330H0Z"
          fill="#e8ede4"
          stroke="#c5d2cc"
          strokeWidth="2"
        />
        <path
          d="M0 320L150 260 215 192 405 192 465 128 665 128 720 0"
          fill="none"
          stroke="#fafcf8"
          strokeWidth="19"
        />
        <path
          d="M0 320L150 260 215 192 405 192 465 128 665 128 720 0"
          fill="none"
          stroke="#c3cfc8"
          strokeDasharray="5 6"
        />
        <path
          d="M80 330L215 250H430L500 178H730"
          stroke="#fafcf8"
          strokeWidth="11"
          fill="none"
        />
        <path
          d="M290 204V330M540 140V330M720 150V330"
          stroke="#fafcf8"
          strokeWidth="9"
        />
        <path
          d="M215 210h65v27h-65zM305 210h112v27H305zM305 266h112v48H305zM440 245h85v68h-85zM555 190h145v42H555zM555 250h145v64H555zM735 175h60v140h-60z"
          fill="url(#yard)"
        />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${340 + i * 55}, ${119 - i * 9})`}>
            <rect x="0" y="0" width="8" height="35" fill="#9cafa5" />
            <path
              d="M-9 0h28M4 0V-19M-9-19h28"
              stroke="#90a69b"
              strokeWidth="3"
            />
          </g>
        ))}
        <g transform="translate(420 57) rotate(-12)">
          <path d="M-85-14H48L85 0 48 14H-85Z" fill="#718c9a" />
          <rect x="-63" y="-11" width="105" height="22" rx="2" fill="#d9e4e6" />
          <path
            d="M-44-9v18M-24-9v18M-4-9v18M16-9v18"
            stroke="#a4b8bc"
            strokeWidth="2"
          />
          <rect x="-79" y="-10" width="12" height="20" fill="#eff4f2" />
        </g>
        <text x="104" y="90" fill="#93abb7" fontSize="15" letterSpacing="4">
          NORTH SEA
        </text>
        <text x="320" y="287" fill="#8b9e92" fontSize="10" letterSpacing="2">
          ZONE B
        </text>
        <text x="566" y="285" fill="#8b9e92" fontSize="10" letterSpacing="2">
          ZONE C
        </text>
        <text x="579" y="215" fill="#8b9e92" fontSize="10" letterSpacing="2">
          ZONE A
        </text>
      </svg>
      <div className="map-label">
        <Anchor size={13} />
        Zeebrugge terminal
      </div>
      <div className="map-compass">
        N<span>↑</span>
      </div>
      {shipments.map((s) => (
        <button
          key={s.id}
          aria-label={`Select ${s.id}`}
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          className={
            "map-pin " +
            (s.status === "Customs hold" ? "warning " : "") +
            (selected === s.id ? "chosen" : "")
          }
          onClick={() => onSelect(s.id)}
        >
          <Ship size={15} />
          {selected === s.id && (
            <span>
              {s.id}
              <small>{s.status}</small>
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
function Knowledge({
  fail,
  notify,
}: {
  fail: (e: unknown) => void;
  notify: (s: string) => void;
}) {
  const [selected, setSelected] = useState(knowledge[0]),
    [name, setName] = useState(""),
    [text, setText] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="two-column">
      <section className="panel padded">
        <h2>Terminal playbooks</h2>
        <p>These four versioned sources also power the deterministic demo.</p>
        <div className="document-list">
          {knowledge.map((k) => (
            <button
              className={selected.id === k.id ? "selected" : ""}
              onClick={() => setSelected(k)}
              key={k.id}
            >
              <BookOpen size={21} />
              <div>
                <strong>{k.name}</strong>
                <small>{k.category}</small>
              </div>
              <ChevronRight size={17} />
            </button>
          ))}
        </div>
        <article className="document-preview">
          <span className="soft-tag">{selected.category}</span>
          <h2>{selected.name}</h2>
          <p>{selected.text}</p>
        </article>
      </section>
      <section className="panel padded">
        <h2>Add live agent knowledge</h2>
        <p>
          Upload a text source and attach it to your configured ElevenLabs
          agent. This changes the live agent, not the demo playbooks.
        </p>
        <label className="field">
          Document name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
          />
        </label>
        <label className="field">
          Source text
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            maxLength={40000}
          />
        </label>
        <button
          className="button primary"
          disabled={busy || !name.trim() || !text.trim()}
          onClick={async () => {
            setBusy(true);
            try {
              const r = await request("/knowledge", { name, text });
              notify(`Knowledge attached: ${r.id}`);
              setName("");
              setText("");
            } catch (e) {
              fail(e);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? (
            <LoaderCircle size={16} className="spin" />
          ) : (
            <Plus size={16} />
          )}
          Add to live agent
        </button>
      </section>
    </div>
  );
}
function Workflows({
  state,
  refresh,
  fail,
  notify,
}: {
  state: State;
  refresh: () => Promise<void>;
  fail: (e: unknown) => void;
  notify: (s: string) => void;
}) {
  const [id, setId] = useState("HV-2048"),
    [reason, setReason] = useState(
      "Customer requests a customs status review.",
    ),
    [busy, setBusy] = useState(false);
  return (
    <>
      <div className="workflow-strip">
        {[
          [Mic, "Caller asks for help"],
          [Search, "Agent checks context"],
          [Workflow, "Escalation proposed"],
          [ShieldCheck, "Operator reviews"],
        ].map(([Icon, title], i) => {
          const I = Icon as typeof Mic;
          return (
            <React.Fragment key={title as string}>
              <div>
                <I size={23} />
                <strong>{title as string}</strong>
              </div>
              {i < 3 && <ArrowRight size={18} />}
            </React.Fragment>
          );
        })}
      </div>
      <div className="two-column">
        <section className="panel padded">
          <h2>
            Review queue{" "}
            <span className="number-badge">{state.tickets.length}</span>
          </h2>
          {state.tickets.length === 0 ? (
            <div className="empty">
              <ShieldCheck size={32} />
              <h3>No escalations yet.</h3>
              <p>Ask Nora to escalate a shipment, or prepare one here.</p>
            </div>
          ) : (
            state.tickets.map((t) => (
              <article className="ticket" key={t.id}>
                <div>
                  <strong>{t.shipmentId}</strong>
                  <span
                    className={
                      "status " + (t.status === "Pending review" ? "amber" : "")
                    }
                  >
                    {t.status}
                  </span>
                </div>
                <p>{t.reason}</p>
                <small>
                  {t.id} · {new Date(t.createdAt).toLocaleString()}
                </small>
                {t.status === "Pending review" && (
                  <div className="ticket-actions">
                    {(["Approved", "Rejected"] as const).map((decision) => (
                      <button
                        className={
                          "button " + (decision === "Approved" ? "primary" : "")
                        }
                        key={decision}
                        onClick={async () => {
                          try {
                            await review(t.id, decision);
                            await refresh();
                            notify(
                              `Escalation ${decision.toLowerCase()}. Shipment status is unchanged.`,
                            );
                          } catch (e) {
                            fail(e);
                          }
                        }}
                      >
                        {decision === "Approved"
                          ? "Approve escalation"
                          : "Reject"}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            ))
          )}
        </section>
        <section className="panel padded">
          <h2>Prepare an escalation</h2>
          <p>
            Approval records an operator decision in this workspace. No external
            ticket, email or cargo release is executed.
          </p>
          <label className="field">
            Shipment
            <select value={id} onChange={(e) => setId(e.target.value)}>
              {state.shipments.map((s) => (
                <option key={s.id}>{s.id}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Reason
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={1000}
            />
          </label>
          <button
            className="button primary"
            disabled={busy || reason.trim().length < 8}
            onClick={async () => {
              setBusy(true);
              try {
                await escalation(id, reason);
                await refresh();
                notify("Escalation prepared for operator review.");
              } catch (e) {
                fail(e);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Plus size={16} />
            Prepare escalation
          </button>
        </section>
      </div>
      <section className="panel padded audit">
        <div className="panel-heading">
          <h2>Activity trail</h2>
          <button
            className="button"
            onClick={() => exportJson(state.audit, "harborvoice-audit.json")}
          >
            <Download size={15} />
            Export
          </button>
        </div>
        {state.audit.length === 0 ? (
          <p>No activity recorded yet.</p>
        ) : (
          state.audit.slice(0, 15).map((a) => (
            <div className="audit-row" key={a.id}>
              <Activity size={14} />
              <span>{a.action}</span>
              <time>{new Date(a.at).toLocaleString()}</time>
            </div>
          ))
        )}
      </section>
    </>
  );
}
function Evaluations({ fail }: { fail: (e: unknown) => void }) {
  const [results, setResults] = useState<ReturnType<typeof runEvaluations>>([]),
    [liveResult, setLiveResult] = useState(""),
    [busy, setBusy] = useState(false),
    [invocationId, setInvocationId] = useState("");
  return (
    <>
      <div className="eval-hero">
        <div>
          <FlaskConical size={28} />
          <h2>Confidence you can inspect.</h2>
          <p>
            Six deterministic checks against the demo adapter. These do not
            measure the live LLM, voice latency, or real-world accuracy.
          </p>
        </div>
        <button
          className="button primary"
          onClick={() => setResults(runEvaluations())}
        >
          <Play size={16} />
          Run demo checks
        </button>
      </div>
      {results.length > 0 && (
        <section className="panel padded">
          <div className="panel-heading">
            <h2>
              {results.filter((r) => r.passed).length} / {results.length} checks
              passed
            </h2>
            <button
              className="button"
              onClick={() =>
                exportJson(
                  {
                    scope: "deterministic demo",
                    at: new Date().toISOString(),
                    results,
                  },
                  "harborvoice-demo-evaluation.json",
                )
              }
            >
              <Download size={15} />
              Export evidence
            </button>
          </div>
          {results.map((r) => (
            <div className="eval-row" key={r.name}>
              <span className={"eval-icon " + (!r.passed ? "failed" : "")}>
                {r.passed ? <Check size={16} /> : <X size={16} />}
              </span>
              <div>
                <strong>{r.name}</strong>
                <small>{r.input}</small>
                <p>{r.output}</p>
              </div>
              <span>{r.durationMs} ms</span>
            </div>
          ))}
        </section>
      )}
      <section className="panel padded audit">
        <h2>Live ElevenLabs conversation simulation</h2>
        <p>
          Run the configured agent against a customs-hold scenario. The API
          response is returned as evidence; a successful API call alone is not a
          passing evaluation. This request consumes ElevenLabs credits.
        </p>
        <button
          className="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const r = await request("/agent/simulate", {});
              setInvocationId(r.id);
              setLiveResult(JSON.stringify(r, null, 2));
            } catch (e) {
              fail(e);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? (
            <LoaderCircle size={16} className="spin" />
          ) : (
            <FlaskConical size={16} />
          )}
          Run live simulation
        </button>
        {invocationId && (
          <button
            className="button"
            style={{ marginLeft: 10 }}
            onClick={() =>
              request(`/agent/test-runs/${encodeURIComponent(invocationId)}`)
                .then((r) => setLiveResult(JSON.stringify(r, null, 2)))
                .catch(fail)
            }
          >
            Refresh test results
          </button>
        )}
        {liveResult && (
          <>
            <pre className="result">{liveResult}</pre>
            <button
              className="button"
              onClick={() =>
                exportJson(
                  JSON.parse(liveResult),
                  "harborvoice-live-simulation.json",
                )
              }
            >
              <Download size={16} />
              Export live response
            </button>
          </>
        )}
      </section>
    </>
  );
}
function Conversations({
  state,
  refresh,
  fail,
}: {
  state: State;
  refresh: () => Promise<void>;
  fail: (e: unknown) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [id, setId] = useState("");
  const selected = state.sessions.find((s) => s.id === id) || state.sessions[0];
  return (
    <>
      <div className="metrics compact">
        <Metric
          title="Saved sessions"
          value={String(state.sessions.length)}
          detail="Actual workspace history"
          icon={<Headphones size={19} />}
        />
        <Metric
          title="Transcript messages"
          value={String(
            state.sessions.reduce((n, s) => n + s.messages.length, 0),
          )}
          detail="User and agent messages"
          icon={<AudioLines size={19} />}
        />
        <Metric
          title="Live voice sessions"
          value={String(state.sessions.filter((s) => s.mode === "live").length)}
          detail="Separate from scripted demos"
          icon={<Mic size={19} />}
        />
      </div>
      {!selected ? (
        <section className="panel empty">
          <Headphones size={34} />
          <h2>Every conversation starts somewhere.</h2>
          <p>Open Voice agents and try a shipment question.</p>
        </section>
      ) : (
        <div className="two-column">
          <section className="panel padded">
            <h2>Sessions</h2>
            {state.sessions.map((s) => (
              <button
                key={s.id}
                className={
                  "session-row " + (s.id === selected.id ? "selected" : "")
                }
                onClick={() => setId(s.id)}
              >
                <Headphones size={18} />
                <div>
                  <strong>{new Date(s.startedAt).toLocaleString()}</strong>
                  <small>
                    {s.mode === "demo" ? "Scripted demo" : "Live ElevenLabs"} ·{" "}
                    {s.language} · {s.messages.length} messages
                  </small>
                </div>
                <ChevronRight size={16} />
              </button>
            ))}
          </section>
          <section className="panel padded">
            <div className="panel-heading">
              <h2>Transcript</h2>
              <button
                className="button"
                disabled={deleting}
                onClick={async () => {
                  if (
                    !window.confirm(
                      "Delete this local transcript? This does not delete ElevenLabs provider records.",
                    )
                  )
                    return;
                  setDeleting(true);
                  try {
                    await deleteConversation(selected.id);
                    setId("");
                    await refresh();
                  } catch (e) {
                    fail(e);
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                {deleting ? "Deleting…" : "Delete local transcript"}
              </button>
              <button
                className="button"
                onClick={() =>
                  exportJson(selected, "harborvoice-transcript.json")
                }
              >
                <Download size={15} />
                Export
              </button>
            </div>
            {selected.messages.map((m, i) => (
              <div className={"message " + m.role} key={i}>
                <span>{m.role === "agent" ? "Nora" : "You"}</span>
                <p>{m.text}</p>
                {m.source && <small>{m.source}</small>}
              </div>
            ))}
          </section>
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
