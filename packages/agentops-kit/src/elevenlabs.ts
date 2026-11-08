/** Structural SDK adapter: inject the official server-side client, never a browser key. */
import { inspect, type Config } from "./index.js";
export interface AgentReader {
  conversationalAi: { agents: { get(id: string): Promise<unknown> } };
}
export async function inspectElevenLabs(client: AgentReader, id: string) {
  if (!/^agent_[a-zA-Z0-9]+$/.test(id))
    throw Error("Expected a documented agent identifier.");
  const raw = await client.conversationalAi.agents.get(id);
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw Error("Invalid provider configuration.");
  // JSON normalization rejects non-JSON SDK values and preserves provider field names.
  return inspect(JSON.parse(JSON.stringify(raw)) as Config);
}

export type NativeInvocation = { id: string; testRuns: unknown[] };
export interface NativeTestsClient {
  conversationalAi: {
    agents: {
      runTests(
        agentId: string,
        request: {
          branchId: string;
          repeatCount: number;
          tests: { testId: string }[];
        },
      ): Promise<NativeInvocation>;
    };
    tests: { invocations: { get(id: string): Promise<NativeInvocation> } };
  };
}
/** This is a caller integration contract, not proof that a distributed lock exists. */
export interface AccountWideGuard {
  scope: "account-wide";
  withReservation<T>(
    operation: { key: string; estimate: number },
    dispatch: () => Promise<T>,
  ): Promise<T>;
  recordInvocation(operationKey: string, invocationId: string): Promise<void>;
}
/** Paid API adapter. No default guard, no CLI entrypoint, no retries or implicit polling. */
export async function submitNativeSuite(
  client: NativeTestsClient,
  request: {
    agentId: string;
    branchId: string;
    testIds: string[];
    repeats: number;
    operationKey: string;
    estimate: number;
  },
  guard?: AccountWideGuard,
): Promise<NativeInvocation> {
  if (!guard || guard.scope !== "account-wide")
    throw Error("Verified account-wide reservation integration is required.");
  if (
    !/^agent_[a-zA-Z0-9]+$/.test(request.agentId) ||
    !/^agtbrch_[a-zA-Z0-9]+$/.test(request.branchId)
  )
    throw Error("Explicit agent and isolated branch required.");
  if (
    !request.operationKey ||
    !Number.isFinite(request.estimate) ||
    request.estimate <= 0
  )
    throw Error("Unique operation key and conservative estimate required.");
  if (
    !Number.isInteger(request.repeats) ||
    request.repeats < 1 ||
    request.repeats > 2 ||
    request.testIds.length < 1 ||
    request.testIds.length > 12 ||
    new Set(request.testIds).size !== request.testIds.length ||
    request.testIds.some((id) => !id || id.length > 200)
  )
    throw Error("Require 1–12 unique test IDs and 1–2 repeats.");
  let dispatched = false;
  return guard.withReservation(
    { key: request.operationKey, estimate: request.estimate },
    async () => {
      if (dispatched)
        throw Error(
          "Dispatch already attempted; reconcile instead of retrying.",
        );
      dispatched = true;
      const invocation = await client.conversationalAi.agents.runTests(
        request.agentId,
        {
          branchId: request.branchId,
          repeatCount: request.repeats,
          tests: request.testIds.map((testId) => ({ testId })),
        },
      );
      if (!invocation.id)
        throw Error(
          "Missing provider invocation; retain hold and reconcile manually.",
        );
      await guard.recordInvocation(request.operationKey, invocation.id);
      return invocation;
    },
  );
}
export async function readNativeSuite(client: NativeTestsClient, id: string) {
  if (!id || id.length > 200)
    throw Error("A provider invocation ID is required.");
  return client.conversationalAi.tests.invocations.get(id);
}
