import { z } from "zod";
import type { State } from "./domain";
const text = z.string().max(10000),
  timestamp = z.iso.datetime();
const schema = z.object({
  shipments: z
    .array(
      z.object({
        id: z.string().min(1),
        customer: text,
        route: text,
        vessel: text,
        status: z.enum([
          "Ready for pickup",
          "Customs hold",
          "At sea",
          "Gate booked",
        ]),
        eta: text,
        terminal: text,
        reference: text,
        x: z.number().min(0).max(100),
        y: z.number().min(0).max(100),
      }),
    )
    .min(1)
    .max(1000),
  tickets: z
    .array(
      z.object({
        id: text,
        shipmentId: text,
        reason: text,
        status: z.enum(["Pending review", "Approved", "Rejected"]),
        createdAt: timestamp,
      }),
    )
    .max(1000),
  sessions: z
    .array(
      z.object({
        id: z.uuid(),
        mode: z.enum(["demo", "live"]),
        startedAt: timestamp,
        language: z.string().max(10),
        messages: z
          .array(
            z.object({
              role: z.enum(["user", "agent"]),
              text,
              source: text.optional(),
            }),
          )
          .max(500),
      }),
    )
    .max(100),
  audit: z.array(z.object({ id: text, action: text, at: timestamp })).max(300),
});
export function restoreWorkspace(raw: string): State | null {
  try {
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
