import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
  findShipment,
  proposeEscalation,
  decideTicket,
  demoReply,
  runEvaluations,
} from "../src/domain.js";
test("lookup requires an exact reference, supports case and whitespace", () => {
  const state = structuredClone(initialState);
  assert.equal(findShipment(state, " hv-2048 ")?.status, "Customs hold");
  assert.equal(findShipment(state, "HV-204"), undefined);
  assert.equal(findShipment(state, "NL-88204")?.id, "HV-2048");
});
test("unknown shipment cannot create an escalation", () => {
  const state = structuredClone(initialState);
  assert.throws(() =>
    proposeEscalation(state, "HV-9999", "Please investigate"),
  );
  assert.equal(state.tickets.length, 0);
});
test("escalation retries deduplicate and review does not release cargo", () => {
  const state = structuredClone(initialState);
  const first = proposeEscalation(
    state,
    "HV-2048",
    "Please investigate the customs hold",
  );
  const retry = proposeEscalation(state, "HV-2048", "Please investigate again");
  assert.equal(first.id, retry.id);
  assert.equal(state.tickets.length, 1);
  decideTicket(state, first.id, "Approved");
  assert.equal(state.shipments[0].status, "Customs hold");
  assert.equal(state.tickets[0].status, "Approved");
  assert.throws(() => decideTicket(state, first.id, "Rejected"));
});
test("unknown reference yields no invented status", () => {
  const reply = demoReply(structuredClone(initialState), "Where is HV-9999?");
  assert.match(reply.text, /could not find/);
  assert.doesNotMatch(reply.text, /ready for pickup|customs hold/);
});
test("supported languages return localized guidance", () => {
  for (const [language, needle] of [
    ["nl", "Welke zending"],
    ["fr", "Quel envoi"],
    ["de", "Welche Sendung"],
  ]) {
    assert.ok(
      demoReply(structuredClone(initialState), "Hello", language).text.includes(
        needle,
      ),
    );
  }
});
test("demo evaluation suite passes and identifies its scope", () => {
  const results = runEvaluations();
  assert.equal(results.length, 6);
  assert.ok(results.every((r) => r.passed));
  assert.ok(results.every((r) => r.scope.includes("not an LLM evaluation")));
});
