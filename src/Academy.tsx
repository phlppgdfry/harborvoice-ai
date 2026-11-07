import { useState } from "react";
import {
  BookOpen,
  Download,
  CheckCircle2,
  ArrowUpRight,
  Headphones,
} from "lucide-react";
import catalog from "../public/academy/catalog.json";
import creative from "../docs/academy-creative-evidence.json";
import native from "../docs/academy-native-evidence.json";
import books from "../public/academy/books.json";
import pronunciation from "../docs/academy-pronunciation-evidence.json";
import { exportJson } from "./api";
import type { Course, Lesson } from "../agent/academy-content";
type Audio = { status: string; file?: string; durationSeconds?: number };
type TrainingCourse = Omit<Course, "lessons"> & {
  lessons: (Lesson & { audio: Audio })[];
};
const courses = catalog.courses as TrainingCourse[];
const lessons = new Map<string, Lesson & { audio: Audio }>(
  courses.flatMap((c) =>
    c.lessons.map((l) => [`${c.language}-${l.id}`, l] as const),
  ),
);
type Attempt = {
  choice: number;
  passed: boolean;
  attempts: number;
  attemptedAt: string;
};
type Progress = Record<string, Attempt>;
const storageKey = "harborvoice-academy-v1";
function restore(): Progress {
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    const progress: Progress = {};
    for (const [key, value] of Object.entries(raw)) {
      const l = lessons.get(key),
        a = value as Attempt;
      if (
        l &&
        a &&
        Number.isInteger(a.choice) &&
        a.choice >= 0 &&
        a.choice < l.choices.length &&
        typeof a.attemptedAt === "string" &&
        Number.isInteger(a.attempts) &&
        a.attempts > 0
      )
        progress[key] = { ...a, passed: a.choice === l.answer };
    }
    return progress;
  } catch {
    return {};
  }
}
const asset = (path: string) => import.meta.env.BASE_URL + path;
const time = (seconds = 0) =>
  `${Math.floor(Math.round(seconds) / 60)}:${(Math.round(seconds) % 60)
    .toString()
    .padStart(2, "0")}`;
