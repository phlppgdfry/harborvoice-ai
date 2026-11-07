import { test } from "node:test";
import assert from "node:assert/strict";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createApp } from "../server/app.js";
import { createStore } from "../server/store.js";

type Captured = {
  path: string;
  query: URLSearchParams;
  json?: Record<string, unknown>;
  form?: FormData;
  method: string;
};
async function fixture(
  run: (base: string, calls: Captured[]) => Promise<void>,
  options: { status?: string; failProvider?: boolean; rag?: boolean } = {},
) {
  const calls: Captured[] = [];
  let documents = 0;
  let knowledgeBase: unknown[] = [
    {
      type: "text",
      name: "Existing policy",
      id: "existing-doc",
      usage_mode: "auto",
    },
  ];
  process.env.ELEVENLABS_API_KEY = "fixture-key-never-sent-to-network";
  process.env.ELEVENLABS_AGENT_ID = "agent-fixture";
  process.env.OPERATOR_TOKEN = "fixture-operator";
  const sdk = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
    maxRetries: 0,
    fetch: async (input, init) => {
      const req = new Request(input, init);
      const u = new URL(req.url);
      const c: Captured = {
        path: u.pathname,
        query: u.searchParams,
        method: req.method,
      };
      if (req.headers.get("content-type")?.includes("application/json"))
        c.json = await req.json();
      else if (req.headers.get("content-type")?.includes("multipart/form-data"))
        c.form = await req.formData();
      calls.push(c);
      if (options.failProvider)
        return Response.json(
          { detail: { message: "fixture error" } },
          { status: 401 },
        );
      if (c.path.endsWith("/get-signed-url"))
        return Response.json({ signed_url: "wss://fixture.invalid/session" });
      if (c.path === "/v1/speech-to-text")
        return Response.json({
          language_code: "en",
          language_probability: 1,
          text: "Cargo ready.",
          words: [],
        });
      if (c.path === "/v1/forced-alignment")
        return Response.json({
          characters: [],
          words: [{ text: "Cargo", start: 0, end: 1, loss: 0 }],
          loss: 0,
        });
      if (c.path === "/v1/dubbing" && req.method === "POST")
        return Response.json({
          dubbing_id: "dub-fixture",
          expected_duration_sec: 2,
        });
      if (c.path === "/v1/dubbing/dub-fixture")
        return Response.json({
          dubbing_id: "dub-fixture",
          name: "Fixture",
          status: options.status || "dubbed",
          target_languages: ["nl"],
          created_at: "2026-11-07T00:00:00Z",
        });
      if (c.path === "/v1/convai/knowledge-base/text")
        return Response.json({ id: `doc-${++documents}`, name: c.json?.name });
      if (c.path === "/v1/convai/agents/agent-fixture") {
        if (req.method === "PATCH")
          knowledgeBase = (c.json as any).conversation_config.agent.prompt
            .knowledge_base;
        return Response.json({
          agent_id: "agent-fixture",
          name: "Nora fixture",
          conversation_config: {
            agent: {
              prompt: {
                knowledge_base: knowledgeBase,
                ...(options.rag
                  ? {
                      rag: {
                        enabled: true,
                        embedding_model: "e5_mistral_7b_instruct",
                      },
                    }
                  : {}),
              },
            },
          },
          metadata: { created_at_unix_secs: 1, updated_at_unix_secs: 2 },
        });
      }
      if (c.path.endsWith("/rag-index") && req.method === "POST")
        return Response.json({
          id: "index-fixture",
          model: "e5_mistral_7b_instruct",
          status: "succeeded",
          progress_percentage: 100,
          document_model_index_usage: { used_bytes: 100 },
        });
      if (c.path === "/v1/convai/agent-testing/create")
        return Response.json({ id: "test-fixture" });
      if (
        c.path.endsWith("/run-tests") ||
        c.path === "/v1/convai/test-invocations/invocation-fixture"
      )
        return Response.json({ id: "invocation-fixture", test_runs: [] });
      if (c.path === "/v1/voices") return Response.json({ voices: [] });
      return new Response(new Uint8Array([73, 68, 51, 0, 1, 2]), {
        headers: { "Content-Type": "audio/mpeg" },
      });
    },
  });
  const store = createStore(":memory:");
  const server = createApp(store, () => sdk).listen(0, "127.0.0.1");
  await new Promise<void>((r) => server.on("listening", r));
  const address = server.address() as { port: number };
  try {
    await run(`http://127.0.0.1:${address.port}/api`, calls);
  } finally {
    await new Promise<void>((r) => server.close(() => r()));
    store.close();
  }
}
const headers = { Authorization: "Bearer fixture-operator" };
async function generate(
  base: string,
  tool: string,
  values: Record<string, string> = {},
  upload = false,
) {
  let body: FormData | string;
  if (upload) {
    const f = new FormData();
    f.append(
      "file",
      new Blob([new Uint8Array([82, 73, 70, 70, 0, 0, 0, 0, 87, 65, 86, 69])], {
        type: "audio/wav",
      }),
      "sample.wav",
    );
    for (const [k, v] of Object.entries(values)) f.append(k, v);
    body = f;
  } else body = JSON.stringify(values);
  return fetch(`${base}/audio/${tool}`, {
    method: "POST",
    headers: {
      ...headers,
      ...(upload ? {} : { "Content-Type": "application/json" }),
    },
    body,
  });
}
for (const spec of [
  {
    tool: "speech",
    path: "/v1/text-to-speech/voice-fixture",
    values: { text: "Cargo ready.", voiceId: "voice-fixture" },
    check: (c: Captured) => {
      assert.equal(c.json?.model_id, "eleven_multilingual_v2");
      assert.equal(c.json?.text, "Cargo ready.");
      assert.equal(c.query.get("output_format"), "mp3_44100_128");
    },
  },
  {
    tool: "effects",
    path: "/v1/sound-generation",
    values: { text: "A soft chime." },
    check: (c: Captured) => assert.equal(c.json?.duration_seconds, 5),
  },
  {
    tool: "music",
    path: "/v1/music",
    values: { text: "Calm instrumental music." },
    check: (c: Captured) => {
      assert.equal(c.json?.music_length_ms, 10000);
      assert.equal(c.json?.force_instrumental, true);
    },
  },
  {
    tool: "transcribe",
    path: "/v1/speech-to-text",
    upload: true,
    values: {},
    check: (c: Captured) => {
      assert.equal(c.form?.get("model_id"), "scribe_v1");
      assert.equal(c.form?.get("diarize"), "true");
      assert.ok(c.form?.get("file") instanceof File);
    },
  },
  {
    tool: "isolate",
    path: "/v1/audio-isolation",
    upload: true,
    values: {},
    check: (c: Captured) => assert.ok(c.form?.get("audio") instanceof File),
  },
  {
    tool: "change",
    path: "/v1/voice-changer/voice-fixture",
    upload: true,
    values: { voiceId: "voice-fixture" },
    check: (c: Captured) => {
      assert.equal(c.form?.get("model_id"), "eleven_multilingual_sts_v2");
      assert.ok(c.form?.get("audio") instanceof File);
    },
  },
  {
    tool: "align",
    path: "/v1/forced-alignment",
    upload: true,
    values: { text: "Cargo ready." },
    check: (c: Captured) => assert.equal(c.form?.get("text"), "Cargo ready."),
  },
  {
    tool: "dubbing",
    path: "/v1/dubbing",
    upload: true,
    values: { targetLanguage: "nl" },
    check: (c: Captured) => assert.equal(c.form?.get("target_lang"), "nl"),
  },
])
  test(`${spec.tool}: HTTP route serializes a real SDK request and returns provider output`, async () =>
    fixture(async (base, calls) => {
      const response = await generate(
        base,
        spec.tool,
        spec.values as Record<string, string>,
        spec.upload,
      );
      assert.equal(response.status, 200, await response.clone().text());
      const c = calls.find((c) => c.path === spec.path);
      assert.ok(c, JSON.stringify(calls));
      spec.check(c);
      assert.ok((await response.arrayBuffer()).byteLength > 0);
    }));
