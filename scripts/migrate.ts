import "../server/environment.js";
import { createPostgresStore } from "../server/postgres.js";
const store = createPostgresStore();
try {
  await store.ready!();
  await store.health!();
  console.log("HarborVoice PostgreSQL schema version 1 applied and reachable.");
} finally {
  await store.close();
}