function singlePlayback(event: React.SyntheticEvent<HTMLAudioElement>) {
  document.querySelectorAll("audio").forEach((audio) => {
    if (audio !== event.currentTarget) audio.pause();
  });
}
export default function Academy() {
  const [language, setLanguage] = useState("en"),
    [index, setIndex] = useState(0),
    [progress, setProgress] = useState<Progress>(restore),
    [choice, setChoice] = useState<number | null>(null),
    [checked, setChecked] = useState(false);
  const course = courses.find((c) => c.language === language)!,
    lesson = course.lessons[index],
    key = `${language}-${lesson.id}`,
    attempt = progress[key];
  const completed = course.lessons.filter(
    (l) => progress[`${language}-${l.id}`]?.passed,
  ).length;
  const book = books.books.find((b) => b.language === language);
  const selectLesson = (value: number) => {
    setIndex(value);
    setChoice(null);
    setChecked(false);
  };
  const check = () => {
    if (choice === null) return;
    const next = {
      ...progress,
      [key]: {
        choice,
        passed: choice === lesson.answer,
        attempts: (attempt?.attempts || 0) + 1,
        attemptedAt: new Date().toISOString(),
      },
    };
    setProgress(next);
    setChecked(true);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* Practice still works without browser storage. */
    }
  };
  return (
    <div className="academy">
      <section className="academy-cover">
        <img
          src={asset("academy/cover-1.png")}
          alt="Illustrated fictional harbor with an operations room and the title HarborVoice Academy"
        />
        <div>
          <span className="soft-tag">Independent practice</span>
          <h2>Build trust into the conversation.</h2>
          <p>
            Three short lessons about sources, human decisions and useful
            evaluation. Listen in four languages, read the transcripts and check
            your understanding.
          </p>
          <a
            className="button"
            href={asset("academy/harborvoice-training-en.epub")}
            download
          >
            <Download size={15} />
            Download the English training book
          </a>
        </div>
      </section>
      <section className="academy-workbench">
        <aside className="panel padded academy-lessons">
          <label className="field">
            Course language
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                selectLesson(0);
              }}
            >
              {courses.map((c) => (
                <option key={c.language} value={c.language}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <h3>{course.title}</h3>
          <p>
            {completed} / {course.lessons.length} practice checks completed
          </p>
          <nav aria-label="Training lessons">
            {course.lessons.map((l, i) => (
              <button
                key={l.id}
                className={i === index ? "lesson active" : "lesson"}
                aria-current={i === index ? "step" : undefined}
                onClick={() => selectLesson(i)}
              >
                {progress[`${language}-${l.id}`]?.passed ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Headphones size={18} />
                )}
                <span>
                  <strong>{l.title}</strong>
                  <small>{time(l.audio.durationSeconds)} audio</small>
                </span>
              </button>
            ))}
          </nav>
          <button
            className="button"
            onClick={() =>
              exportJson(
                {
                  exportedAt: new Date().toISOString(),
                  scope:
                    "Self-guided local browser practice. No identity verification, proctored assessment or official certification.",
                  progress,
                },
                "harborvoice-practice-record.json",
              )
            }
          >
            <Download size={15} />
            Export practice record
          </button>
          {book && (
            <>
              <a className="button" href={asset(book.file)} download>
                <Download size={15} />
                Download all three lessons
              </a>
              <a
                className="inline-download"
                href={asset(book.bookFile)}
                download
              >
                Download chaptered M4B
              </a>
            </>
          )}
          <small className="practice-note">
            Progress stays in this browser. These checks do not award an
            ElevenLabs certificate or LinkedIn badge.
          </small>
        </aside>
        <article className="panel padded academy-lesson" key={key}>
          <div className="studio-title">
            <h2>{lesson.title}</h2>
            <span className="soft-tag">{course.label}</span>
          </div>
          {lesson.audio.status === "completed" && lesson.audio.file ? (
            <>
              <audio
                controls
                preload="metadata"
                src={asset(lesson.audio.file)}
                onPlay={singlePlayback}
                aria-label="Lesson audio"
              />
              <a
                className="inline-download"
                href={asset(lesson.audio.file)}
                download
              >
                <Download size={14} />
                Download lesson audio
              </a>
            </>
          ) : (
            <p>
              Audio is not available for this lesson. The complete text is
              below.
            </p>
          )}
          <div className="lesson-transcript" lang={language}>
            {lesson.text.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <a
            className="inline-download"
            href={asset(`academy/${key}.txt`)}
            download
          >
            <BookOpen size={14} />
            Download transcript
          </a>
          <form
            className="practice-check"
            onSubmit={(e) => {
              e.preventDefault();
              check();
            }}
          >
            <fieldset>
              <legend>{lesson.question}</legend>
              {lesson.choices.map((label, i) => (
                <label key={label}>
                  <input
                    type="radio"
                    name={key}
                    value={i}
                    checked={
                      (choice ?? (attempt?.passed ? attempt.choice : null)) ===
                      i
                    }
                    disabled={!!attempt?.passed}
                    onChange={() => {
                      setChoice(i);
                      setChecked(false);
                    }}
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            {attempt?.passed ? (
              <p className="practice-feedback" role="status">
                <CheckCircle2 size={17} />
                Practice check completed. {lesson.explanation}
              </p>
            ) : (
              <>
                <button className="button primary" disabled={choice === null}>
                  Check answer
                </button>
                {checked && (
                  <p className="practice-feedback" role="status">
                    Try again. {lesson.explanation}
                  </p>
                )}
              </>
            )}
          </form>
          {index < course.lessons.length - 1 && (
            <button
              className="button next-lesson"
              onClick={() => selectLesson(index + 1)}
            >
              Next lesson
              <ArrowUpRight size={15} />
            </button>
          )}
        </article>
      </section>
      <div className="two-column">
        <section className="panel padded">
          <h2>Hear a review conversation</h2>
          <p>
            A scripted customer/Nora dialogue with two synthetic speakers,
            generated with Eleven v3. It demonstrates the difference between a
            pending request and a completed decision.
          </p>
          <audio
            controls
            preload="metadata"
            src={asset("academy/review-dialogue.mp3")}
            onPlay={singlePlayback}
            aria-label="Training dialogue"
          />
          <a
            className="inline-download"
            href={asset("academy/review-dialogue.json")}
            download
          >
            Download dialogue script
          </a>
        </section>
        <section className="panel padded">
          <h2>A fictional harbor, on film</h2>
          <p>
            A six-second LTX 2 Fast establishing shot created through
            ElevenCreative. Illustrative AI-generated footage.
          </p>
          <video
            controls
            preload="metadata"
            poster={asset("academy/cover-1.png")}
            src={asset("academy/harbor-opening.mp4")}
            aria-label="Fictional harbor video"
          />
        </section>
      </div>
      <section className="panel padded">
        <h2>Made in ElevenLabs Audiobooks</h2>
        <p>
          The English training book was imported as an EPUB, assigned Sarah as
          its narrator, given pronunciation aliases and rendered through the
          normal Audiobooks editor. This native export is separate from the
          lesson bundles above.
        </p>
        {native.nativeAudiobook.renderCompleted && (
          <>
            <audio
              controls
              preload="metadata"
              src={asset(native.nativeAudiobook.file)}
              onPlay={singlePlayback}
              aria-label="Native Audiobooks export"
            />
            <a
              className="button"
              href={asset(native.nativeAudiobook.file)}
              download
            >
              <Download size={15} />
              Download the native Audiobooks export
            </a>
          </>
        )}
      </section>
      <section className="panel padded">
        <h2>Make terminology easier to hear</h2>
        <p>
          The same fictional shipment script, before and after pronunciation
          aliases. Compare ETA and TMS with their expanded meanings.
        </p>
        <div className="two-column">
          {pronunciation.samples.map((sample) => (
            <div key={sample.file}>
              <h3>
                {sample.aliases
                  ? "With terminology aliases"
                  : "Original abbreviations"}
              </h3>
              <audio
                controls
                preload="metadata"
                src={asset(sample.file)}
                onPlay={singlePlayback}
                aria-label={
                  sample.aliases
                    ? "Pronunciation with aliases"
                    : "Original pronunciation"
                }
              />
              <p>{sample.transcript}</p>
            </div>
          ))}
        </div>
        <small>
          Transcripts were generated by Scribe. Listen to compare the audio;
          automated transcription is not an independent quality assessment.
        </small>
      </section>
      <section className="panel padded">
        <div className="studio-title">
          <h2>Compare the new training voice</h2>
          <span className="soft-tag">Voice Design previews</span>
        </div>
        <p>
          {creative.voiceDesign.description} These are three previews of an
          original fictional voice. Existing production voices remain in use.
        </p>
        <blockquote className="heard-transcript" lang="nl">
          {creative.voiceDesign.text}
        </blockquote>
        <div className="academy-previews">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <h3>Preview {i}</h3>
              <audio
                controls
                preload="metadata"
                src={asset(`academy/voice-preview-${i}.mp3`)}
                onPlay={singlePlayback}
                aria-label={`Voice design preview ${i}`}
              />
            </div>
          ))}
        </div>
        <a
          className="button"
          href={creative.flowUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open the Academy creative flow
          <ArrowUpRight size={14} />
        </a>
      </section>
    </div>
  );
}
