import { describe, expect, it } from "vitest";
import { applyOp, loadRoom, peekRoom } from "./apply-op";
import { OpError } from "./errors";
import { MemoryStore } from "./memory-store";
import {
  FIXTURE_OPT_SHIP,
  FIXTURE_PACKET_ID,
  FIXTURE_ROOM_ID,
  type Op,
} from "./types";

function store() {
  return new MemoryStore();
}

describe("applyOp", () => {
  it("seeds the fixture room on first load", async () => {
    const db = store();
    const room = await loadRoom(db, FIXTURE_ROOM_ID);
    expect(room?.packets[0]?.question).toMatch(/Ship the checkout rewrite/);
    const again = await db.getRoom(FIXTURE_ROOM_ID);
    expect(again?.id).toBe(FIXTURE_ROOM_ID);
  });

  it("peekRoom does not persist the fixture", async () => {
    const db = store();
    const peeked = await peekRoom(db, FIXTURE_ROOM_ID);
    expect(peeked?.packets[0]?.question).toMatch(/Ship the checkout rewrite/);
    expect(await db.getRoom(FIXTURE_ROOM_ID)).toBeNull();
  });

  it("rejects get_workspace as a mutating op", async () => {
    await expect(
      applyOp(store(), {
        roomId: FIXTURE_ROOM_ID,
        seat: "owner",
        op: "get_workspace" as unknown as Op,
        input: {},
      }),
    ).rejects.toMatchObject({ code: "unknown_op" });
  });

  it("rejects owner ops on the contributor seat", async () => {
    const db = store();
    for (const [op, input] of [
      ["propose_option", { packetId: FIXTURE_PACKET_ID, label: "Hold" }],
      ["attach_evidence", { packetId: FIXTURE_PACKET_ID, text: "A note" }],
      ["edit_doc", { markdown: "# Changed" }],
      ["open_decision", { question: "A new question?" }],
    ] as const) {
      await expect(
        applyOp(db, {
          roomId: FIXTURE_ROOM_ID,
          seat: "contributor",
          op,
          input,
        }),
      ).rejects.toMatchObject({ code: "wrong_seat" });
    }
  });

  it("rejects contributor-only ops on the owner seat", async () => {
    const db = store();
    for (const [op, input] of [
      ["challenge", { packetId: FIXTURE_PACKET_ID, text: "A challenge" }],
      ["request_evidence", { packetId: FIXTURE_PACKET_ID, what: "A source" }],
    ] as const) {
      await expect(
        applyOp(db, {
          roomId: FIXTURE_ROOM_ID,
          seat: "owner",
          op,
          input,
        }),
      ).rejects.toMatchObject({ code: "wrong_seat" });
    }
  });

  it("lets the owner propose an option", async () => {
    const db = store();
    const out = await applyOp(db, {
      roomId: FIXTURE_ROOM_ID,
      seat: "owner",
      op: "propose_option",
      input: { packetId: FIXTURE_PACKET_ID, label: "Ship Tuesday", body: "Earlier cut." },
    });
    expect(out.ok).toBe(true);
    expect(out.room.packets[0]?.options.some((o) => o.label === "Ship Tuesday")).toBe(true);
    expect(out.room.log[0]?.op).toBe("propose_option");
  });

  it("lets the contributor challenge", async () => {
    const db = store();
    const out = await applyOp(db, {
      roomId: FIXTURE_ROOM_ID,
      seat: "contributor",
      op: "challenge",
      input: { packetId: FIXTURE_PACKET_ID, text: "Fraud review is still open." },
    });
    expect(out.room.packets[0]?.challenges).toHaveLength(1);
  });

  it("lets the owner rename the room, trimmed and capped", async () => {
    const out = await applyOp(store(), {
      roomId: FIXTURE_ROOM_ID,
      seat: "owner",
      op: "rename_room",
      input: { title: "  Checkout rewrite v2  " },
    });
    expect(out.room.title).toBe("Checkout rewrite v2");
    expect(out.room.log.at(-1)).toMatchObject({
      op: "rename_room",
      summary: "Renamed the room: Checkout rewrite v2",
    });
  });

  it("rejects rename_room on the contributor seat", async () => {
    await expect(
      applyOp(store(), {
        roomId: FIXTURE_ROOM_ID,
        seat: "contributor",
        op: "rename_room",
        input: { title: "Hostile rename" },
      }),
    ).rejects.toMatchObject({ code: "wrong_seat" });
  });

  it("rejects rename_room with an empty title", async () => {
    await expect(
      applyOp(store(), {
        roomId: FIXTURE_ROOM_ID,
        seat: "owner",
        op: "rename_room",
        input: { title: "   " },
      }),
    ).rejects.toMatchObject({ code: "not_found" });
  });

  it("lets the owner edit the document", async () => {
    const out = await applyOp(store(), {
      roomId: FIXTURE_ROOM_ID,
      seat: "owner",
      op: "edit_doc",
      input: { markdown: "  # Revised plan\n\nShip safely.  " },
    });
    expect(out.room.docMarkdown).toBe("# Revised plan\n\nShip safely.");
    expect(out.room.log.at(-1)).toMatchObject({
      op: "edit_doc",
      summary: "Edited the document",
    });
  });

  it("lets the owner open an empty decision", async () => {
    const out = await applyOp(store(), {
      roomId: FIXTURE_ROOM_ID,
      seat: "owner",
      op: "open_decision",
      input: { question: "  Which launch window?  " },
    });
    const packet = out.room.packets.at(-1);
    expect(packet).toMatchObject({
      question: "Which launch window?",
      status: "open",
      options: [],
      evidence: [],
      challenges: [],
      requests: [],
      comments: [],
    });
    expect(packet?.id).toMatch(/^pkt-/);
    expect(out.result.packetId).toBe(packet?.id);
    expect(out.room.log.at(-1)?.summary).toBe("Opened decision: Which launch window?");
  });

  it.each(["owner", "contributor"] as const)(
    "lets the %s comment on an open packet",
    async (seat) => {
      const out = await applyOp(store(), {
        roomId: FIXTURE_ROOM_ID,
        seat,
        op: "comment",
        input: { packetId: FIXTURE_PACKET_ID, text: "  This needs a rollout note.  " },
      });
      expect(out.room.packets[0]?.comments).toEqual([
        expect.objectContaining({
          text: "This needs a rollout note.",
          authorSeat: seat,
        }),
      ]);
      expect(out.room.packets[0]?.comments[0]?.id).toMatch(/^cm-/);
      expect(out.room.log.at(-1)).toMatchObject({
        op: "comment",
        summary: "Commented: This needs a rollout note.",
      });
    },
  );

  it("fails decide without a token", async () => {
    const db = store();
    await expect(
      applyOp(db, {
        roomId: FIXTURE_ROOM_ID,
        seat: "contributor",
        op: "decide",
        input: { packetId: FIXTURE_PACKET_ID, optionId: FIXTURE_OPT_SHIP },
      }),
    ).rejects.toBeInstanceOf(OpError);
    await expect(
      applyOp(db, {
        roomId: FIXTURE_ROOM_ID,
        seat: "contributor",
        op: "decide",
        input: { packetId: FIXTURE_PACKET_ID, optionId: FIXTURE_OPT_SHIP },
      }),
    ).rejects.toMatchObject({ code: "needs_human_decide" });
  });

  it("lets the owner decide with a human token", async () => {
    const db = store();
    const token = await db.mintDecideToken({
      roomId: FIXTURE_ROOM_ID,
      packetId: FIXTURE_PACKET_ID,
      optionId: FIXTURE_OPT_SHIP,
    });
    const out = await applyOp(db, {
      roomId: FIXTURE_ROOM_ID,
      seat: "owner",
      op: "decide",
      input: { packetId: FIXTURE_PACKET_ID, optionId: FIXTURE_OPT_SHIP },
      decideToken: token,
    });
    expect(out.room.packets[0]?.status).toBe("decided");
    expect(out.room.packets[0]?.decision?.decidedBySeat).toBe("owner");
  });

  it("freezes the packet when decide consumes a matching token", async () => {
    const db = store();
    const token = await db.mintDecideToken({
      roomId: FIXTURE_ROOM_ID,
      packetId: FIXTURE_PACKET_ID,
      optionId: FIXTURE_OPT_SHIP,
    });
    const out = await applyOp(db, {
      roomId: FIXTURE_ROOM_ID,
      seat: "contributor",
      op: "decide",
      input: { packetId: FIXTURE_PACKET_ID, optionId: FIXTURE_OPT_SHIP },
      decideToken: token,
    });
    expect(out.room.packets[0]?.status).toBe("decided");
    expect(out.room.packets[0]?.decision?.optionId).toBe(FIXTURE_OPT_SHIP);
    const reloaded = await db.getRoom(FIXTURE_ROOM_ID);
    expect(reloaded?.packets[0]?.status).toBe("decided");
  });

  it("rejects a second decide after freeze", async () => {
    const db = store();
    const token = await db.mintDecideToken({
      roomId: FIXTURE_ROOM_ID,
      packetId: FIXTURE_PACKET_ID,
      optionId: FIXTURE_OPT_SHIP,
    });
    await applyOp(db, {
      roomId: FIXTURE_ROOM_ID,
      seat: "contributor",
      op: "decide",
      input: { packetId: FIXTURE_PACKET_ID, optionId: FIXTURE_OPT_SHIP },
      decideToken: token,
    });
    const token2 = await db.mintDecideToken({
      roomId: FIXTURE_ROOM_ID,
      packetId: FIXTURE_PACKET_ID,
      optionId: FIXTURE_OPT_SHIP,
    });
    await expect(
      applyOp(db, {
        roomId: FIXTURE_ROOM_ID,
        seat: "contributor",
        op: "decide",
        input: { packetId: FIXTURE_PACKET_ID, optionId: FIXTURE_OPT_SHIP },
        decideToken: token2,
      }),
    ).rejects.toMatchObject({ code: "packet_frozen" });
  });

  it("consumes a decide token only once", async () => {
    const db = store();
    const token = await db.mintDecideToken({
      roomId: FIXTURE_ROOM_ID,
      packetId: FIXTURE_PACKET_ID,
      optionId: FIXTURE_OPT_SHIP,
    });
    await applyOp(db, {
      roomId: FIXTURE_ROOM_ID,
      seat: "contributor",
      op: "decide",
      input: { packetId: FIXTURE_PACKET_ID, optionId: FIXTURE_OPT_SHIP },
      decideToken: token,
    });
    expect(await db.consumeDecideToken(token)).toBeNull();
  });

  it.each(["owner", "contributor"] as const)(
    "lets the %s assign a task to either seat",
    async (seat) => {
      const out = await applyOp(store(), {
        roomId: FIXTURE_ROOM_ID,
        seat,
        op: "add_task",
        input: { text: "  Pull the load-test numbers  ", assignee: "owner" },
      });
      expect(out.ok).toBe(true);
      const task = out.room.tasks.at(-1);
      expect(task).toMatchObject({
        text: "Pull the load-test numbers",
        assignee: "owner",
        done: false,
      });
      expect(task?.id).toMatch(/^task-/);
      expect(out.result.taskId).toBe(task?.id);
      expect(out.room.log.at(-1)).toMatchObject({
        op: "add_task",
        summary: "Task for owner: Pull the load-test numbers",
      });
    },
  );

  it("rejects add_task without a valid assignee", async () => {
    await expect(
      applyOp(store(), {
        roomId: FIXTURE_ROOM_ID,
        seat: "owner",
        op: "add_task",
        input: { text: "Do something", assignee: "the-intern" },
      }),
    ).rejects.toMatchObject({ code: "not_found" });
  });

  it("rejects add_task without text", async () => {
    await expect(
      applyOp(store(), {
        roomId: FIXTURE_ROOM_ID,
        seat: "owner",
        op: "add_task",
        input: { text: "   ", assignee: "owner" },
      }),
    ).rejects.toMatchObject({ code: "not_found" });
  });

  it("toggles a task done and back, logged both times", async () => {
    const db = store();
    const added = await applyOp(db, {
      roomId: FIXTURE_ROOM_ID,
      seat: "contributor",
      op: "add_task",
      input: { text: "Review the rollout plan", assignee: "contributor" },
    });
    const taskId = added.result.taskId!;

    const completed = await applyOp(db, {
      roomId: FIXTURE_ROOM_ID,
      seat: "contributor",
      op: "complete_task",
      input: { taskId },
    });
    expect(completed.room.tasks.find((t) => t.id === taskId)?.done).toBe(true);
    expect(completed.room.log.at(-1)?.summary).toBe(
      "Completed: Review the rollout plan",
    );

    const reopened = await applyOp(db, {
      roomId: FIXTURE_ROOM_ID,
      seat: "owner",
      op: "complete_task",
      input: { taskId },
    });
    expect(reopened.room.tasks.find((t) => t.id === taskId)?.done).toBe(false);
    expect(reopened.room.log.at(-1)?.summary).toBe(
      "Reopened: Review the rollout plan",
    );
  });

  it("rejects complete_task for an unknown task", async () => {
    await expect(
      applyOp(store(), {
        roomId: FIXTURE_ROOM_ID,
        seat: "owner",
        op: "complete_task",
        input: { taskId: "task-nope" },
      }),
    ).rejects.toMatchObject({ code: "not_found" });
  });

  it("tasks work on a frozen packet room — they are room-level", async () => {
    const db = store();
    const token = await db.mintDecideToken({
      roomId: FIXTURE_ROOM_ID,
      packetId: FIXTURE_PACKET_ID,
      optionId: FIXTURE_OPT_SHIP,
    });
    await applyOp(db, {
      roomId: FIXTURE_ROOM_ID,
      seat: "owner",
      op: "decide",
      input: { packetId: FIXTURE_PACKET_ID, optionId: FIXTURE_OPT_SHIP },
      decideToken: token,
    });
    const out = await applyOp(db, {
      roomId: FIXTURE_ROOM_ID,
      seat: "owner",
      op: "add_task",
      input: { text: "Write the retro notes", assignee: "contributor" },
    });
    expect(out.ok).toBe(true);
  });
});