test("signed sessions return SDK-normalized signedUrl", async () =>
  fixture(async (base, calls) => {
    const response = await fetch(`${base}/agent/session`, {
      method: "POST",
      headers,
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      signedUrl: "wss://fixture.invalid/session",
    });
    assert.equal(calls[0].query.get("agent_id"), "agent-fixture");
  }));
test("completed automatic dub is streamed after checking provider job status", async () =>
  fixture(async (base, calls) => {
    const response = await fetch(`${base}/dubbing/dub-fixture/audio/nl`, {
      headers,
    });
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") || "", /audio\/mpeg/);
    assert.equal((await response.arrayBuffer()).byteLength, 6);
    assert.deepEqual(
      calls.map((c) => c.path),
      ["/v1/dubbing/dub-fixture", "/v1/dubbing/dub-fixture/audio/nl"],
    );
  }));
test("unfinished dubbing cannot return a fake completed audio result", async () =>
  fixture(
    async (base, calls) => {
      const r = await fetch(`${base}/dubbing/dub-fixture/audio/nl`, {
        headers,
      });
      assert.equal(r.status, 409);
      assert.equal(calls.length, 1);
    },
    { status: "dubbing" },
  ));
test("provider auth failures are actionable and do not expose credentials", async () =>
  fixture(
    async (base) => {
      const r = await generate(base, "speech", {
        text: "Test",
        voiceId: "voice-fixture",
      });
      assert.equal(r.status, 502);
      const body = await r.text();
      assert.match(body, /401/);
      assert.ok(!body.includes("fixture-key"));
    },
    { failProvider: true },
  ));
