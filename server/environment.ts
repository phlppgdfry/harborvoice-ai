import { config } from "dotenv";

// Local ElevenLabs onboarding credentials remain server-side.
config({ path: [".env.local", ".env"], quiet: true });
