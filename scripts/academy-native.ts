import "../server/environment.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { client } from "../server/elevenlabs.js";
import { courses } from "../agent/academy-content.js";
import { reserve, finish } from "./academy-budget.js";
const sdk = client(),
  voice = "EXAVITQu4vr4xnSDxMaL",
  path = "var/academy-resources.json";
type Manifest = {
  dictionary?: { id: string; versionId: string };
  studio?: {
    id: string;
    conversionRequested?: boolean;
    file?: string;
    durationSeconds?: number;
  };
  nativeAudiobook?: Record<string, unknown>;
  errors?: Record<string, string>;
};
const manifest: Manifest = existsSync(path)
  ? JSON.parse(readFileSync(path, "utf8"))
  : {};
const save = () =>
  writeFileSync(path, JSON.stringify(manifest, null, 2), { mode: 0o600 });
const cli = (args: string[], input?: string) => {
  const env = { ...process.env };
  delete env.ELEVENLABS_API_KEY;
  try {
    return JSON.parse(
      execFileSync("elevenlabs", [...args, "--no-retry"], {
        encoding: "utf8",
        input,
        env,
        maxBuffer: 8 * 1024 * 1024,
      }),
    );
  } catch (error) {
    const e = error as { stderr?: Buffer | string };
    throw Error(
      String(e.stderr || "Official CLI request failed").replaceAll(
        process.env.ELEVENLABS_API_KEY || "__no_key__",
        "[redacted]",
      ),
    );
  }
};
const operation = process.argv[2] || "inspect";
mkdirSync("public/academy", { recursive: true });
if (operation === "create") {
  if (!manifest.dictionary && !manifest.errors?.dictionary) {
    const rules = [
      {
        type: "alias" as const,
        stringToReplace: "ETA",
        alias: "estimated time of arrival",
        caseSensitive: true,
        wordBoundaries: true,
      },
      {
        type: "alias" as const,
        stringToReplace: "TMS",
        alias: "transport management system",
        caseSensitive: true,
        wordBoundaries: true,
      },
      {
        type: "alias" as const,
        stringToReplace: "HV-2048",
        alias: "H V two zero four eight",
        caseSensitive: true,
        wordBoundaries: true,
      },
    ];
    try {
      let dictionary;
      try {
        dictionary = await sdk.pronunciationDictionaries.createFromRules({
          name: "HarborVoice Academy · English terminology",
          rules,
          description:
            "English training aliases for fictional shipment examples.",
        });
      } catch (error) {
        if ((error as { statusCode?: number }).statusCode !== 401) throw error;
        const r = cli([
          "pronunciation-dictionaries",
          "create_from_rules",
          "--name",
          "HarborVoice Academy · English terminology",
          "--rules",
          JSON.stringify(
            rules.map(
              ({
                stringToReplace,
                caseSensitive,
                wordBoundaries,
                ...rule
              }) => ({
                ...rule,
                string_to_replace: stringToReplace,
                case_sensitive: caseSensitive,
                word_boundaries: wordBoundaries,
              }),
            ),
          ),
        ]);
        dictionary = { id: r.id, versionId: r.version_id };
      }
      manifest.dictionary = {
        id: dictionary.id,
        versionId: dictionary.versionId,
      };
      save();
      console.log("Pronunciation dictionary created.");
    } catch (error) {
      manifest.errors = {
        ...manifest.errors,
        dictionary: error instanceof Error ? error.message : "Creation failed",
      };
      save();
      console.log("Dictionary creation blocked; inspect private receipt.");
    }
  }
  if (!manifest.studio && !manifest.errors?.studio) {
    const content = JSON.stringify(
      courses[0].lessons.map((lesson) => ({
        name: lesson.title,
        blocks: [
          {
            sub_type: "p",
            nodes: [{ type: "tts_node", voice_id: voice, text: lesson.text }],
          },
        ],
      })),
    );
    try {
      let id: string;
      try {
        const r = await sdk.studio.projects.create({
          name: "HarborVoice Academy · Reliable Voice AI",
          title: "Reliable Voice AI for Logistics",
          author: "Philippe Godfroy",
          language: "en",
          defaultModelId: "eleven_multilingual_v2",
          defaultParagraphVoiceId: voice,
          defaultTitleVoiceId: voice,
          fromContentJson: content,
          qualityPreset: "standard",
          autoConvert: false,
          ...(manifest.dictionary
            ? {
                pronunciationDictionaryLocators: [
                  JSON.stringify({
                    pronunciation_dictionary_id: manifest.dictionary.id,
                    version_id: manifest.dictionary.versionId,
                  }),
                ],
              }
            : {}),
        });
        id = r.project.projectId;
      } catch (error) {
        if ((error as { statusCode?: number }).statusCode !== 401) throw error;
        const args = [
          "studio",
          "projects",
          "create",
          "--name",
          "HarborVoice Academy · Reliable Voice AI",
          "--title",
          "Reliable Voice AI for Logistics",
          "--author",
          "Philippe Godfroy",
          "--language",
          "en",
          "--default-model-id",
          "eleven_multilingual_v2",
          "--default-paragraph-voice-id",
          voice,
          "--default-title-voice-id",
          voice,
          "--from-content-json",
          content,
          "--quality-preset",
          "standard",
          "--auto-convert",
          "false",
        ];
        if (manifest.dictionary)
          args.push(
            "--pronunciation-dictionary-locators",
            JSON.stringify({
              pronunciation_dictionary_id: manifest.dictionary.id,
              version_id: manifest.dictionary.versionId,
            }),
          );
        const result = cli(args);
        id = result.project?.project_id || result.project_id;
      }
      if (!id) throw Error("Studio did not return a project ID.");
      manifest.studio = { id };
      save();
      console.log("Native Studio project created without automatic rendering.");
    } catch (error) {
      manifest.errors = {
        ...manifest.errors,
        studio: error instanceof Error ? error.message : "Creation failed",
      };
      save();
      console.log("Studio creation blocked; inspect private receipt.");
    }
  }
} else if (operation === "convert") {
  if (!manifest.studio) throw Error("Create a Studio project first.");
  if (manifest.studio.conversionRequested)
    throw Error(
      "Studio conversion already requested. Refresh its snapshots instead of generating again.",
    );
  await reserve("studio-book", 2900);
  try {
    try {
      await sdk.studio.projects.convert(manifest.studio.id);
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode !== 401) throw error;
      cli([
        "studio",
        "projects",
        "convert",
        "--project-id",
        manifest.studio.id,
      ]);
    }
    manifest.studio.conversionRequested = true;
    save();
    console.log(
      "Studio conversion requested once. Refresh to check actual completion.",
    );
  } catch (error) {
    finish(
      "studio-book",
      "failed",
      "Conversion request failed; inspect before retrying.",
    );
    throw error;
  }
} else if (operation === "refresh") {
  if (!manifest.studio) throw Error("No Studio project recorded.");
  const project = await sdk.studio.projects.get(manifest.studio.id);
  const snapshots = await sdk.studio.projects.snapshots.list(
    manifest.studio.id,
  );
  console.log(
    JSON.stringify({
      state: project.state,
      snapshots: snapshots.snapshots.length,
    }),
  );
  if (snapshots.snapshots.length && !manifest.studio.file) {
    const snapshot = snapshots.snapshots.at(-1)!;
    const stream = await sdk.studio.projects.snapshots.stream(
      manifest.studio.id,
      snapshot.projectSnapshotId,
      { convertToMpeg: true },
    );
    const file = "academy/studio-book.mp3";
    writeFileSync(
      `public/${file}`,
      Buffer.from(await new Response(stream).arrayBuffer()),
    );
    const durationSeconds = Number(
      execFileSync("ffprobe", [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        `public/${file}`,
      ]).toString(),
    );
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0)
      throw Error("Studio book did not decode.");
    manifest.studio = { ...manifest.studio, file, durationSeconds };
    save();
    finish("studio-book", "completed");
    console.log("Studio book downloaded and decoded.");
  }
}
const report = {
  checkedAt: new Date().toISOString(),
  dictionary: {
    created: !!manifest.dictionary,
    ruleCount: manifest.dictionary ? 3 : 0,
  },
  studio: {
    created: !!manifest.studio,
    renderRequested: !!manifest.studio?.conversionRequested,
    renderCompleted: !!manifest.studio?.file,
    file: manifest.studio?.file,
    durationSeconds: manifest.studio?.durationSeconds,
  },
  ...(manifest.nativeAudiobook
    ? { nativeAudiobook: manifest.nativeAudiobook }
    : {}),
  studioApi: {
    available: !!manifest.studio,
    ...(!manifest.studio
      ? { reason: "Explicit Studio API account allowlisting required." }
      : {}),
  },
  blocked: Object.keys(manifest.errors || {}),
  scope:
    "Native platform resources and explicit rendering. Creation and an accepted render request do not prove a finished audiobook. Private resource IDs are kept outside Git.",
};
writeFileSync(
  "docs/academy-native-evidence.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