test("invalid studio inputs fail before a provider request", async () =>
  fixture(async (base, calls) => {
    const r = await generate(base, "speech", { text: "Test", voiceId: "" });
    assert.equal(r.status, 400);
    assert.equal(calls.length, 0);
  }));

test("connection check reads provider access without generating billable audio", async () =>
  fixture(async (base, calls) => {
    const response = await fetch(`${base}/connection/check`, {
      method: "POST",
      headers,
    });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.verified, true);
    assert.equal(result.voiceCount, 0);
    assert.match(result.scope, /does not start a call or generate audio/);
    assert.deepEqual(
      calls.map((c) => [c.method, c.path]),
      [["GET", "/v1/voices"]],
    );
  }));

test("concurrent knowledge uploads preserve existing and both new attachments", async () =>
  fixture(async (base, calls) => {
    const upload = (name: string) =>
      fetch(`${base}/knowledge`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          text: "A versioned operating procedure.",
        }),
      });
    const responses = await Promise.all([
      upload("Gate policy"),
      upload("Customs policy"),
    ]);
    for (const r of responses)
      assert.equal(r.status, 200, await r.clone().text());
    const patches = calls.filter((c) => c.method === "PATCH");
    assert.equal(patches.length, 2);
    const final = (patches[1].json as any).conversation_config.agent.prompt
      .knowledge_base;
    assert.deepEqual(final.map((d: { id: string }) => d.id).sort(), [
      "doc-1",
      "doc-2",
      "existing-doc",
    ]);
  }));
test("live simulation creates the current test type and polls the returned invocation", async () =>
  fixture(async (base, calls) => {
    const r = await fetch(`${base}/agent/simulate`, {
      method: "POST",
      headers,
    });
    assert.equal(r.status, 200, await r.clone().text());
    assert.equal((await r.json()).id, "invocation-fixture");
    const test = calls.find(
      (c) => c.path === "/v1/convai/agent-testing/create",
    )!;
    assert.equal(test.json?.type, "simulation");
    assert.equal((test.json?.success_conditions as string[]).length, 2);
    assert.ok(!calls.some((c) => c.path.includes("simulate-conversation")));
    const poll = await fetch(`${base}/agent/test-runs/invocation-fixture`, {
      headers,
    });
    assert.equal(poll.status, 200);
    assert.deepEqual((await poll.json()).testRuns, []);
  }));

test("RAG-enabled agents index newly attached knowledge after attaching it", async () =>
  fixture(
    async (base, calls) => {
      const response = await fetch(`${base}/knowledge`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Gate policy",
          text: "A source-grounded collection policy for authorised terminal operators.",
        }),
      });
      assert.equal(response.status, 200, await response.clone().text());
      const patch = calls.findIndex((c) => c.method === "PATCH");
      const indexing = calls.findIndex((c) => c.path.endsWith("/rag-index"));
      assert.ok(patch >= 0 && indexing > patch);
      assert.equal(calls[indexing].json?.model, "e5_mistral_7b_instruct");
    },
    { rag: true },
  ));

test("current audio model selections serialize distinct Creative and API model names correctly", () =>
  fixture(async (base, calls) => {
    for (const [tool, body, expected] of [
      [
        "speech",
        {
          text: "Cargo ready.",
          voiceId: "voice-fixture",
          modelId: "eleven_v4",
        },
        "eleven_v4",
      ],
      [
        "effects",
        {
          text: "Soft chime.",
          modelId: "eleven_text_to_sound_v3",
          durationSeconds: 2,
        },
        "eleven_text_to_sound_v3",
      ],
      [
        "music",
        {
          text: "Calm instrumental.",
          modelId: "music_v2_5",
          durationSeconds: 3,
        },
        "music_v2_5",
      ],
    ] as const) {
      const r = await fetch(`${base}/audio/${tool}`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      assert.equal(r.status, 200);
      assert.equal(calls.at(-1)?.json?.model_id, expected);
    }
    const before = calls.length;
    const rejected = await fetch(`${base}/audio/music`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Calm music",
        modelId: "eleven_music_v2_5",
        durationSeconds: 600,
      }),
    });
    assert.equal(rejected.status, 400);
    assert.equal(calls.length, before);
  }));
