import { describe, expect, it } from "vitest";
import { partiesPresenceSignature, roomPollSignature } from "./room-dirty";
import type { Packet, Room } from "./types";

function room(over: Partial<Room> = {}): Room {
  return {
    id: "r1",
    title: "T",
    docMarkdown: "hello",
    packets: [],
    tasks: [],
    log: [],
    nextSeq: 1,
    parties: [],
    ...over,
  };
}

function openPacket(over: Partial<Packet> = {}): Packet {
  return {
    id: "pkt-1",
    question: "Q",
    status: "open",
    options: [],
    evidence: [],
    challenges: [],
    requests: [],
    comments: [],
    ...over,
  };
}

describe("partiesPresenceSignature", () => {
  it("ignores party order", () => {
    const a = {
      id: "b",
      seat: "owner" as const,
      lastSeenAt: "t1",
      lastActor: "human" as const,
    };
    const b = {
      id: "a",
      seat: "contributor" as const,
      lastSeenAt: "t2",
    };
    expect(partiesPresenceSignature([a, b])).toBe(partiesPresenceSignature([b, a]));
  });

  it("changes when lastSeen or lastActor changes", () => {
    const base = { id: "p1", seat: "owner" as const, lastSeenAt: "t1" };
    expect(partiesPresenceSignature([base])).not.toBe(
      partiesPresenceSignature([{ ...base, lastSeenAt: "t2" }]),
    );
    expect(partiesPresenceSignature([base])).not.toBe(
      partiesPresenceSignature([{ ...base, lastActor: "agent" }]),
    );
  });
});

describe("roomPollSignature", () => {
  it("is stable when only unused fields churn", () => {
    const a = room({ log: [{ seq: 1, at: "t", seat: "owner", op: "edit_doc", summary: "x" }] });
    const b = room({ log: [] });
    expect(roomPollSignature(a)).toBe(roomPollSignature(b));
  });

  it("changes on nextSeq, title, doc length, tasks done, open option count", () => {
    const base = room({
      packets: [openPacket({ options: [{ id: "o1", label: "A", body: "", authorSeat: "owner" }] })],
      tasks: [{ id: "t1", text: "x", assignee: "owner", done: false, at: "t" }],
    });
    expect(roomPollSignature({ ...base, nextSeq: 2 })).not.toBe(roomPollSignature(base));
    expect(roomPollSignature({ ...base, title: "Other" })).not.toBe(roomPollSignature(base));
    expect(roomPollSignature({ ...base, docMarkdown: "hello!" })).not.toBe(roomPollSignature(base));
    expect(
      roomPollSignature({
        ...base,
        tasks: [{ id: "t1", text: "x", assignee: "owner", done: true, at: "t" }],
      }),
    ).not.toBe(roomPollSignature(base));
    expect(
      roomPollSignature({
        ...base,
        packets: [
          openPacket({
            options: [
              { id: "o1", label: "A", body: "", authorSeat: "owner" },
              { id: "o2", label: "B", body: "", authorSeat: "owner" },
            ],
          }),
        ],
      }),
    ).not.toBe(roomPollSignature(base));
  });
});
