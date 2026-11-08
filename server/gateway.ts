import express from "express";
import { createApp } from "./app.js";
import { initialState } from "../src/domain.js";
import type { Store } from "./store.js";
import { createPostgresStore } from "./postgres.js";
import { validateRuntime } from "./runtime.js";
export function createGateway() {
  validateRuntime(true);
  if (!process.env.OPERATOR_TOKEN)
    throw new Error(
      "OPERATOR_TOKEN is required for a hosted ElevenLabs gateway.",
    );
  // The hosted workspace belongs to each browser; no ephemeral database is presented as persistent storage.
  const readonlyStore: Store = {
    read: () => structuredClone(initialState),
    mutate() {
      throw new Error("Hosted workspace mutations are disabled.");
    },
    webhook() {
      throw new Error("Hosted webhook retention is disabled.");
    },
    close() {},
  };
  const app = express();
  app.use((req, _res, next) => {
    const url = new URL(req.url, "http://gateway.local");
    const route = url.searchParams.get("route");
    if (route) {
      url.searchParams.delete("route");
      req.url = "/api/" + route + (url.search ? url.search : "");
    }
    next();
  });
  app.use(
    createApp(
      process.env.DATABASE_URL ? createPostgresStore() : readonlyStore,
      undefined,
      {
        workspaceStorage: process.env.DATABASE_URL ? "postgres" : "browser",
        serveFrontend: false,
        hosted: true,
        maxUploadBytes: 4 * 1024 * 1024,
      },
    ),
  );
  return app;
}
