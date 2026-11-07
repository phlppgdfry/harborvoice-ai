import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { initialState } from "../src/domain.js";
import { mkdirSync, writeFileSync } from "node:fs";
const browser = await chromium.launch({
  headless: true,
  channel: process.env.BROWSER_CHANNEL || "chrome",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
page.setDefaultTimeout(15000);
const errors: string[] = [];
page.on("pageerror", (e) => errors.push(e.message));
// Keep demo QA isolated from local account credentials; billable flows use explicit fixtures below.
await page.route("**/api/status", (route) =>
  route.fulfill({
    json: { mode: "demo", configured: false, agentReady: false },
  }),
);
const checks: string[] = [];
const log = checks.push.bind(checks);
checks.push = (...items: string[]) => {
  console.log(items.join("\n"));
  return log(...items);
};
try {
  await page.goto(process.env.DEMO_URL || "http://127.0.0.1:5173");
  await page
    .getByRole("heading", { name: "Voice operations. All in view." })
    .waitFor();
  await page
    .getByRole("button", { name: "Select HV-2049", exact: true })
    .click();
  await page.getByRole("textbox", { name: "Find a shipment" }).fill("Meridian");
  assert.equal(await page.locator("tbody tr").count(), 1);
  await page.getByRole("textbox", { name: "Find a shipment" }).fill("");
  checks.push("Terminal map selection and shipment search");
  mkdirSync("docs/screenshots", { recursive: true });
  await page.screenshot({
    path: "docs/screenshots/overview.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Voice agents", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Message Nora" })
    .fill("Where is HV-2048?");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page.getByText("HV-2048 is customs hold at").waitFor();
  checks.push("Grounded shipment conversation");
  await page
    .getByRole("combobox", { name: "Conversation language" })
    .selectOption("nl");
  await page
    .getByRole("textbox", { name: "Message Nora" })
    .fill("Waar is HV-2049?");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page
    .getByText("De geregistreerde verwachte aankomst", { exact: false })
    .waitFor();
  checks.push("Dutch conversation");
  await page
    .getByRole("textbox", { name: "Message Nora" })
    .fill("Escalate HV-2048 to an operator");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page.getByText("Ik heb een escalatie", { exact: false }).waitFor();
  await page.getByRole("button", { name: /^Workflows/ }).click();
  await page.getByRole("button", { name: "Approve escalation" }).click();
  await page
    .getByText("Escalation approved. Shipment status is unchanged.")
    .waitFor();
  checks.push("Escalation proposal, operator review and unchanged shipment");
  await page.getByRole("button", { name: "Evaluations", exact: true }).click();
  await page.getByRole("button", { name: "Run demo checks" }).click();
  await page.getByRole("heading", { name: "6 / 6 checks passed" }).waitFor();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export evidence" }).click();
  const download = await downloadPromise;
  assert.match(download.suggestedFilename(), /evaluation.json/);
  checks.push("Evaluation suite and JSON evidence export");
  await page
    .getByRole("button", { name: "Conversations", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Transcript", exact: true })
    .waitFor();
  assert.ok(await page.getByText("Where is HV-2048?", { exact: true }).count());
  checks.push("Persisted session transcript");
  for (const tab of ["Audio studio", "Knowledge base", "Settings"]) {
    await page.getByRole("button", { name: tab, exact: true }).click();
    await page.getByRole("heading", { name: tab, exact: true }).waitFor();
  }
  checks.push("All workspace pages render");
  await page
    .getByRole("button", { name: "Experience lab", exact: true })
    .click();
  await page
    .getByRole("heading", {
      name: "Hear what HarborVoice can do.",
      exact: true,
    })
    .waitFor();
  const audio = page.getByLabel("Selected demo audio");
  await audio.evaluate(async (element: HTMLAudioElement) => {
    if (element.readyState < 1)
      await new Promise<void>((resolve, reject) => {
        element.addEventListener("loadedmetadata", () => resolve(), {
          once: true,
        });
        element.addEventListener(
          "error",
          () => reject(Error("Public media did not decode")),
          { once: true },
        );
      });
    if (!Number.isFinite(element.duration) || element.duration <= 0)
      throw Error("Invalid public audio duration");
  });
  for (const name of [
    "Music",
    "Sound effects",
    "Transformations",
    "Voiceover",
  ]) {
    await page.getByRole("tab", { name, exact: true }).click();
    await page
      .getByRole("tabpanel", { name: `${name} examples`, exact: true })
      .waitFor();
  }
  await page.getByRole("status").waitFor({ state: "hidden" });
  await page.screenshot({
    path: "docs/screenshots/experience-lab.png",
    fullPage: true,
  });
  checks.push(
    "Public Experience lab audio decodes without operator login; comparison categories render",
  );
  await page.getByRole("button", { name: "Audio studio", exact: true }).click();
  await page.getByRole("tab", { name: "Music", exact: true }).click();
  assert.ok(
    (
      await page
        .getByRole("textbox", { name: "Describe the sound" })
        .inputValue()
    ).includes("Calm, modern"),
  );
  assert.equal(
    await page
      .getByRole("button", { name: "Generate with ElevenLabs" })
      .isEnabled(),
    false,
  );
  await page
    .getByRole("tab", { name: "Music", exact: true })
    .press("ArrowRight");
  await page.getByRole("tab", { name: "Voice changer", exact: true }).waitFor();
  assert.equal(
    await page
      .getByRole("tab", { name: "Voice changer", exact: true })
      .getAttribute("aria-selected"),
    "true",
  );
  await page.getByRole("status").waitFor({ state: "hidden" });
  await page.screenshot({
    path: "docs/screenshots/audio-studio.png",
    fullPage: true,
  });
  await page.reload();
  await page
    .getByRole("heading", { name: "Audio studio", exact: true })
    .waitFor();
  checks.push(
    "Audio tools have contextual defaults, keyboard navigation and disabled generation without credentials; deep link survives reload",
  );

  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("status").waitFor({ state: "hidden" });
  await page.screenshot({
    path: "docs/screenshots/mobile.png",
    fullPage: true,
  });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  checks.push("Mobile layout has no page-level horizontal overflow");
  assert.ok(
    await page
      .getByRole("button", { name: "Voice agents", exact: true })
      .locator(".nav-name")
      .evaluate((e) => parseFloat(getComputedStyle(e).fontSize) > 0),
  );
  checks.push("Mobile navigation has visible labels and accessible names");
  const fixturePage = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  fixturePage.setDefaultTimeout(15000);
  fixturePage.on("pageerror", (e) => errors.push(e.message));
  const dispatched: string[] = [];
  await fixturePage.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace("/api", "");
    const json = (body: unknown) => route.fulfill({ json: body });
    if (path === "/status")
      return json({ mode: "live", configured: true, agentReady: false });
    if (path === "/state") return json(initialState);
    if (path === "/voices")
      return json({
        voices: [{ voiceId: "fixture-voice", name: "Fixture voice" }],
      });
    if (path.startsWith("/audio/")) {
      dispatched.push(path);
      if (path.endsWith("dubbing"))
        return json({ dubbingId: "dub-fixture", expectedDurationSec: 1 });
      if (path.endsWith("transcribe"))
        return json({ text: "Fixture transcript", words: [] });
      if (path.endsWith("align"))
        return json({ words: [{ text: "Cargo", start: 0, end: 1, loss: 0 }] });
      return route.fulfill({
        contentType: "audio/mpeg",
        body: Buffer.from([73, 68, 51, 0]),
      });
    }
    if (path === "/dubbing/dub-fixture")
      return json({ status: "dubbed", targetLanguages: ["nl"] });
    if (path === "/dubbing/dub-fixture/audio/nl")
      return route.fulfill({
        contentType: "audio/mpeg",
        body: Buffer.from([73, 68, 51, 0]),
      });
    return route.fulfill({
      status: 404,
      json: { error: "Unknown fixture route" },
    });
  });
  await fixturePage.goto(process.env.DEMO_URL || "http://127.0.0.1:5173");
  await fixturePage
    .getByRole("button", { name: "Audio studio", exact: true })
    .click();
  for (const [name, id] of [
    ["Text to speech", "speech"],
    ["Speech to text", "transcribe"],
    ["Sound effects", "effects"],
    ["Voice isolation", "isolate"],
    ["Dubbing", "dubbing"],
    ["Music", "music"],
    ["Voice changer", "change"],
    ["Forced alignment", "align"],
  ]) {
    await fixturePage.getByRole("tab", { name, exact: true }).click();
    if (["transcribe", "isolate", "dubbing", "change", "align"].includes(id))
      await fixturePage.getByLabel("Audio recording").setInputFiles({
        name: "fixture.wav",
        mimeType: "audio/wav",
        buffer: Buffer.from("RIFF0000WAVE"),
      });
    if (id === "align")
      await fixturePage
        .getByRole("textbox", { name: "Exact transcript" })
        .fill("Cargo");
    await fixturePage
      .getByRole("button", { name: "Generate with ElevenLabs" })
      .click();
    if (["transcribe", "dubbing", "align"].includes(id))
      await fixturePage
        .getByRole("button", { name: "Export result" })
        .waitFor();
    else
      await fixturePage
        .getByRole("link", { name: "Download audio", exact: true })
        .waitFor();
    if (id === "dubbing") {
      assert.equal(
        await fixturePage
          .getByRole("textbox", { name: "Dubbing job ID" })
          .inputValue(),
        "dub-fixture",
      );
      await fixturePage
        .getByRole("button", { name: "Check job status" })
        .click();
      await fixturePage
        .getByRole("button", { name: "Load completed dub" })
        .click();
      await fixturePage
        .getByRole("link", { name: "Download dub", exact: true })
        .waitFor();
    }
  }
  assert.equal(dispatched.length, 8);
  await fixturePage.close();
  checks.push(
    "All eight studio forms and completed-dub download exercised with explicitly mocked provider responses (no real audio generation)",
  );
  assert.deepEqual(errors, []);
  checks.push("No browser runtime errors");
  writeFileSync(
    "docs/browser-verification.json",
    JSON.stringify(
      {
        at: new Date().toISOString(),
        url: process.env.DEMO_URL || "http://127.0.0.1:5173",
        checks,
        errors,
        liveElevenLabsTested: false,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ checks, errors }, null, 2));
} catch (e) {
  console.log(await page.locator("body").innerText());
  await page.screenshot({ path: "var/browser-failure.png", fullPage: true });
  throw e;
} finally {
  await browser.close();
}
