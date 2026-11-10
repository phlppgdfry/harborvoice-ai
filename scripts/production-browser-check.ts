import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { initialState } from "../src/domain.js";
import { mkdirSync, writeFileSync } from "node:fs";
const browser = await chromium.launch({
  headless: true,
  channel: process.env.BROWSER_CHANNEL || "chrome",
  args: [
    "--use-fake-device-for-media-stream",
    "--use-fake-ui-for-media-stream",
    "--autoplay-policy=no-user-gesture-required",
  ],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  permissions: ["microphone"],
});
page.setDefaultTimeout(15000);
const state = structuredClone(initialState),
  checks: string[] = [],
  errors: string[] = [];
page.on("pageerror", (e) => errors.push(e.message));
let unavailable = false,
  sessionRequests = 0;
await page.route("**/api/**", async (route) => {
  const path = new URL(route.request().url()).pathname;
  if (path === "/api/status") {
    if (unavailable) {
      await route.abort("failed");
      return;
    }
    await route.fulfill({
      json: {
        production: true,
        mode: "live",
        demoEnabled: false,
        configured: true,
        agentReady: true,
        operatorRequired: true,
        operatorAuthenticated: true,
        workspaceStorage: "postgres",
      },
    });
    return;
  }
  if (path === "/api/agents") {
    await route.fulfill({
      json: { agents: [{ id: "agent_fixture", name: "Nora fixture" }] },
    });
    return;
  }
  if (path === "/api/state") {
    await route.fulfill({ json: state });
    return;
  }
  if (path === "/api/agent/session") {
    sessionRequests++;
    await route.fulfill({
      json: {
        signedUrl:
          "wss://api.elevenlabs.io/v1/convai/conversation?agent_id=fixture&conversation_signature=fixture",
      },
    });
    return;
  }
  if (path === "/api/sessions") {
    const session = route.request().postDataJSON();
    state.sessions = state.sessions.filter((s) => s.id !== session.id);
    state.sessions.unshift(session);
    await route.fulfill({ json: { saved: true } });
    return;
  }
  await route.fulfill({
    status: 404,
    json: { error: "Unexpected fixture route" },
  });
});
await page.routeWebSocket(/elevenlabs\.io/, (ws) => {
  ws.onMessage((message) => {
    const data = JSON.parse(String(message));
    if (data.type === "conversation_initiation_client_data") {
      ws.send(
        JSON.stringify({
          type: "conversation_initiation_metadata",
          conversation_initiation_metadata_event: {
            conversation_id: "conv_fixture",
            agent_output_audio_format: "pcm_16000",
            user_input_audio_format: "pcm_16000",
          },
        }),
      );
      setTimeout(() => {
        ws.send(
          JSON.stringify({
            type: "user_transcript",
            user_transcription_event: {
              user_transcript: "Synthetic fixture question",
            },
          }),
        );
        ws.send(
          JSON.stringify({
            type: "agent_response",
            agent_response_event: {
              agent_response: "Fixture response only; not a real AI result.",
            },
          }),
        );
      }, 200);
    }
  });
});
try {
  await page.goto(
    (process.env.DEMO_URL || "http://127.0.0.1:5187") + "/#voice-agents",
  );
  await page
    .getByRole("button", { name: "Start live voice", exact: true })
    .waitFor();
  await page
    .getByRole("combobox", { name: "Voice agent", exact: true })
    .selectOption("agent_fixture");
  await page
    .getByRole("textbox", { name: "Message Nora" })
    .fill("Should never call demo");
  assert.equal(
    await page
      .getByRole("button", { name: "Send message", exact: true })
      .isDisabled(),
    true,
  );
  checks.push(
    "Production text UI cannot invoke deterministic chat before live connection",
  );
  await page
    .getByRole("button", { name: "Start live voice", exact: true })
    .click();
  await page
    .getByRole("button", { name: "End voice session", exact: true })
    .waitFor();
  await page
    .getByText("Fixture response only; not a real AI result.", { exact: true })
    .waitFor();
  assert.equal(sessionRequests, 1);
  checks.push(
    "Actual SDK establishes fixture WebSocket using synthetic microphone and receives transcript",
  );
  await page.getByRole("button", { name: /Mute microphone|Mute mic/ }).click();
  checks.push("Microphone mute control exercised through SDK");
  await page
    .getByRole("button", { name: "End voice session", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start live voice", exact: true })
    .waitFor();
  await page.waitForFunction(() => true);
  for (let i = 0; i < 30 && !state.sessions.length; i++)
    await page.waitForTimeout(100);
  assert.ok(
    state.sessions.some((s) => s.mode === "live" && s.messages.length === 2),
  );
  checks.push(
    "Ending session persists client-reported transcript through API fixture",
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Conversations", exact: true })
    .click();
  await page
    .getByText("Fixture response only; not a real AI result.", { exact: true })
    .waitFor();
  checks.push(
    "Transcript survives page refresh via API fixture (real PostgreSQL verified separately)",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  checks.push("Mobile page has no horizontal overflow");
  unavailable = true;
  await page.reload();
  await page
    .getByText(
      "Backend unavailable. Your workspace has not been replaced with browser demo data.",
      { exact: true },
    )
    .waitFor();
  checks.push("Unavailable backend fails closed without browser demo fallback");
  assert.deepEqual(errors, []);
  mkdirSync("var", { recursive: true });
  writeFileSync(
    "var/production-browser.json",
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        scope:
          "Mock provider/WebSocket and API; synthetic microphone; no paid request; not real-provider verification",
        checks,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ checks, errors }, null, 2));
} catch (e) {
  mkdirSync("var", { recursive: true });
  await page.screenshot({
    path: "var/production-browser-failure.png",
    fullPage: true,
  });
  throw e;
} finally {
  await browser.close();
}
