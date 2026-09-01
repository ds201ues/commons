import { describe, expect, it } from "vitest";
import { normalizeRoom } from "./normalize-room";
import type { Room } from "./types";

describe("normalizeRoom", () => {
  it("fills missing comments and coerces legacy seats", () => {
    const legacy = {
      id: "checkout-friday",
      title: "Checkout rewrite",
      docMarkdown: "",
      nextSeq: 2,
      log: [{ seq: 1, at: "2026-01-01T00:00:00.000Z", seat: "maker", op: "decide", summary: "x" }],
      packets: [
        {
          id: "pkt-checkout",
          question: "Ship?",
          status: "decided" as const,
          options: [
            { id: "a", label: "Yes", body: "", authorSeat: "maker" as unknown as "owner" },
          ],
          evidence: [],
          challenges: [],
          requests: [],
          decision: {
            optionId: "a",
            decidedBySeat: "decider" as unknown as "contributor",
            at: "2026-01-01T00:00:00.000Z",
          },
        },
      ],
    } as Room;

    const room = normalizeRoom(legacy);
    expect(room.packets[0]?.comments).toEqual([]);
    expect(room.log[0]?.seat).toBe("owner");
    expect(room.packets[0]?.options[0]?.authorSeat).toBe("owner");
    expect(room.packets[0]?.decision?.decidedBySeat).toBe("contributor");
  });
});
