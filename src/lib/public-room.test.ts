import { describe, expect, it } from "vitest";
import { publicRoom } from "./public-room";
import type { Room } from "./types";

function room(overrides: Partial<Room> = {}): Room {
  return {
    id: "r1",
    title: "T",
    docMarkdown: "hi",
    ownerTokenHash: "deadbeef",
    packets: [],
    tasks: [],
    parties: [],
    log: [],
    nextSeq: 1,
    ...overrides,
  };
}

describe("publicRoom", () => {
  it("omits ownerTokenHash without mutating the original", () => {
    const original = room();
    const out = publicRoom(original);
    expect(out.ownerTokenHash).toBeUndefined();
    expect("ownerTokenHash" in out).toBe(false);
    expect(original.ownerTokenHash).toBe("deadbeef");
    expect(out.docMarkdown).toBe("hi");
    expect(out.id).toBe("r1");
  });
});
