import { useState, useRef, useEffect } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import {
  AudioLines,
  Mic,
  MicOff,
  Globe,
  Ship,
  BookOpen,
  Workflow,
  ShieldCheck,
  Check,
  MapPin,
  Clock,
  LoaderCircle,
  Square,
  Volume2,
  ArrowUpRight,
  Send,
} from "lucide-react";
import { config, chat, request, escalation, saveLive } from "./api";
import type { Message, Shipment } from "./domain";
const languages = [
  ["en", "English"],
  ["nl", "Nederlands"],
  ["fr", "Français"],
  ["de", "Deutsch"],
];
type Props = {
  shipment: Shipment;
  refresh: () => Promise<void>;
  fail: (e: unknown) => void;
  notify: (s: string) => void;
};
export default function VoiceAgent(props: Props) {
  return (
    <ConversationProvider>
      <VoiceAgentInner {...props} />
    </ConversationProvider>
  );
}
function VoiceAgentInner({
  shipment,
  refresh,
  fail,
  notify,
}: {
  shipment: Shipment;
  refresh: () => Promise<void>;
  fail: (e: unknown) => void;
  notify: (s: string) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]),
    [input, setInput] = useState(""),
    [language, setLanguage] = useState("en"),
    [busy, setBusy] = useState(false),
    [live, setLive] = useState(false),
    [muted, setMuted] = useState(false),
    [transcriptMode, setTranscriptMode] = useState<"demo" | "live">("demo");
  const sessionId = useRef(crypto.randomUUID());
  const transcript = useRef<Message[]>([]);
  const liveStart = useRef("");
  const liveSessionId = useRef(crypto.randomUUID());
  const liveLanguage = useRef("en");
  const persistLive = () => {
    if (!transcript.current.length || !liveStart.current) return;
    const snapshot = {
      id: liveSessionId.current,
      mode: "live" as const,
      startedAt: liveStart.current,
      messages: [...transcript.current],
      language: liveLanguage.current,
    };
    transcript.current = [];
    void saveLive(snapshot).then(refresh).catch(fail);
  };
  useEffect(() => () => persistLive(), []);
  const conversation = useConversation({
    onMessage: (message) => {
      const m: Message = {
        role: message.source === "user" ? "user" : "agent",
        text: message.message,
      };
      transcript.current.push(m);
      setMessages([...transcript.current]);
    },
    onConnect: () => {
      setLive(true);
      setBusy(false);
      setMuted(false);
      notify("Live voice session connected. Microphone is active.");
    },
    onError: (message) => {
      setLive(false);
      setBusy(false);
      fail(message);
    },
    onDisconnect: () => {
      setLive(false);
      setBusy(false);
      persistLive();
      sessionId.current = crypto.randomUUID();
    },
  });
  const connected = conversation.status === "connected";
  const connecting = conversation.status === "connecting";
  const send = async (text = input) => {
    if (!text.trim() || busy || connecting) return;
    setBusy(true);
    setInput("");
    try {
      if (connected) {
        conversation.sendUserMessage(text);
        return;
      }
      const { reply } = await chat(text, language, sessionId.current);
      if (transcriptMode === "live") {
        setMessages([]);
        setTranscriptMode("demo");
      }
      setMessages((m) => [...m, { role: "user", text }, reply]);
      await refresh();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };
  const start = async () => {
    setBusy(true);
    try {
      if (!config.agentReady)
        throw new Error(
          "Set ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID in .env, restart the server, then reload. The text demo is ready below.",
        );
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      media.getTracks().forEach((t) => t.stop());
      const { signedUrl } = await request("/agent/session", {});
      transcript.current = [];
      setMessages([]);
      setTranscriptMode("live");
      liveSessionId.current = crypto.randomUUID();
      liveLanguage.current = language;
      liveStart.current = new Date().toISOString();
      await conversation.startSession({
        signedUrl,
        connectionType: "websocket",
        overrides: { agent: { language: language as "en" } },
        clientTools: {
          lookup_shipment: async ({ reference }: { reference: string }) =>
            JSON.stringify(await request("/tools/lookup", { reference })),
          request_escalation: async ({
            reference,
            reason,
          }: {
            reference: string;
            reason: string;
          }) => {
            const ticket = await escalation(reference, reason);
            await refresh();
            return JSON.stringify(ticket);
          },
        },
      });
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="two-column">
      <section className="panel voice-panel">
        <div className="panel-heading">
          <div>
            <h2>
              Nora <span className="status">Terminal assistant</span>
            </h2>
            <p>
              {live
                ? "Live ElevenLabs session"
                : transcriptMode === "live"
                  ? "Ended ElevenLabs session · saved transcript"
                  : "Scripted text demo · no AI or audio generated"}
            </p>
          </div>
          <select
            aria-label="Conversation language"
            value={language}
            disabled={connected || busy || connecting}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {languages.map(([v, l]) => (
              <option value={v} key={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className={"conversation-orb " + (connected ? "connected" : "")}>
          <div className="voice-orb">
            <div className="orb-core">
              <AudioLines size={58} />
            </div>
            <span className="orbit o1" />
            <span className="orbit o2" />
          </div>
          <h3>
            {connected
              ? conversation.isSpeaking
                ? "Nora is speaking…"
                : "Listening to you…"
              : "Good conversations move things."}
          </h3>
          <p>
            {connected
              ? "You are speaking with an AI assistant."
              : "Start with a shipment reference. Nora takes it from there."}
          </p>
          <div className="voice-controls">
            <button
              className="button primary"
              disabled={busy || connecting}
              onClick={connected ? () => conversation.endSession() : start}
            >
              {busy ? (
                <LoaderCircle size={16} className="spin" />
              ) : connected ? (
                <Square size={15} />
              ) : (
                <Mic size={16} />
              )}{" "}
              {connected
                ? "End voice session"
                : connecting
                  ? "Connecting…"
                  : "Start live voice"}
            </button>
            {connected && (
              <button
                className="button"
                aria-pressed={conversation.isMuted}
                onClick={() => conversation.setMuted(!conversation.isMuted)}
              >
                {conversation.isMuted ? (
                  <MicOff size={16} />
                ) : (
                  <Mic size={16} />
                )}{" "}
                {conversation.isMuted ? "Unmute microphone" : "Mute microphone"}
              </button>
            )}
            {connected && (
              <button
                className="button"
                onClick={() => {
                  conversation.setVolume({ volume: muted ? 1 : 0 });
                  setMuted(!muted);
                }}
              >
                <Volume2 size={16} />
                {muted ? "Unmute Nora" : "Mute Nora"}
              </button>
            )}
          </div>
        </div>
        <div className="quick-prompts">
          {[
            `Where is ${shipment.id}?`,
            "What are the gate opening hours?",
            `Escalate ${shipment.id} to an operator`,
          ].map((p) => (
            <button
              key={p}
              disabled={busy || connecting}
              onClick={() => send(p)}
            >
              {p}
              <ArrowUpRight size={13} />
            </button>
          ))}
        </div>
        <div className="transcript" aria-live="polite">
          {messages.length === 0 ? (
            <div className="empty">
              <AudioLines size={24} />
              <p>Your transcript will appear here.</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={"message " + m.role}>
                <span>{m.role === "agent" ? "Nora" : "You"}</span>
                <p>{m.text}</p>
                {m.source && (
                  <small>
                    <BookOpen size={11} />
                    {m.source}
                  </small>
                )}
              </div>
            ))
          )}
        </div>
        <form
          className="chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            aria-label="Message Nora"
            placeholder={
              connected
                ? "Send a message to the live agent…"
                : "Try the scripted text demo…"
            }
            value={input}
            maxLength={2000}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            aria-label="Send message"
            disabled={busy || connecting || !input.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </section>
      <div className="stack">
        <section className="panel padded">
          <h2>Agent capabilities</h2>
          <ul className="capability-list">
            {[
              [Globe, "Four languages", "English, Dutch, French & German"],
              [Ship, "Shipment lookups", "Exact references, grounded answers"],
              [
                BookOpen,
                "Knowledge retrieval",
                "Terminal procedures & policies",
              ],
              [Workflow, "Human handoff", "Escalation with operator review"],
              [
                ShieldCheck,
                "Clear boundaries",
                "No cargo release or customs changes",
              ],
            ].map(([Icon, title, sub]) => {
              const I = Icon as typeof Globe;
              return (
                <li key={title as string}>
                  <I size={19} />
                  <div>
                    <strong>{title as string}</strong>
                    <small>{sub as string}</small>
                  </div>
                  <Check size={15} />
                </li>
              );
            })}
          </ul>
        </section>
        <section className="panel padded">
          <h2>Shipment context</h2>
          <h3 className="shipment-title">{shipment.id}</h3>
          <p>{shipment.customer}</p>
          <div className="info-line">
            <MapPin size={15} />
            {shipment.terminal}
          </div>
          <div className="info-line">
            <Clock size={15} />
            {shipment.eta}
          </div>
          <span className="status amber">{shipment.status}</span>
        </section>
      </div>
    </div>
  );
}
