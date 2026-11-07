import { useEffect, useRef, useState } from "react";
import {
  AudioLines,
  Volume2,
  FileAudio,
  Radio,
  Headphones,
  Globe,
  Mic,
  Clock,
  Play,
  LoaderCircle,
  Download,
  ShieldCheck,
  Settings,
  Check,
} from "lucide-react";
import { config, operatorHeaders, request, exportJson } from "./api";

type Tool =
  | "speech"
  | "transcribe"
  | "effects"
  | "isolate"
  | "dubbing"
  | "music"
  | "change"
  | "align";
const catalog = [
  {
    id: "speech",
    name: "Text to speech",
    icon: Volume2,
    description: "Turn a terminal update into natural, multilingual speech.",
    sample:
      "Welcome to North Sea Terminal. Your shipment is ready for collection at Gate A.",
    input: "text",
    voice: true,
    output: "Audio",
  },
  {
    id: "transcribe",
    name: "Speech to text",
    icon: FileAudio,
    description:
      "Transcribe a recording with speaker diarization using Scribe.",
    sample: "",
    input: "file",
    output: "Transcript",
  },
  {
    id: "effects",
    name: "Sound effects",
    icon: Radio,
    description:
      "Describe a five-second sound effect for an announcement or demo.",
    sample:
      "A short, gentle terminal announcement chime, two clear notes, no speech.",
    input: "text",
    output: "Audio",
  },
  {
    id: "isolate",
    name: "Voice isolation",
    icon: Headphones,
    description:
      "Separate speech from background noise in an authorised recording.",
    sample: "",
    input: "file",
    output: "Audio",
  },
  {
    id: "dubbing",
    name: "Dubbing",
    icon: Globe,
    description:
      "Translate an audio recording, follow the job, and download the original automatic dub.",
    sample: "",
    input: "file",
    output: "Dubbing job",
  },
  {
    id: "music",
    name: "Music",
    icon: Radio,
    description:
      "Compose a ten-second instrumental cue for a product demonstration.",
    sample:
      "Calm, modern ambient instrumental for a logistics dashboard. Subtle marimba, soft electronic textures, no vocals.",
    input: "text",
    output: "Audio",
  },
  {
    id: "change",
    name: "Voice changer",
    icon: Mic,
    description:
      "Keep the delivery of your recording while changing to an authorised library voice.",
    sample: "",
    input: "file",
    voice: true,
    output: "Audio",
  },
  {
    id: "align",
    name: "Forced alignment",
    icon: Clock,
    description:
      "Match an exact transcript to a recording and inspect word-level timing.",
    sample: "",
    input: "file",
    output: "Word timing",
  },
] as const;
const languages = [
  ["en", "English"],
  ["nl", "Nederlands"],
  ["fr", "Français"],
  ["de", "Deutsch"],
];
export default function AudioStudio({
  fail,
  onConfigure,
}: {
  fail: (e: unknown) => void;
  onConfigure: () => void;
}) {
  const [tool, setTool] = useState<Tool>("speech");
  const selected = catalog.find((t) => t.id === tool)!;
  return (
    <div className="two-column">
      <section className="panel padded">
        <div
          className="tool-tabs"
          role="tablist"
          aria-label="Audio tools"
          onKeyDown={(e) => {
            const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
            if (!keys.includes(e.key)) return;
            e.preventDefault();
            const index = catalog.findIndex((t) => t.id === tool);
            const next =
              e.key === "Home"
                ? 0
                : e.key === "End"
                  ? catalog.length - 1
                  : (index +
                      (e.key === "ArrowRight" ? 1 : -1) +
                      catalog.length) %
                    catalog.length;
            setTool(catalog[next].id);
            document.getElementById(`tab-${catalog[next].id}`)?.focus();
          }}
        >
          {catalog.map((t) => (
            <button
              role="tab"
              id={`tab-${t.id}`}
              aria-controls="audio-tool-panel"
              aria-selected={tool === t.id}
              tabIndex={tool === t.id ? 0 : -1}
              key={t.id}
              className={tool === t.id ? "selected" : ""}
              onClick={() => setTool(t.id)}
            >
              <t.icon size={17} />
              {t.name}
            </button>
          ))}
        </div>
        <div
          id="audio-tool-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tool}`}
        >
          <StudioForm
            key={tool}
            tool={selected}
            fail={fail}
            onConfigure={onConfigure}
          />
        </div>
      </section>
      <div className="stack">
        <section className="panel padded">
          <h2>A complete audio desk.</h2>
          <p>
            Eight focused workflows. Preview audio, download generated files and
            export structured results.
          </p>
          <div className="studio-illustration">
            <AudioLines size={78} strokeWidth={1} />
          </div>
          <div className="info-line">
            <ShieldCheck size={17} />
            API keys stay on the server
          </div>
          <div className="info-line">
            <Clock size={17} />
            Live generation uses account credits
          </div>
          <div className="studio-spec">
            <span>Selected workflow</span>
            <strong>{selected.name}</strong>
            <span>Result</span>
            <strong>{selected.output}</strong>
            <span>Input limit</span>
            <strong>
              {selected.input === "text" ? "2,000 characters" : "20 MB audio"}
            </strong>
          </div>
        </section>
        <section className="panel padded">
          <h2>Use a recording you own.</h2>
          <p>
            Choose recordings and voices you have permission to use. This
            workspace does not clone voices or place outbound calls.
          </p>
        </section>
      </div>
    </div>
  );
}
function StudioForm({
  tool,
  fail,
  onConfigure,
}: {
  tool: (typeof catalog)[number];
  fail: (e: unknown) => void;
  onConfigure: () => void;
}) {
  const [text, setText] = useState<string>(tool.sample),
    [file, setFile] = useState<File | null>(null),
    [voices, setVoices] = useState<{ voiceId: string; name: string }[]>([]),
    [voice, setVoice] = useState(""),
    [target, setTarget] = useState("nl"),
    [busy, setBusy] = useState(false),
    [audio, setAudio] = useState(""),
    [result, setResult] = useState<unknown>(),
    [jobId, setJobId] = useState(""),
    [elapsed, setElapsed] = useState(0);
  const controller = useRef<AbortController | null>(null),
    url = useRef("");
  const needsVoice = "voice" in tool && tool.voice;
  useEffect(
    () => () => {
      controller.current?.abort();
      if (url.current) URL.revokeObjectURL(url.current);
    },
    [],
  );
  useEffect(() => {
    let active = true;
    if (needsVoice && config.configured)
      request<{ voices: typeof voices }>("/voices")
        .then((d) => {
          if (active) {
            setVoices(d.voices);
            setVoice(d.voices[0]?.voiceId || "");
          }
        })
        .catch((e) => {
          if (active) fail(e);
        });
    return () => {
      active = false;
    };
  }, [needsVoice]);
  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => clearInterval(timer);
  }, [busy]);
  const valid =
    config.configured &&
    !busy &&
    (tool.input === "text" ? !!text.trim() : !!file) &&
    (!needsVoice || !!voice) &&
    (tool.id !== "align" || !!text.trim());
  const execute = async () => {
    if (!valid) return;
    setBusy(true);
    setElapsed(0);
    setResult(undefined);
    setJobId("");
    setAudio("");
    if (url.current) {
      URL.revokeObjectURL(url.current);
      url.current = "";
    }
    const control = new AbortController();
    controller.current = control;
    try {
      let body: FormData | string;
      const headers = operatorHeaders();
      if (tool.input === "file") {
        const form = new FormData();
        form.append("file", file!);
        form.append("voiceId", voice);
        form.append("targetLanguage", target);
        form.append("text", text);
        body = form;
      } else {
        body = JSON.stringify({ text, voiceId: voice });
        headers["Content-Type"] = "application/json";
      }
      const response = await fetch(`/api/audio/${tool.id}`, {
        method: "POST",
        headers,
        body,
        signal: control.signal,
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(
          payload.error || `Audio request failed (${response.status}).`,
        );
      }
      if (response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json();
        if (control.signal.aborted) return;
        setResult(data);
        if (tool.id === "dubbing") setJobId(data.dubbingId || "");
      } else {
        const blob = await response.blob();
        if (control.signal.aborted) return;
        url.current = URL.createObjectURL(blob);
        setAudio(url.current);
      }
    } catch (e) {
      if (!control.signal.aborted) fail(e);
    } finally {
      if (!control.signal.aborted) setBusy(false);
    }
  };
  return (
    <>
      <div className="studio-title">
        <h2>{tool.name}</h2>
        <span className="soft-tag">{tool.output}</span>
      </div>
      <p>{tool.description}</p>
      {!config.configured && (
        <div className="connection-callout">
          <Settings size={18} />
          <div>
            <strong>Connect ElevenLabs to generate audio</strong>
            <p>
              You can explore every workflow here. Add your server API key to
              enable generation.
            </p>
            <button className="button" onClick={onConfigure}>
              Open connection settings
            </button>
          </div>
        </div>
      )}
      {tool.input === "text" ? (
        <label className="field">
          {tool.id === "speech" ? "Your script" : "Describe the sound"}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={busy}
            maxLength={2000}
            rows={7}
          />
          <small>{text.length} / 2,000 characters</small>
        </label>
      ) : (
        <label className="upload">
          <FileAudio size={30} />
          <strong>{file?.name || "Choose an audio recording"}</strong>
          <span>MP3, WAV, M4A, OGG or WebM · up to 20 MB</span>
          <input
            aria-label="Audio recording"
            type="file"
            disabled={busy}
            accept="audio/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && f.size > 20 * 1024 * 1024) {
                e.target.value = "";
                setFile(null);
                fail(new Error("Maximum upload size is 20 MB."));
                return;
              }
              setFile(f || null);
            }}
          />
          {file && (
            <span>{(file.size / 1024 / 1024).toFixed(2)} MB selected</span>
          )}
        </label>
      )}
      {tool.id === "align" && (
        <label className="field">
          Exact transcript
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={busy}
            maxLength={2000}
            rows={4}
            placeholder="Paste exactly what is said in the recording"
          />
        </label>
      )}
      {needsVoice && (
        <label className="field">
          Voice
          <select
            disabled={busy || !voices.length}
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
          >
            <option value="">
              {config.configured
                ? "Select an available voice"
                : "Connect ElevenLabs to load voices"}
            </option>
            {voices.map((v) => (
              <option key={v.voiceId} value={v.voiceId}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {tool.id === "dubbing" && (
        <label className="field">
          Target language
          <select
            disabled={busy}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          >
            {languages.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
      )}
      <button className="button primary" disabled={!valid} onClick={execute}>
        {busy ? (
          <LoaderCircle className="spin" size={16} />
        ) : (
          <Play size={16} />
        )}{" "}
        {busy ? `Processing · ${elapsed}s` : "Generate with ElevenLabs"}
      </button>
      {busy && (
        <p role="status">
          You can switch tools to stop waiting. A provider job may continue and
          consume credits.
        </p>
      )}
      {audio && (
        <div className="audio-output">
          <div className="info-line">
            <Check size={16} />
            Audio ready
          </div>
          <audio aria-label={`${tool.name} result`} controls src={audio} />
          <a
            className="button"
            href={audio}
            download={`harborvoice-${tool.id}.mp3`}
          >
            <Download size={16} />
            Download audio
          </a>
        </div>
      )}
      {result !== undefined && (
        <>
          <pre className="result">{JSON.stringify(result, null, 2)}</pre>
          <button
            className="button"
            onClick={() => exportJson(result, `harborvoice-${tool.id}.json`)}
          >
            <Download size={16} />
            Export result
          </button>
        </>
      )}
      {tool.id === "dubbing" && (
        <DubbingJob
          key={jobId}
          initialId={jobId}
          language={target}
          fail={fail}
        />
      )}
    </>
  );
}
function DubbingJob({
  initialId,
  language,
  fail,
}: {
  initialId: string;
  language: string;
  fail: (e: unknown) => void;
}) {
  const [id, setId] = useState(initialId),
    [status, setStatus] = useState(""),
    [data, setData] = useState<unknown>(),
    [busy, setBusy] = useState(false),
    [audio, setAudio] = useState("");
  const url = useRef("");
  useEffect(
    () => () => {
      if (url.current) URL.revokeObjectURL(url.current);
    },
    [],
  );
  return (
    <div className="dubbing-status">
      <h3>Follow your dubbing job</h3>
      <label className="field">
        Dubbing job ID
        <input
          value={id}
          onChange={(e) => {
            setId(e.target.value);
            setStatus("");
            setData(undefined);
            setAudio("");
            if (url.current) URL.revokeObjectURL(url.current);
          }}
          placeholder="Paste a dubbing ID or create a job above"
        />
      </label>
      <div className="ticket-actions">
        <button
          className="button"
          disabled={!id.trim() || busy || !config.configured}
          onClick={async () => {
            setBusy(true);
            try {
              const d = await request(
                `/dubbing/${encodeURIComponent(id.trim())}`,
              );
              setData(d);
              setStatus(d.status || "unknown");
            } catch (e) {
              fail(e);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? (
            <LoaderCircle size={15} className="spin" />
          ) : (
            <Clock size={15} />
          )}
          Check job status
        </button>
        <button
          className="button"
          disabled={status !== "dubbed" || busy}
          onClick={async () => {
            setBusy(true);
            try {
              const response = await fetch(
                `/api/dubbing/${encodeURIComponent(id.trim())}/audio/${language}`,
                { headers: operatorHeaders() },
              );
              if (!response.ok) {
                const d = await response.json();
                throw new Error(d.error || "Dub download failed.");
              }
              const blob = await response.blob();
              if (url.current) URL.revokeObjectURL(url.current);
              url.current = URL.createObjectURL(blob);
              setAudio(url.current);
            } catch (e) {
              fail(e);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Download size={15} />
          Load completed dub
        </button>
      </div>
      {data !== undefined && (
        <pre className="result">{JSON.stringify(data, null, 2)}</pre>
      )}
      {audio && (
        <div className="audio-output">
          <audio aria-label="Completed dub" src={audio} controls />
          <a
            className="button"
            href={audio}
            download={`harborvoice-dub-${language}.mp3`}
          >
            <Download size={16} />
            Download dub
          </a>
        </div>
      )}
      <p>
        Downloads the original automatic audio dub in the selected target
        language. Studio edits require a separate render workflow.
      </p>
    </div>
  );
}
