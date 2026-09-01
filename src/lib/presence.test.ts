import { describe, expect, it } from "vitest";
import { isPartyLive, liveParties, touchParty } from "./presence";
import type { Room } from "./types";

function emptyRoom(): Room {
  return {
    id: "r1",
    title: "T",
    docMarkdown: "",
    packets: [],
    tasks: [],
    log: [],
    nextSeq: 1,
    parties: [],
  };
}

describe("presence", () => {
  it("upserts a party and updates seat on revisit", () => {
    const room = emptyRoom();
    touchParty(room, "p1", "contributor", "2026-09-01T12:00:00.000Z");
    expect(room.parties).toHaveLength(1);
    expect(room.parties?.[0]?.seat).toBe("contributor");

    touchParty(room, "p1", "owner", "2026-09-01T12:00:30.000Z");
    expect(room.parties).toHaveLength(1);
    expect(room.parties?.[0]?.seat).toBe("owner");
    expect(room.parties?.[0]?.lastSeenAt).toBe("2026-09-01T12:00:30.000Z");
  });

  it("marks recent parties live", () => {
    const now = Date.parse("2026-09-01T12:00:45.000Z");
    const live = {
      id: "a",
      seat: "owner" as const,
      lastSeenAt: "2026-09-01T12:00:20.000Z",
    };
    const stale = {
      id: "b",
      seat: "contributor" as const,
      lastSeenAt: "2026-09-01T11:50:00.000Z",
    };
    expect(isPartyLive(live, now)).toBe(true);
    expect(isPartyLive(stale, now)).toBe(false);
    expect(liveParties([live, stale], now).map((p) => p.id)).toEqual(["a"]);
  });
});
