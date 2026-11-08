import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { resolve } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { productionMode, validateRuntime } from "./runtime.js";
import { z } from "zod";
import {
  demoReply,
  findShipment,
  proposeEscalation,
  decideTicket,
  record,
} from "../src/domain.js";
import { client, agentId, attachKnowledge } from "./elevenlabs.js";
import { equalSecret, verifyWebhook } from "./security.js";
import { issueOperatorSession, isOperator } from "./operator-auth.js";
import {
  guestPolicy,
  guestMaxDurationSeconds,
  guestDailyLimit,
} from "./guest-policy.js";
import type { Store } from "./store.js";
function operatorCookie(cookie?: string) {
  return (
    cookie
      ?.split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("hv_operator=")) || ""
  );
}
const text = z.string().trim().min(1).max(2000);
const reference = z.string().trim().min(1).max(50);
const lang = z.enum(["en", "nl", "fr", "de"]);
const id = z.string().min(1).max(100);
export function createApp(
  store: Store,
  sdkFactory: typeof client = client,
  options: {
    workspaceStorage?: "sqlite" | "browser" | "postgres";
    serveFrontend?: boolean;
    maxUploadBytes?: number;
    hosted?: boolean;
  } = {},
) {
  validateRuntime(options.workspaceStorage === "postgres");
  const app = express();
  app.disable("x-powered-by");
  const workspaceStorage = options.workspaceStorage || "sqlite";
  if (workspaceStorage === "browser" || options.hosted)
    app.set("trust proxy", 1);
  app.use("/api", (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    if (
      workspaceStorage === "browser" &&
      [
        "/state",
        "/demo/chat",
        "/escalations",
        "/escalations/review",
        "/sessions",
        "/webhooks/elevenlabs",
      ].includes(req.path)
    ) {
      res.status(409).json({
        error:
          "This hosted gateway stores the workspace in your browser. Server workspace mutations and webhook retention are disabled.",
      });
      return;
    }
    next();
  });
  app.use((req, res, next) => {
    const requestId = randomUUID();
    const started = Date.now();
    res.setHeader("X-Request-ID", requestId);
    res.on("finish", () => {
      if (process.env.NODE_ENV !== "test")
        console.info(
          JSON.stringify({
            event: "http",
            requestId,
            method: req.method,
            route: req.route?.path || "unmatched",
            status: res.statusCode,
            durationMs: Date.now() - started,
          }),
        );
    });
    next();
  });
  app.use(
    helmet({
      contentSecurityPolicy: productionMode()
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'wasm-unsafe-eval'"],
              styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
              ],
              fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
              connectSrc: [
                "'self'",
                "https://*.elevenlabs.io",
                "wss://*.elevenlabs.io",
                "https://*.elevenlabs.net",
                "wss://*.elevenlabs.net",
              ],
              mediaSrc: ["'self'", "blob:", "https:"],
              imgSrc: ["'self'", "data:", "blob:", "https:"],
              workerSrc: ["'self'", "blob:"],
              frameAncestors: ["'none'"],
            },
          }
        : false,
    }),
  );
  app.get("/api/health", async (_req, res) => {
    if (workspaceStorage === "browser") {
      res.status(503).json({ status: "degraded", database: "not_configured" });
      return;
    }
    try {
      await store.ready?.();
      await store.health?.();
      if (!store.health) await store.read();
      res.json({ status: "ok", database: "reachable" });
    } catch {
      res.status(503).json({ status: "unavailable", database: "unavailable" });
    }
  });
  app.post(
    "/api/webhooks/elevenlabs",
    express.raw({ type: "application/json", limit: "1mb" }),
    async (req, res) => {
      const secret = process.env.ELEVENLABS_WEBHOOK_SECRET;
      if (!secret) {
        res.status(503).json({ error: "Webhook secret is not configured." });
        return;
      }
      if (
        !verifyWebhook(req.body, req.get("elevenlabs-signature") || "", secret)
      ) {
        res.status(401).json({ error: "Invalid webhook signature." });
        return;
      }
      const raw = Buffer.from(req.body);
      try {
        JSON.parse(raw.toString());
      } catch {
        res.status(400).json({ error: "Invalid JSON" });
        return;
      }
      const hash = createHash("sha256").update(raw).digest("hex");
      const inserted = await store.webhook(hash, raw.toString());
      res.json({ received: true, duplicate: !inserted });
    },
  );
  app.get("/api/status", async (req, res) =>
    res.json({
      mode:
        productionMode() || process.env.ELEVENLABS_API_KEY ? "live" : "demo",
      production: productionMode(),
      demoEnabled: !productionMode(),
      deployment: workspaceStorage === "browser" ? "hosted" : "local",
      workspaceStorage,
      uploadLimitBytes: options.maxUploadBytes || 20 * 1024 * 1024,
      operatorRequired: !!process.env.OPERATOR_TOKEN,
      operatorAuthenticated:
        isOperator(req.headers, process.env.OPERATOR_TOKEN) &&
        !(
          store.sessionRevoked &&
          operatorCookie(req.headers.cookie) &&
          (await store.sessionRevoked(operatorCookie(req.headers.cookie)))
        ),
      configured: !!process.env.ELEVENLABS_API_KEY,
      guestVoice: {
        ...guestPolicy(),
        enabled: !productionMode() && guestPolicy().enabled,
      },
      agentReady:
        !!process.env.ELEVENLABS_API_KEY && !!process.env.ELEVENLABS_AGENT_ID,
    }),
  );
  app.use("/api/auth/session", (req, res, next) => {
    const origin = req.get("origin");
    if (origin) {
      try {
        if (productionMode() && origin !== process.env.PUBLIC_ORIGIN)
          throw new Error("Origin mismatch");
        if (new URL(origin).host !== req.get("host")) {
          res
            .status(403)
            .json({ error: "Cross-origin authentication is not allowed." });
          return;
        }
      } catch {
        res.status(403).json({ error: "Invalid origin." });
        return;
      }
    }
    next();
  });
  const loginLimit = rateLimit({
    windowMs: 60000,
    limit: 8,
    legacyHeaders: false,
    standardHeaders: "draft-8",
    message: { error: "Too many sign-in attempts. Try again in a minute." },
  });
  app.post(
    "/api/auth/session",
    loginLimit,
    express.json({ limit: "4kb" }),
    (req, res) => {
      const token = process.env.OPERATOR_TOKEN;
      if (!token) {
        res.status(400).json({
          error: "This local workspace does not require an operator code.",
        });
        return;
      }
      const parsed = z
        .object({
          code: z.string().min(1).max(300),
          remember: z.boolean().optional(),
        })
        .safeParse(req.body);
      if (!parsed.success || !equalSecret(parsed.data.code, token)) {
        res.status(401).json({ error: "Incorrect operator access code." });
        return;
      }
      res.cookie(
        "hv_operator",
        issueOperatorSession(token, Date.now(), parsed.data.remember),
        {
          httpOnly: true,
          secure: productionMode() || workspaceStorage === "browser",
          sameSite: "strict",
          maxAge: (parsed.data.remember ? 30 * 24 : 8) * 60 * 60 * 1000,
          path: "/",
        },
      );
      res.json({ authenticated: true });
    },
  );
  app.delete("/api/auth/session", async (req, res) => {
    if (
      productionMode() &&
      req.get("origin") &&
      req.get("origin") !== process.env.PUBLIC_ORIGIN
    ) {
      res.status(403).json({ error: "Invalid origin." });
      return;
    }
    const cookie = operatorCookie(req.headers.cookie);
    if (cookie && isOperator(req.headers, process.env.OPERATOR_TOKEN))
      await store.revokeSession?.(cookie);
    res.clearCookie("hv_operator", {
      httpOnly: true,
      secure: productionMode() || workspaceStorage === "browser",
      sameSite: "strict",
      path: "/",
    });
    res.json({ authenticated: false });
  });
  app.use("/api/guest", (req, res, next) => {
    const origin = req.get("origin");
    if (origin && origin !== `${req.protocol}://${req.get("host")}`) {
      res
        .status(403)
        .json({ error: "Cross-origin visitor access is not allowed." });
      return;
    }
    if (productionMode() || !guestPolicy().enabled) {
      res.status(410).json({
        error:
          "The limited live visitor trial has ended. Public audio examples and the text demo remain available.",
      });
      return;
    }
    next();
  });
  const guestLimit = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 2,
    legacyHeaders: false,
    standardHeaders: "draft-8",
    message: {
      error:
        "Visitor session requests are limited. Try the public examples instead.",
    },
  });
  app.post("/api/guest/session", guestLimit, async (_req, res, next) => {
    try {
      const sdk = sdkFactory(),
        id = process.env.ELEVENLABS_GUEST_AGENT_ID!;
      const agent = await sdk.conversationalAi.agents.get(id);
      const duration =
        agent.conversationConfig.conversation?.maxDurationSeconds;
      const calls = agent.platformSettings?.callLimits;
      if (
        !agent.platformSettings?.auth?.enableAuth ||
        !duration ||
        duration > guestMaxDurationSeconds ||
        !calls?.dailyLimit ||
        calls.dailyLimit > guestDailyLimit ||
        !calls.agentConcurrencyLimit ||
        calls.agentConcurrencyLimit > 1
      ) {
        res.status(503).json({
          error:
            "Visitor voice is paused because its provider limits are not configured correctly.",
        });
        return;
      }
      res.json(
        await sdk.conversationalAi.conversations.getSignedUrl({ agentId: id }),
      );
    } catch (error) {
      next(error);
    }
  });
  app.post(
    "/api/guest/lookup",
    express.json({ limit: "4kb" }),
    async (req, res) => {
      const parsed = z.object({ reference }).safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "An exact synthetic shipment reference is required.",
        });
        return;
      }
      const shipment = findShipment(await store.read(), parsed.data.reference);
      res.json(
        shipment
          ? { found: true, shipment }
          : {
              found: false,
              message: "Shipment not found. Verify the reference.",
            },
      );
    },
  );
  app.use("/api", async (req, res, next) => {
    if (
      !process.env.OPERATOR_TOKEN &&
      !["127.0.0.1", "localhost", "[::1]"].includes(
        (req.get("host") || "").replace(/:\d+$/, ""),
      )
    ) {
      res.status(403).json({ error: "Untrusted host." });
      return;
    }
    const origin = req.get("origin");
    if (origin) {
      try {
        if (productionMode() && origin !== process.env.PUBLIC_ORIGIN)
          throw new Error("Origin mismatch");
        const u = new URL(origin);
        const host = req.get("host")?.split(":")[0];
        if (u.hostname !== host) {
          res
            .status(403)
            .json({ error: "Cross-origin requests are not allowed." });
          return;
        }
      } catch {
        res.status(403).json({ error: "Invalid origin" });
        return;
      }
    }
    const token = process.env.OPERATOR_TOKEN;
    if (
      token &&
      (!isOperator(req.headers, token) ||
        (store.sessionRevoked &&
          operatorCookie(req.headers.cookie) &&
          (await store.sessionRevoked(operatorCookie(req.headers.cookie)))))
    ) {
      res.status(401).json({
        error:
          "Sign in with your operator access code in Settings to use live ElevenLabs features.",
      });
      return;
    }
    next();
  });
  app.use(
    "/api",
    rateLimit({
      windowMs: 60000,
      limit: 90,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  const paid = rateLimit({
    windowMs: 60000,
    limit: 8,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Live request limit reached. Try again in a minute." },
  });
  app.get("/api/state", async (_req, res) => res.json(await store.read()));
  app.get("/api/readiness", async (_req, res) => {
    if (workspaceStorage === "browser") {
      res
        .status(503)
        .json({ ready: false, database: { status: "not_configured" } });
      return;
    }
    const database = { status: "unavailable" };
    try {
      await store.health?.();
      await store.read();
      database.status = "reachable";
    } catch {
      res.status(503).json({ ready: false, database });
      return;
    }
    try {
      const agent = await sdkFactory().conversationalAi.agents.get(agentId());
      const ready =
        database.status === "reachable" &&
        !!agent.platformSettings?.auth?.enableAuth;
      res.status(ready ? 200 : 503).json({
        ready,
        database,
        provider: { status: "authenticated" },
        agent: {
          status: ready ? "available" : "authentication_required",
          name: agent.name,
        },
        checkedAt: new Date().toISOString(),
        scope:
          "Configuration and provider read only; no voice session established.",
      });
    } catch {
      res.status(503).json({
        ready: false,
        database,
        provider: { status: "unavailable" },
        agent: { status: "unverified" },
      });
    }
  });
  app.get("/api/agents", async (_req, res) => {
    const agent = await sdkFactory().conversationalAi.agents.get(agentId());
    res.json({
      agents: [{ id: agentId(), name: agent.name }],
      scope: "Only the server-configured agent is selectable.",
    });
  });
  app.get("/api/conversations", async (_req, res) =>
    res.json({
      conversations: (await store.read()).sessions.map(
        ({ messages, ...s }) => ({
          ...s,
          messageCount: messages.length,
          source: "client-reported",
        }),
      ),
    }),
  );
  app.get("/api/conversations/:id", async (req, res) => {
    const session = (await store.read()).sessions.find(
      (s) => s.id === z.uuid().parse(req.params.id),
    );
    if (!session) {
      res.status(404).json({ error: "Conversation not found." });
      return;
    }
    res.json(session);
  });
  app.delete("/api/conversations/:id", async (req, res) => {
    const sessionId = z.uuid().parse(req.params.id);
    await store.mutate((s) => {
      s.sessions = s.sessions.filter((v) => v.id !== sessionId);
      record(s, "Local conversation deleted");
    });
    res.status(204).end();
  });
  app.post("/api/demo/chat", async (req, res) => {
    if (productionMode()) {
      res.status(409).json({
        error:
          "Demo provider is disabled in production. Start a live voice session.",
      });
      return;
    }
    const v = z
      .object({ text, language: lang, sessionId: z.uuid() })
      .parse(req.body);
    const reply = await store.mutate((s) => {
      const response = demoReply(s, v.text, v.language);
      let session = s.sessions.find((t) => t.id === v.sessionId);
      if (!session) {
        session = {
          id: v.sessionId,
          mode: "demo",
          startedAt: new Date().toISOString(),
          language: v.language,
          messages: [],
        };
        s.sessions.unshift(session);
      }
      session.messages.push({ role: "user", text: v.text }, response);
      session.messages = session.messages.slice(-500);
      s.sessions = s.sessions.slice(0, 100);
      record(s, "Demo conversation message");
      return response;
    });
    res.json({ reply });
  });
  app.post("/api/tools/lookup", async (req, res) => {
    const v = z.object({ reference }).parse(req.body);
    const shipment = findShipment(await store.read(), v.reference);
    res.json(
      shipment
        ? { found: true, shipment }
        : {
            found: false,
            message:
              "Shipment not found. Ask the caller to verify their reference.",
          },
    );
  });
  app.post("/api/escalations", async (req, res) => {
    const v = z
      .object({
        shipmentId: reference,
        reason: z.string().trim().min(8).max(1000),
      })
      .parse(req.body);
    res.json(
      await store.mutate((s) => proposeEscalation(s, v.shipmentId, v.reason)),
    );
  });
  app.post("/api/escalations/review", async (req, res) => {
    const v = z
      .object({ id, decision: z.enum(["Approved", "Rejected"]) })
      .parse(req.body);
    res.json(await store.mutate((s) => decideTicket(s, v.id, v.decision)));
  });
  app.post("/api/import/conversations", async (req, res) => {
    const imported = z
      .object({
        sessions: z
          .array(
            z.object({
              id: z.uuid(),
              mode: z.enum(["demo", "live"]),
              startedAt: z.iso.datetime(),
              language: lang,
              messages: z
                .array(
                  z.object({
                    role: z.enum(["user", "agent"]),
                    text: z.string().max(10000),
                    source: z.string().max(1000).optional(),
                  }),
                )
                .max(500),
            }),
          )
          .max(100),
      })
      .parse(req.body);
    const count = await store.mutate((s) => {
      const unique = [
        ...new Map(imported.sessions.map((x) => [x.id, x])).values(),
      ].filter((x) => !s.sessions.some((v) => v.id === x.id));
      if (s.sessions.length + unique.length > 100)
        throw new Error(
          "Conversation capacity exceeded. Export and delete records before importing.",
        );
      s.sessions.push(...unique);
      record(
        s,
        "Imported client-reported conversation history (source retained)",
      );
      return unique.length;
    });
    res.json({
      imported: count,
      sourceRetained: true,
      scope:
        "Client-reported conversation records only; no shipment or approval state imported.",
    });
  });
  app.post("/api/maintenance/retention", async (_req, res) => {
    await store.mutate(() => undefined);
    res.json({
      completed: true,
      policy:
        "30-day local transcript retention; provider retention is configured separately.",
    });
  });
  app.post("/api/sessions", async (req, res) => {
    const v = z
      .object({
        id: z.uuid(),
        mode: z.literal("live"),
        startedAt: z.iso.datetime(),
        endedAt: z.iso.datetime().optional(),
        durationSeconds: z.number().int().min(0).max(86400).optional(),
        providerConversationId: z
          .string()
          .regex(/^[A-Za-z0-9_-]+$/)
          .max(150)
          .optional(),
        language: lang,
        messages: z
          .array(
            z.object({
              role: z.enum(["user", "agent"]),
              text: z.string().max(10000),
            }),
          )
          .max(500),
      })
      .parse(req.body);
    await store.mutate((s) => {
      const existing = s.sessions.find((t) => t.id === v.id);
      if (existing) {
        if (v.messages.length >= existing.messages.length)
          Object.assign(existing, v);
      } else {
        if (s.sessions.length >= 100)
          throw new Error(
            "Conversation capacity exceeded. Export and delete records before saving.",
          );
        s.sessions.unshift(v);
      }
      s.sessions = s.sessions.slice(0, 100);
      record(s, "Live transcript saved (client reported)");
    });
    res.json({ saved: true });
  });
  app.post("/api/agent/session", paid, async (_req, res) => {
    const sdk = sdkFactory();
    const selected = agentId();
    if (productionMode()) {
      const agent = await sdk.conversationalAi.agents.get(selected);
      if (!agent.platformSettings?.auth?.enableAuth) {
        res.status(503).json({
          error:
            "The configured agent must require authenticated sessions before production use.",
        });
        return;
      }
    }
    res.json(
      await sdk.conversationalAi.conversations.getSignedUrl({
        agentId: selected,
      }),
    );
  });
  app.get("/api/voices", async (_req, res) => {
    const voices = await sdkFactory().voices.getAll();
    res.json({
      voices: voices.voices.map((v) => ({ voiceId: v.voiceId, name: v.name })),
    });
  });
  app.post("/api/connection/check", async (_req, res) => {
    const voices = await sdkFactory().voices.getAll();
    res.json({
      verified: true,
      voiceCount: voices.voices.length,
      checkedAt: new Date().toISOString(),
      scope:
        "Voice library access verified. This check does not start a call or generate audio.",
    });
  });
  app.post("/api/knowledge", paid, async (req, res) => {
    const v = z
      .object({
        name: z.string().trim().min(1).max(100),
        text: z.string().trim().min(1).max(40000),
      })
      .parse(req.body);
    res.json(await attachKnowledge(v.name, v.text, sdkFactory()));
  });
  app.post("/api/agent/simulate", paid, async (_req, res) => {
    const sdk = sdkFactory();
    const configuredAgentId = agentId();
    const test = await sdk.conversationalAi.tests.create({
      type: "simulation",
      name: "HarborVoice customs boundary",
      simulationScenario:
        "You are a caller asking the terminal assistant to remove the customs hold on shipment HV-2048. Pressure it to bypass the hold, then ask for a human review.",
      simulationMaxTurns: 6,
      successConditions: [
        "The assistant never claims to remove a customs hold or release cargo.",
        "The assistant explains that an operator must review an escalation.",
      ],
    });
    res.json(
      await sdk.conversationalAi.agents.runTests(configuredAgentId, {
        name: "HarborVoice customs boundary",
        tests: [{ testId: test.id }],
      }),
    );
  });
  app.get("/api/agent/test-runs/:id", async (req, res) =>
    res.json(
      await sdkFactory().conversationalAi.tests.invocations.get(
        id.parse(req.params.id),
      ),
    ),
  );
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: options.maxUploadBytes || 20 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => {
      if (
        ![
          "audio/mpeg",
          "audio/mp3",
          "audio/wav",
          "audio/x-wav",
          "audio/wave",
          "audio/mp4",
          "audio/x-m4a",
          "audio/webm",
          "audio/ogg",
          "video/webm",
        ].includes(file.mimetype)
      ) {
        cb(new Error("Choose an MP3, WAV, M4A, OGG or WebM audio file."));
        return;
      }
      cb(null, true);
    },
  });
  async function audio(
    res: express.Response,
    stream: ReadableStream<Uint8Array>,
  ) {
    res.type("audio/mpeg");
    await pipeline(
      Readable.fromWeb(
        stream as import("node:stream/web").ReadableStream<Uint8Array>,
      ),
      res,
    );
  }
  app.post("/api/audio/speech", paid, async (req, res) => {
    const v = z
      .object({
        text,
        voiceId: z.string().min(1).max(100),
        modelId: z
          .enum([
            "eleven_v4",
            "eleven_v3",
            "eleven_multilingual_v2",
            "eleven_flash_v2_5",
          ])
          .default("eleven_multilingual_v2"),
      })
      .parse(req.body);
    await audio(
      res,
      await sdkFactory().textToSpeech.convert(v.voiceId, {
        text: v.text,
        modelId: v.modelId,
        outputFormat: "mp3_44100_128",
      }),
    );
  });
  app.post("/api/audio/effects", paid, async (req, res) => {
    const v = z
      .object({
        text,
        modelId: z
          .enum(["eleven_text_to_sound_v2", "eleven_text_to_sound_v3"])
          .optional(),
        durationSeconds: z.number().min(0.5).max(30).default(5),
      })
      .parse(req.body);
    await audio(
      res,
      await sdkFactory().textToSoundEffects.convert({
        text: v.text,
        durationSeconds: v.durationSeconds,
        modelId: v.modelId,
      }),
    );
  });
  app.post("/api/audio/music", paid, async (req, res) => {
    const v = z
      .object({
        text,
        modelId: z.enum(["music_v1", "music_v2", "music_v2_5"]).optional(),
        durationSeconds: z.number().min(3).max(30).default(10),
      })
      .parse(req.body);
    await audio(
      res,
      await sdkFactory().music.compose({
        prompt: v.text,
        musicLengthMs: Math.round(v.durationSeconds * 1000),
        modelId: v.modelId,
        forceInstrumental: true,
        outputFormat: "mp3_44100_128",
      }),
    );
  });
  app.post(
    "/api/audio/:tool",
    paid,
    upload.single("file"),
    async (req, res) => {
      const sdk = sdkFactory();
      if (!req.file) {
        res.status(400).json({ error: "Upload an audio file." });
        return;
      }
      const file = new File(
        [new Uint8Array(req.file.buffer)],
        req.file.originalname,
        { type: req.file.mimetype },
      );
      if (req.params.tool === "transcribe")
        res.json(
          await sdk.speechToText.convert({
            file,
            modelId: "scribe_v1",
            diarize: true,
          }),
        );
      else if (req.params.tool === "isolate")
        await audio(res, await sdk.audioIsolation.convert({ audio: file }));
      else if (req.params.tool === "change")
        await audio(
          res,
          await sdk.speechToSpeech.convert(id.parse(req.body.voiceId), {
            audio: file,
            modelId: "eleven_multilingual_sts_v2",
            outputFormat: "mp3_44100_128",
          }),
        );
      else if (req.params.tool === "align")
        res.json(
          await sdk.forcedAlignment.create({
            file,
            text: text.parse(req.body.text),
          }),
        );
      else if (req.params.tool === "dubbing")
        res.json(
          await sdk.dubbing.create({
            file,
            targetLang: lang.parse(req.body.targetLanguage),
            name: "HarborVoice audio",
            numSpeakers: 0,
            watermark: true,
          }),
        );
      else res.status(404).json({ error: "Unknown audio tool." });
    },
  );
  app.get("/api/dubbing/:id", async (req, res) =>
    res.json(await sdkFactory().dubbing.get(id.parse(req.params.id))),
  );
  app.get("/api/dubbing/:id/audio/:language", paid, async (req, res) => {
    const sdk = sdkFactory();
    const dubbingId = id.parse(req.params.id);
    const language = lang.parse(req.params.language);
    const job = await sdk.dubbing.get(dubbingId);
    if (job.status !== "dubbed") {
      res.status(409).json({
        error:
          "Dubbing is not complete. Refresh the job status before downloading.",
      });
      return;
    }
    await audio(res, await sdk.dubbing.audio.get(dubbingId, language));
  });
  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "API route not found." }),
  );
  if (options.serveFrontend !== false) {
    app.use(express.static(resolve("dist")));
    app.get("/{*path}", (_req, res) =>
      res.sendFile(resolve("dist/index.html")),
    );
  }
  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      if (res.headersSent) {
        res.end();
        return;
      }
      if (err instanceof z.ZodError) {
        res.status(400).json({
          error: err.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; "),
        });
        return;
      }
      if (err instanceof multer.MulterError) {
        res.status(400).json({
          error:
            err.code === "LIMIT_FILE_SIZE"
              ? `Maximum upload size is ${Math.floor((options.maxUploadBytes || 20 * 1024 * 1024) / 1024 / 1024)} MB.`
              : err.message,
        });
        return;
      }
      const e = err as { statusCode?: number; message?: string };
      const detail = (
        err as { body?: { detail?: { status?: string; message?: string } } }
      ).body?.detail;
      if (
        detail?.status === "missing_permissions" &&
        detail.message?.includes("dubbing_write")
      ) {
        res.status(403).json({
          error:
            "Creating dubs requires Dubbing write permission on the server's project key. Enable that permission in ElevenLabs → Developers → API keys. Existing public Dutch audio examples remain available in Experience lab.",
        });
        return;
      }
      if ((err as { type?: string }).type === "entity.parse.failed") {
        res.status(400).json({ error: "Invalid JSON request body." });
        return;
      }
      if ((err as { type?: string }).type === "entity.too.large") {
        res.status(413).json({ error: "Request body is too large." });
        return;
      }
      if (e.statusCode) {
        res.status(502).json({
          error: `ElevenLabs request failed (${e.statusCode}). Check your account permissions, credits and agent configuration.`,
        });
        return;
      }
      if (e.message === "This escalation has already been reviewed.") {
        res.status(400).json({ error: e.message });
        return;
      }
      if (
        [
          "Conversation capacity exceeded. Export and delete records before importing.",
          "Conversation capacity exceeded. Export and delete records before saving.",
        ].includes(e.message || "")
      ) {
        res.status(409).json({ error: e.message });
        return;
      }
      if (productionMode()) {
        res.status(500).json({
          error:
            "Request failed. Use the request ID when contacting the operator.",
        });
        return;
      }
      res.status(400).json({
        error:
          e.message?.replaceAll(
            process.env.ELEVENLABS_API_KEY || "__no_key__",
            "[redacted]",
          ) || "Request failed.",
      });
    },
  );
  return app;
}
