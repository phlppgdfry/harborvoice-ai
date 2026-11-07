import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
const catalog = JSON.parse(
  readFileSync("public/academy/catalog.json", "utf8"),
) as {
  courses: {
    language: string;
    title: string;
    lessons: {
      title: string;
      audio: { file: string; durationSeconds: number; status: string };
    }[];
  }[];
};
const books = [];
for (const course of catalog.courses) {
  if (course.lessons.some((l) => l.audio.status !== "completed")) continue;
  const list = `var/academy-${course.language}-concat.txt`;
  writeFileSync(
    list,
    course.lessons
      .map((l) => `file '${resolve("public", l.audio.file)}'`)
      .join("\n") + "\n",
  );
  const file = `academy/course-${course.language}.mp3`;
  execFileSync("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    list,
    "-af",
    "asetpts=N/SR/TB",
    "-c:a",
    "libmp3lame",
    "-b:a",
    "128k",
    `public/${file}`,
  ]);
  const escape = (text: string) => text.replace(/[\\=;#\n]/g, (c) => "\\" + c);
  let start = 0;
  const chapters = course.lessons
    .map((lesson) => {
      const end = start + Math.round(lesson.audio.durationSeconds * 1000);
      const result = `[CHAPTER]\nTIMEBASE=1/1000\nSTART=${start}\nEND=${end}\ntitle=${escape(lesson.title)}\n`;
      start = end;
      return result;
    })
    .join("");
  const metadata = `var/academy-${course.language}-chapters.txt`;
  writeFileSync(
    metadata,
    `;FFMETADATA1\ntitle=${escape(course.title)}\nartist=HarborVoice Academy\n${chapters}`,
  );
  const book = `academy/course-${course.language}.m4b`;
  execFileSync("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    `public/${file}`,
    "-f",
    "ffmetadata",
    "-i",
    metadata,
    "-map_metadata",
    "1",
    "-map_chapters",
    "1",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    `public/${book}`,
  ]);
  const probe = JSON.parse(
    execFileSync("ffprobe", [
      "-v",
      "error",
      "-show_chapters",
      "-show_format",
      "-of",
      "json",
      `public/${book}`,
    ]).toString(),
  );
  if (probe.chapters.length !== 3)
    throw Error("Chaptered audiobook metadata is incomplete.");
  books.push({
    language: course.language,
    title: course.title,
    file,
    bookFile: book,
    chapters: probe.chapters.length,
    durationSeconds: Number(probe.format.duration),
    scope:
      "Locally packaged from the completed individual Eleven v4 lessons; this is separate from the native Audiobooks UI export.",
  });
}
writeFileSync(
  "public/academy/books.json",
  JSON.stringify({ books }, null, 2) + "\n",
);
console.log(
  JSON.stringify({ packagedBooks: books.length, chaptersPerBook: 3 }),
);
