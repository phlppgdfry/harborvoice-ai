import { useState } from "react";
import {
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  LoaderCircle,
  LogIn,
  LogOut,
  ArrowUpRight,
} from "lucide-react";
import { config, request } from "./api";
import { LIVE_APP_URL } from "./deployment";
export default function ConnectionSettings({
  notify,
}: {
  notify: (s: string) => void;
}) {
  const [code, setCode] = useState(""),
    [remember, setRemember] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const [readiness, setReadiness] = useState<{
    ready: boolean;
    database?: { status: string };
    provider?: { status: string };
    agent?: { status: string };
  } | null>(null);
  const preview = config.deployment === "static";
  const locked = !!config.operatorRequired && !config.operatorAuthenticated;
  const ready = readiness?.ready === true;
  const rows = [
    [
      "Backend",
      preview
        ? "Portfolio preview · no server"
        : config.backend
          ? config.deployment === "hosted"
            ? "Connected · hosted API"
            : "Connected · local API"
          : "Backend not reachable",
    ],
    [
      "ElevenLabs API",
      preview
        ? "Use the live workspace"
        : config.configured
          ? readiness?.provider?.status === "authenticated"
            ? "Authenticated · provider verified"
            : "Configured · verification needed"
          : "Server configuration unavailable",
    ],
    [
      "Voice agent",
      preview
        ? "Use the live workspace"
        : config.agentReady
          ? readiness?.agent?.status === "available"
            ? "Available · provider verified"
            : "Configured · availability not verified"
          : "Agent configuration unavailable",
    ],
    [
      "Database",
      config.workspaceStorage === "postgres"
        ? readiness?.database?.status === "reachable"
          ? "Connected · PostgreSQL"
          : "PostgreSQL · verification needed"
        : config.workspaceStorage === "sqlite"
          ? "Local SQLite"
          : "No server persistence",
    ],
    [
      "Demo adapter",
      config.demoEnabled === false
        ? "Disabled · production mode"
        : "Explicit demo enabled",
    ],
    [
      "Workspace data",
      config.workspaceStorage === "browser"
        ? "Saved in this browser"
        : config.workspaceStorage === "postgres"
          ? "Persistent server database"
          : "Saved on the local server",
    ],
    [
      "Operator access",
      config.operatorRequired
        ? config.operatorAuthenticated
          ? "Signed in"
          : "Sign-in required"
        : "Local workspace · no access code required",
    ],
  ];
  return (
    <div className="two-column">
      <section className="panel padded">
        <div className="studio-title">
          <h2>Connection status</h2>
          <span className="soft-tag">
            {preview ? "Preview" : ready ? "Live ready" : "Connection needed"}
          </span>
        </div>
        {rows.map(([label, value]) => (
          <div className="settings-row" key={label}>
            <strong>{label}</strong>
            <span>{value}</span>
          </div>
        ))}
        {preview ? (
          <div className="connection-callout">
            <ArrowUpRight size={20} />
            <div>
              <strong>
                Your live ElevenLabs workspace is hosted separately
              </strong>
              <p>
                This GitHub Pages preview cannot run an API server or read your
                private account key. Open the live workspace to use Nora and the
                audio studio.
              </p>
              <a className="button primary" href={`${LIVE_APP_URL}/#settings`}>
                Open live workspace
                <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        ) : (
          <div className="ticket-actions">
            <button className="button" onClick={() => window.location.reload()}>
              <RefreshCw size={15} />
              Refresh connection
            </button>
            <button
              className="button"
              disabled={!config.configured || locked || busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const r = await request("/readiness");
                  setReadiness(r);
                  setMessage(
                    r.ready
                      ? "Database and authenticated agent verified. No conversation was started."
                      : "Readiness checks failed.",
                  );
                } catch (e) {
                  setMessage((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? (
                <LoaderCircle size={15} className="spin" />
              ) : (
                <ShieldCheck size={15} />
              )}
              Verify ElevenLabs connection
            </button>
          </div>
        )}
        {config.backend && config.workspaceStorage !== "browser" && !locked && (
          <label className="field">
            Import client-reported conversation JSON (merges records; preserves
            source)
            <input
              type="file"
              accept="application/json,.json"
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setBusy(true);
                try {
                  if (file.size > 90000)
                    throw new Error("Import file must be smaller than 90 KB.");
                  const data = JSON.parse(await file.text());
                  const r = await request("/import/conversations", {
                    sessions: Array.isArray(data.sessions)
                      ? data.sessions
                      : [data],
                  });
                  setMessage(
                    `${r.imported} conversation records imported. Original browser/file data was retained.`,
                  );
                } catch (error) {
                  setMessage((error as Error).message);
                } finally {
                  setBusy(false);
                  e.target.value = "";
                }
              }}
            />
          </label>
        )}
        {message && <p role="status">{message}</p>}
      </section>
      <section className="panel padded">
        {preview ? (
          <>
            <h2>A preview is ready to explore.</h2>
            <p>
              The shipment desk, scripted text assistant, review workflow and
              evaluations work here. Live voice and audio run in the operator
              workspace.
            </p>
            <a className="button primary" href={LIVE_APP_URL}>
              Go to live HarborVoice
              <ArrowUpRight size={15} />
            </a>
          </>
        ) : config.operatorRequired ? (
          <>
            <h2>
              {locked ? "Sign in to the live workspace" : "Operator session"}
            </h2>
            <p>
              {locked
                ? "Enter your private operator access code. It unlocks live ElevenLabs requests without exposing the API key."
                : "Your operator session is active. The API key remains on the server."}
            </p>
            {locked ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  setMessage("");
                  try {
                    await request("/auth/session", { code, remember });
                    sessionStorage.removeItem("hv-operator-token");
                    setCode("");
                    notify("Signed in to the live workspace.");
                    window.location.reload();
                  } catch (error) {
                    setMessage((error as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <label className="field">
                  Operator access code
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    maxLength={300}
                  />
                </label>
                <label className="remember-choice">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Keep me signed in for 30 days on this device
                </label>
                <button
                  className="button primary"
                  disabled={busy || !code.trim()}
                >
                  {busy ? (
                    <LoaderCircle size={16} className="spin" />
                  ) : (
                    <LogIn size={16} />
                  )}
                  Sign in
                </button>
                <p>
                  Your session uses a secure HttpOnly cookie. Your access code
                  is not stored in browser storage.
                </p>
              </form>
            ) : (
              <>
                <div className="info-line">
                  <CheckCircle2 size={18} />
                  Live features unlocked for this browser
                </div>
                <button
                  className="button"
                  onClick={async () => {
                    await fetch("/api/auth/session", { method: "DELETE" });
                    sessionStorage.removeItem("hv-operator-token");
                    window.location.reload();
                  }}
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </>
            )}
          </>
        ) : ready ? (
          <>
            <h2>ElevenLabs is connected.</h2>
            <div className="info-line">
              <CheckCircle2 size={19} />
              Nora and the audio studio are available
            </div>
            <p>
              Your local server loads the private account key and the configured
              agent. No additional key needs to be entered in the browser.
            </p>
            <a className="button primary" href="#voice-agents">
              Open Nora
              <ArrowUpRight size={15} />
            </a>
          </>
        ) : (
          <>
            <h2>Restore the local connection</h2>
            <p>
              {config.backend
                ? "The API is reachable, but its server-side ElevenLabs configuration is incomplete."
                : "Start the local API and refresh this page. If you are using the public preview, open the live workspace instead."}
            </p>
            <pre className="result">{`npm run dev\n# After official ElevenLabs onboarding:\nnpm run agent:provision\nnpm run verify:live`}</pre>
            <a className="button" href={LIVE_APP_URL}>
              Open live workspace
              <ArrowUpRight size={15} />
            </a>
          </>
        )}
      </section>
    </div>
  );
}
