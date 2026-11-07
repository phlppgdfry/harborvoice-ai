import "dotenv/config";
import { createStore } from "./store.js";
import { createApp } from "./app.js";
const host = process.env.HOST || "127.0.0.1";
if (
  !["localhost", "127.0.0.1", "::1"].includes(host) &&
  !process.env.OPERATOR_TOKEN
)
  throw new Error(
    "Set OPERATOR_TOKEN before binding to a non-loopback address.",
  );
const store = createStore();
const server = createApp(store).listen(
  Number(process.env.PORT || 3100),
  host,
  () =>
    console.log(
      `HarborVoice API: http://${host}:${process.env.PORT || 3100} · ${process.env.ELEVENLABS_API_KEY ? "ElevenLabs configured" : "demo mode"}`,
    ),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(() => {
      store.close();
      process.exit(0);
    }),
  );
