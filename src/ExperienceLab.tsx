import { useState, useEffect, useRef } from "react";
import {
  AudioLines,
  ArrowUpRight,
  Mic,
  Download,
  Play,
  CheckCircle2,
} from "lucide-react";
import catalog from "../public/experience/catalog.json";
import evidence from "../docs/audio-live-evidence.json";
import { config } from "./api";
type Clip = {
  id: string;
  category: string;
  model: string;
  file: string;
  durationSeconds: number;
  take?: number;
};
const operations: {
  name: string;
  status: string;
  file?: string;
  model?: string;
  durationSeconds?: number;
}[] = evidence.operations;
const extras: Clip[] = operations
  .filter(
    (item) =>
      item.name !== "guest-question" &&
      item.status === "passed" &&
      item.file?.endsWith(".mp3"),
  )
  .map((item) => ({
    id: item.name,
    category: item.name === "effects-v3" ? "Sound effects" : "Transformations",
    model: item.model || item.name,
    file: item.file!,
    durationSeconds: item.durationSeconds || 0,
  }));
const clips: Clip[] = [
  ...catalog.assets,
  ...extras,
  ...(extras.some((item) => item.id === "isolate")
    ? [
        {
          id: "isolate-before",
          category: "Transformations",
          model: "Synthetic noise added locally",
          file: "experience/isolate-before.mp3",
          durationSeconds: 14.8,
        },
      ]
    : []),
];
const groups = ["Voiceover", "Music", "Sound effects", "Transformations"];
const titles: Record<string, string> = {
  eleven_v4: "Nora introduces HarborVoice",
  eleven_music_v2_5: "A calm terminal soundtrack",
  eleven_text_to_sound_v2: "A gentle review notification",
  "effects-v3": "The notification, with SFX v3",
  change: "A different voice, same message",
  isolate: "Voice recovered from synthetic noise",
  "isolate-before": "Before isolation: voice plus noise",
  dubbing: "The introduction in Dutch",
  "dubbing-oauth": "The introduction in Dutch",
};
const url = (file: string) => import.meta.env.BASE_URL + file;
export default function ExperienceLab() {
  const [group, setGroup] = useState("Voiceover"),
    [selected, setSelected] = useState(clips[0]),
    [transcript, setTranscript] = useState(""),
    [duration, setDuration] = useState(0);
  const player = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(url("experience/transcribe.json"), { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setTranscript(data?.text || ""))
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const choose = (clip: Clip) => {
    player.current?.pause();
    setSelected(clip);
    setDuration(0);
  };
  const changeGroup = (value: string) => {
    setGroup(value);
    const first = clips.find((clip) => clip.category === value);
    if (first) choose(first);
  };
  return (
    <div className="experience-lab">
      <section className="listening-desk">
        <div className="listening-intro">
          <div className="listening-icon">
            <AudioLines size={38} />
          </div>
          <h2>Hear what HarborVoice can do.</h2>
          <p>
            Real ElevenLabs audio from a fictional terminal. Listen freely,
            compare the takes, then try a short conversation with Nora.
          </p>
          <div className="listening-links">
            <a className="button primary" href="#voice-agents">
              <Mic size={16} />
              {config.guestVoice?.enabled
                ? "Try visitor voice"
                : "Open the voice demo"}
            </a>
            <a
              className="button"
              href={catalog.flowUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open ElevenCreative flow
              <ArrowUpRight size={14} />
            </a>
          </div>
          <small>
            Playback is public and uses no additional generation credits.
            Editing the flow requires access to its ElevenLabs workspace.
          </small>
        </div>
        <div className="listening-player">
          <span className="soft-tag">{selected.category}</span>
          <h3>
            {titles[selected.id] || titles[selected.model] || selected.model}
          </h3>
          <p>
            {selected.model}
            {selected.take ? ` · Take ${selected.take}` : ""}
          </p>
          <audio
            ref={player}
            key={selected.id}
            controls
            preload="metadata"
            src={url(selected.file)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            aria-label="Selected demo audio"
          />
          <div className="player-details">
            <span>
              {Number.isFinite(duration) && duration > 0
                ? duration.toFixed(1)
                : selected.durationSeconds.toFixed(1)}{" "}
              seconds
            </span>
            <a href={url(selected.file)} download>
              <Download size={15} />
              Download audio example
            </a>
          </div>
          <p className="recording-note">
            A generated recording, rather than a live agent response.
          </p>
        </div>
      </section>
      <section className="panel padded">
        <div className="studio-title">
          <h2>Compare the results</h2>
          <span className="soft-tag">{clips.length} real audio examples</span>
        </div>
        <div
          className="experience-tabs"
          role="tablist"
          aria-label="Audio examples"
        >
          {groups.map((value) => (
            <button
              key={value}
              role="tab"
              aria-selected={group === value}
              onClick={() => changeGroup(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <div
          className="take-list"
          role="tabpanel"
          aria-label={`${group} examples`}
        >
          {clips
            .filter((clip) => clip.category === group)
            .map((clip) => (
              <button
                key={clip.id}
                className={selected.id === clip.id ? "take selected" : "take"}
                aria-pressed={selected.id === clip.id}
                onClick={() => choose(clip)}
              >
                <Play size={17} />
                <span>
                  <strong>
                    {titles[clip.id] || titles[clip.model] || clip.model}
                  </strong>
                  <small>
                    {clip.model}
                    {clip.take ? ` · Take ${clip.take}` : ""}
                  </small>
                </span>
                <span>{clip.durationSeconds.toFixed(1)}s</span>
              </button>
            ))}
        </div>
      </section>
      <div className="two-column">
        <section className="panel padded">
          <div className="studio-title">
            <h2>What Scribe heard</h2>
            <CheckCircle2 size={18} />
          </div>
          <p>
            The real transcription of the English voiceover, produced through
            ElevenAPI.
          </p>
          <blockquote className="heard-transcript">
            {transcript || "Open the transcript file to inspect the result."}
          </blockquote>
          <a
            className="button"
            href={url("experience/transcribe.json")}
            download
          >
            <Download size={15} />
            Download transcript and word timings
          </a>
          <a className="button" href={url("experience/align.json")} download>
            Inspect forced alignment
          </a>
        </section>
        <section className="panel padded">
          <h2>Three parts of one project</h2>
          <div className="settings-row">
            <strong>ElevenCreative</strong>
            <span>Editable flow and real audio takes</span>
          </div>
          <div className="settings-row">
            <strong>ElevenAgents</strong>
            <span>Nora, knowledge and bounded evaluations</span>
          </div>
          <div className="settings-row">
            <strong>ElevenAPI</strong>
            <span>Typed integrations and recorded outputs</span>
          </div>
          <p>
            Voice design, voice cloning, image/video generation, audiobooks,
            telephone numbers and every Studio feature are not covered by this
            workbench. This page shows the operations actually exercised.
          </p>
          <a className="button" href="#portfolio-evidence">
            Inspect project evidence
            <ArrowUpRight size={14} />
          </a>
        </section>
      </div>
    </div>
  );
}
