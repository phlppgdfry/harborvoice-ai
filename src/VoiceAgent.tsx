import libsampleratePath from "@alexanderolsen/libsamplerate-js/dist/libsamplerate.worklet.js?url&no-inline";
import rawAudioProcessor from "@elevenlabs/client/worklets/rawAudioProcessor.js?url&no-inline";
import audioConcatProcessor from "@elevenlabs/client/worklets/audioConcatProcessor.js?url&no-inline";
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
import { config, init, chat, request, escalation, saveLive } from "./api";
import { LIVE_APP_URL } from "./deployment";
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
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    if (config.production && config.operatorAuthenticated)
      void request<{ agents: { id: string; name: string }[] }>("/agents")
        .then((r) => setAgents(r.agents))
        .catch(fail);
  }, []);
  const cancelled = useRef(false);
  const sessionId = useRef(crypto.randomUUID());
  const transcript = useRef<Message[]>([]);
  const liveStart = useRef("");
  const providerConversationId = useRef<string | undefined>(undefined);
  const liveSessionId = useRef(crypto.randomUUID());
  const liveLanguage = useRef("en");
  const persistLive = async () => {
    if (!liveStart.current) return;
    const snapshot = {
      id: liveSessionId.current,
      mode: "live" as const,
      startedAt: liveStart.current,
      endedAt: new Date().toISOString(),
      durationSeconds: Math.max(
        0,
        Math.floor((Date.now() - Date.parse(liveStart.current)) / 1000),
      ),
      providerConversationId: providerConversationId.current,
      messages: [...transcript.current],
      language: liveLanguage.current,
    };
    await saveLive(snapshot);
    if (
      liveSessionId.current === snapshot.id &&
      transcript.current.length === snapshot.messages.length
    ) {
      transcript.current = [];
      liveStart.current = "";
    }
    await refresh();
  };
  useEffect(
    () => () => {
      cancelled.current = true;
      void persistLive().catch(fail);
    },
    [],
  );
  const conversation = useConversation({
    onMessage: (message) => {
      const m: Message = {
        role: message.source === "user" ? "user" : "agent",
        text: message.message,
      };
      transcript.current.push(m);
      setMessages([...transcript.current]);
    },
    onConnect: ({ conversationId }) => {
      if (cancelled.current) {
        void conversation.endSession();
        return;
      }
      liveStart.current = new Date().toISOString();
      providerConversationId.current = conversationId;
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
      void persistLive().catch(fail);
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
  const guestSession = useRef(false);
  const start = async (visitor = false) => {
    setBusy(true);
    cancelled.current = false;
    try {
      await persistLive();
      await init();
      if (!config.agentReady)
        throw new Error(
          config.deployment === "static"
            ? "Open the live workspace to start a voice session. This portfolio preview has no API server."
            : "The live API is not ready. Open Settings and refresh the connection.",
        );
      if (visitor && !config.guestVoice?.enabled)
        throw new Error(
          "The visitor trial is not available. Try the public audio examples.",
        );
      if (!visitor && config.operatorRequired && !config.operatorAuthenticated)
        throw new Error(
          "Sign in with your operator access code in Settings to start live voice.",
        );
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error(
          "Microphone access requires HTTPS or localhost and a supported browser.",
        );
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      media.getTracks().forEach((t) => t.stop());
      if (cancelled.current) return;
      const { signedUrl } = await request(
        visitor ? "/guest/session" : "/agent/session",
        {},
      );
      if (cancelled.current) return;
      guestSession.current = visitor;
      transcript.current = [];
      setMessages([]);
      setTranscriptMode("live");
      liveSessionId.current = crypto.randomUUID();
      liveLanguage.current = language;
      liveStart.current = "";
      providerConversationId.current = undefined;
      await conversation.startSession({
        signedUrl,
        connectionType: "websocket",
        workletPaths: { rawAudioProcessor, audioConcatProcessor },
        libsampleratePath,
        overrides: { agent: { language: language as "en" } },
        clientTools: {
          lookup_shipment: async ({ reference }: { reference: string }) =>
            JSON.stringify(
              await request(
                guestSession.current ? "/guest/lookup" : "/tools/lookup",
                { reference },
              ),
            ),
          request_escalation: async ({
            reference,
            reason,
          }: {
            reference: string;
            reason: string;
          }) => {
            if (guestSession.current)
              return JSON.stringify({
                error:
                  "Visitor conversations are read-only. No escalation was created.",
              });
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
                : transcriptMode === "live" && messages.length > 0
                  ? "Live transcript · check Conversations for saved history"
                  : config.production
                    ? "Live voice · start a session to talk to Nora"
                    : "Scripted text demo · no AI or audio generated"}
            </p>
          </div>
          {config.production && (
            <label className="field">
              Server-approved agent
              <select
                aria-label="Voice agent"
                disabled={connected || busy || !agents.length}
              >
                {agents.length ? (
                  agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))
                ) : (
                  <option>Loading configured agent…</option>
                )}
              </select>
            </label>
          )}
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
        {!config.agentReady && (
          <div className="voice-access">
            <strong>
              {config.deployment === "static"
                ? "Live voice runs in your operator workspace"
                : "Live voice needs an available API connection"}
            </strong>
            <p>
              {config.deployment === "static"
                ? "This portfolio preview supports the scripted text demo below."
                : "Open connection settings to refresh the server status."}
            </p>
            {config.deployment === "static" ? (
              <a
                className="button primary"
                href={`${LIVE_APP_URL}/#voice-agents`}
              >
                Open live Nora
                <ArrowUpRight size={14} />
              </a>
            ) : (
              <a className="button" href="#settings">
                Open connection settings
              </a>
            )}
          </div>
        )}
        {config.agentReady &&
          config.operatorRequired &&
          !config.operatorAuthenticated && (
            <div className="voice-access">
              <div>
                <strong>
                  {config.guestVoice?.enabled
                    ? "Try Nora without an access code."
                    : "Nora is ready. Operator sign-in unlocks private live features."}
                </strong>
                <p>
                  {config.guestVoice?.enabled
                    ? `Visitor trial: ${config.guestVoice.maxDurationSeconds} seconds, ${config.guestVoice.dailyLimit} conversations per day shared by all visitors. Read-only fictional data. Trial ends ${new Date(config.guestVoice.expiresAt!).toLocaleString()}. Your microphone audio is processed by ElevenLabs.`
                    : "The public examples and scripted text demo remain available without signing in."}
                </p>
                {config.guestVoice?.enabled && (
                  <button
                    className="button primary"
                    disabled={busy || connecting || connected}
                    onClick={() => start(true)}
                  >
                    <Mic size={15} />
                    Try visitor voice
                  </button>
                )}
                <a className="button" href="#experience-lab">
                  Listen to public examples
                </a>
              </div>
              <a className="button primary" href="#settings">
                Operator sign-in
                <ArrowUpRight size={14} />
              </a>
            </div>
          )}
        <p className="voice-access">
          Starting live voice sends microphone audio to ElevenLabs. Transcripts
          are stored in this private workspace; do not share sensitive
          information. You can stop or mute at any time.
        </p>
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
              disabled={
                busy ||
                connecting ||
                !config.agentReady ||
                (!connected &&
                  !!config.operatorRequired &&
                  !config.operatorAuthenticated)
              }
              onClick={
                connected
                  ? () => {
                      cancelled.current = true;
                      void conversation.endSession();
                    }
                  : () => start()
              }
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
        {(busy || connecting) && (
          <button
            className="button"
            onClick={() => {
              cancelled.current = true;
              try {
                conversation.endSession();
              } catch (error) {
                fail(error);
              }
              notify(
                "Connection cancelled. Close any pending browser microphone prompt.",
              );
            }}
          >
            Cancel connection
          </button>
        )}
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
                : config.production
                  ? "Start live voice before sending a message"
                  : "Try the scripted text demo…"
            }
            value={input}
            maxLength={2000}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            aria-label="Send message"
            disabled={
              busy ||
              connecting ||
              !input.trim() ||
              (!!config.production && !connected)
            }
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
              [
                Workflow,
                config.operatorRequired && !config.operatorAuthenticated
                  ? "Read-only visitor access"
                  : "Human review proposals",
                config.operatorRequired && !config.operatorAuthenticated
                  ? "No escalation or external actions"
                  : "Escalation with operator review",
              ],
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
