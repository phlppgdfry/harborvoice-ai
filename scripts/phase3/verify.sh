#!/usr/bin/env bash
set -euo pipefail
npm run check --prefix packages/agentops-kit
node --import tsx scripts/phase3/benchmark.ts
node --test community/elevenlabs-belgium/starter/*.test.mjs docs/phase3/contribution/*.test.mjs
npm run build --prefix apps/agentproof
node --import tsx scripts/phase3/validate.ts
git diff --check
