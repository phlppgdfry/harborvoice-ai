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
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed.shipments) &&
      Array.isArray(parsed.sessions) &&
      Array.isArray(parsed.tickets) &&
      Array.isArray(parsed.audit)
    )
      memory = parsed;
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
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}
export async function init() {
  try {
    config = { ...(await request("/status")), backend: true };
  } catch {
    config = {
      mode: "demo",
      configured: false,
      agentReady: false,
      backend: false,
    };
  }
  return config;
}
function save() {
  try {
    localStorage.setItem("harborvoice-state-v1", JSON.stringify(memory));
  } catch {
    /* In-memory demo still works. */
  }
}
export async function getState(): Promise<State> {
  return config.backend ? request("/state") : structuredClone(memory);
}
export async function chat(text: string, language: string, sessionId: string) {
  if (config.backend)
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
  if (config.backend) return request("/escalations", { shipmentId, reason });
  const t = proposeEscalation(memory, shipmentId, reason);
  save();
  return t;
}
export async function review(id: string, decision: "Approved" | "Rejected") {
  if (config.backend) return request("/escalations/review", { id, decision });
  const t = decideTicket(memory, id, decision);
  save();
  return t;
}
export async function saveLive(session: Session) {
  if (config.backend) return request("/sessions", session);
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
