import { restoreWorkspace } from "./state-schema";
import {
  initialState,
  demoReply,
  decideTicket,
  proposeEscalation,
  record,
  type State,
  type Session,
} from "./domain";
export type Config = {
  mode: "demo" | "live";
  configured: boolean;
  agentReady: boolean;
  backend: boolean;
  deployment?: "local" | "hosted" | "static" | "unavailable";
  workspaceStorage?: "sqlite" | "browser";
  uploadLimitBytes?: number;
  operatorRequired?: boolean;
  operatorAuthenticated?: boolean;
  guestVoice?: {
    enabled: boolean;
    expiresAt: string | null;
    maxDurationSeconds: number;
    dailyLimit: number;
  };
};
export let config: Config = {
  mode: "demo",
  configured: false,
  agentReady: false,
  backend: false,
};
let memory: State = structuredClone(initialState);
try {
  const raw = localStorage.getItem("harborvoice-state-v1");
  if (raw) {
    const parsed = restoreWorkspace(raw);
    if (parsed) memory = parsed;
  }
} catch {
  /* Private browser storage may be unavailable. */
}
export function operatorHeaders(): Record<string, string> {
  const token = sessionStorage.getItem("hv-operator-token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
export async function request<T = any>(
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      ...operatorHeaders(),
      ...(body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
    },
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });
  const data = await response.json().catch(() => {
    throw new Error(
      `The server returned an unreadable response (${response.status}). Check the backend connection.`,
    );
  });
  if (!response.ok)
    throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}
export async function init() {
  if (import.meta.env.VITE_STATIC_DEMO === "true") {
    config = {
      mode: "demo",
      configured: false,
      agentReady: false,
      backend: false,
      deployment: "static",
      workspaceStorage: "browser",
    };
    return config;
  }
  try {
    config = { ...(await request("/status")), backend: true };
  } catch {
    config = {
      mode: "demo",
      configured: false,
      agentReady: false,
      backend: false,
      deployment: "unavailable",
      workspaceStorage: "browser",
    };
  }
  return config;
}
function serverWorkspace() {
  return config.backend && config.workspaceStorage !== "browser";
}
function save() {
  try {
    localStorage.setItem("harborvoice-state-v1", JSON.stringify(memory));
  } catch {
    /* In-memory demo still works. */
  }
}
export async function getState(): Promise<State> {
  return serverWorkspace() ? request("/state") : structuredClone(memory);
}
export async function chat(text: string, language: string, sessionId: string) {
  if (serverWorkspace())
    return request("/demo/chat", { text, language, sessionId });
  const reply = demoReply(memory, text, language);
  let session = memory.sessions.find((s) => s.id === sessionId);
  if (!session) {
    session = {
      id: sessionId,
      mode: "demo",
      startedAt: new Date().toISOString(),
      messages: [],
      language,
    };
    memory.sessions.unshift(session);
  }
  session.messages.push({ role: "user", text }, reply);
  session.messages = session.messages.slice(-500);
  memory.sessions = memory.sessions.slice(0, 100);
  record(memory, "Demo conversation message");
  save();
  return { reply };
}
export async function escalation(shipmentId: string, reason: string) {
  if (serverWorkspace()) return request("/escalations", { shipmentId, reason });
  const t = proposeEscalation(memory, shipmentId, reason);
  save();
  return t;
}
export async function review(id: string, decision: "Approved" | "Rejected") {
  if (serverWorkspace())
    return request("/escalations/review", { id, decision });
  const t = decideTicket(memory, id, decision);
  save();
  return t;
}
export async function saveLive(session: Session) {
  if (serverWorkspace()) return request("/sessions", session);
  if (!memory.sessions.some((s) => s.id === session.id))
    memory.sessions.unshift(session);
  memory.sessions = memory.sessions.slice(0, 100);
  record(memory, "Live transcript saved in browser (client reported)");
  save();
}
export function exportJson(data: unknown, name: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
