import "../../server/environment.js";
import { client } from "../../server/elevenlabs.js";
import { governor } from "./governor.js";
import { createReadStream, writeFileSync, existsSync } from "node:fs";
const file = "public/recognition/learning-transcript.json";
if (existsSync(file))
  throw Error("Transcript exists; no duplicate paid request.");
await governor.reserve(
  "learning-accessibility-transcript",
  "accessibility",
  100,
);
await governor.update("learning-accessibility-transcript", {
  status: "pending",
});
try {
  const { data: r, rawResponse } = await client()
    .speechToText.convert(
      {
        file: createReadStream("public/recognition/learning-example.mp3"),
        modelId: "scribe_v2",
        languageCode: "en",
        tagAudioEvents: false,
      },
      { maxRetries: 0 },
    )
    .withRawResponse();
  const id =
    rawResponse.headers.get("request-id") ||
    rawResponse.headers.get("x-request-id");
  writeFileSync(
    file,
    JSON.stringify(
      {
        text: r.text,
        language: r.languageCode,
        words: r.words,
        scope:
          "Real Scribe transcript of the completed native private template preview; not the earlier truncated component audio.",
      },
      null,
      2,
    ) + "\n",
  );
  writeFileSync("public/recognition/learning-transcript.txt", r.text + "\n");
  await governor.update("learning-accessibility-transcript", {
    status: "completed",
    providerIds: id ? [id] : [],
  });
  console.log(
    JSON.stringify({ words: r.text.split(/\s+/).length, text: r.text }),
  );
} catch (e) {
  await governor.update("learning-accessibility-transcript", {
    status: "failed",
    note: "No automatic retry; inspect provider status.",
  });
  throw e;
}
