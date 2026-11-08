import "./environment.js";
import { createStore, type Store } from "./store.js";
import { createApp } from "./app.js";
import { createPostgresStore } from "./postgres.js";
import { validateRuntime } from "./runtime.js";
validateRuntime();
const host = process.env.HOST || "127.0.0.1";
if (
  !["localhost", "127.0.0.1", "::1"].includes(host) &&
  !process.env.OPERATOR_TOKEN
)
  throw new Error(
    "Set OPERATOR_TOKEN before binding to a non-loopback address.",
  );
const store: Store = process.env.DATABASE_URL
  ? createPostgresStore()
  : createStore(process.env.SQLITE_PATH || "var/harborvoice.sqlite");
await store.ready?.();
const server = createApp(store, undefined, {
  workspaceStorage: process.env.DATABASE_URL ? "postgres" : "sqlite",
}).listen(Number(process.env.PORT || 3100), host, () =>
  console.log(
    `HarborVoice API: http://${host}:${process.env.PORT || 3100} · ${process.env.ELEVENLABS_API_KEY ? "ElevenLabs configured" : "demo mode"}`,
  ),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(() => {
      void Promise.resolve(store.close()).then(() => process.exit(0));
    }),
  );
