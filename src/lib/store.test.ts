import { describe, expect, it } from "vitest";
import { MemoryStore } from "./memory-store";
import type { Room } from "./types";

function emptyRoom(): Room {
  return {
    id: "r",
    title: "T",
    docMarkdown: "",
    packets: [],
    tasks: [],
    parties: [],
    log: [],
    nextSeq: 1,
  };
}

describe("MemoryStore tokens", () => {
  it("GETDEL analog: second consume is null", async () => {
    const db = new MemoryStore();
    const token = await db.mintDecideToken({
      roomId: "r",
      packetId: "p",
      optionId: "o",
    });
    const first = await db.consumeDecideToken(token);
    const second = await db.consumeDecideToken(token);
    expect(first).toEqual({ roomId: "r", packetId: "p", optionId: "o" });
    expect(second).toBeNull();
  });

  it("takes a human nonce only once", async () => {
    const db = new MemoryStore();
    const nonce = await db.issueHumanNonce("r");
    expect(await db.takeHumanNonce("r", nonce)).toBe(true);
    expect(await db.takeHumanNonce("r", nonce)).toBe(false);
  });
});

describe("MemoryStore parties overlay", () => {
  it("keeps putParties when a later putRoom writes stale parties", async () => {
    const db = new MemoryStore();
    await db.putRoom("r", emptyRoom());
    await db.putParties("r", [
      { id: "p1", seat: "owner", lastSeenAt: "2026-09-01T12:00:00.000Z" },
    ]);

    const stale = await db.getRoom("r");
    expect(stale?.parties).toHaveLength(1);
    await db.putRoom("r", {
      ...stale!,
      docMarkdown: "updated brief",
      parties: [],
    });

    const next = await db.getRoom("r");
    expect(next?.docMarkdown).toBe("updated brief");
    expect(next?.parties).toEqual([
      { id: "p1", seat: "owner", lastSeenAt: "2026-09-01T12:00:00.000Z" },
    ]);
  });
});
