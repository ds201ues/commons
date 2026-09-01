import { randomBytes } from "node:crypto";
import { OpError } from "./errors";
import { fixtureRoom, isFixtureRoomId } from "./fixture";
import { normalizeRoom } from "./normalize-room";
import type { RoomStore } from "./store";
import {
  ALL_OPS,
  CONTRIBUTOR_OPS,
  OWNER_OPS,
  normalizeSeat,
  type ApplyOpRequest,
  type ApplyOpSuccess,
  type Op,
  type Packet,
  type Room,
  type Task,
} from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}-${randomBytes(4).toString("hex")}`;
}

function requireText(input: Record<string, string>, key: string): string {
  const value = input[key]?.trim();
  if (!value) {
    throw new OpError("not_found", `Missing ${key}.`);
  }
  return value;
}

function healLegacyFixture(room: Room): Room {
  const normalized = normalizeRoom(room);
  if (!isFixtureRoomId(room.id)) return normalized;
  // Prod Redis still holds pre-docMarkdown fixture shells.
  if (normalized.docMarkdown) return normalized;
  const seeded = fixtureRoom();
  return normalizeRoom({
    ...seeded,
    ...normalized,
    docMarkdown: seeded.docMarkdown,
    packets: normalized.packets.length > 0 ? normalized.packets : seeded.packets,
  });
}

export async function peekRoom(store: RoomStore, roomId: string): Promise<Room | null> {
  const existing = await store.getRoom(roomId);
  if (existing) return healLegacyFixture(existing);
  if (!isFixtureRoomId(roomId)) return null;
  return fixtureRoom();
}

export async function loadRoom(store: RoomStore, roomId: string): Promise<Room | null> {
  const existing = await store.getRoom(roomId);
  if (existing) {
    const healed = healLegacyFixture(existing);
    if (isFixtureRoomId(roomId) && !existing.docMarkdown) {
      await store.putRoom(roomId, healed);
    }
    return healed;
  }
  if (!isFixtureRoomId(roomId)) return null;
  const seeded = fixtureRoom();
  await store.putRoom(roomId, seeded);
  return seeded;
}

function findPacket(room: Room, packetId: string): Packet {
  const packet = room.packets.find((p) => p.id === packetId);
  if (!packet) {
    throw new OpError("not_found", `Packet ${packetId} is not in this room.`);
  }
  return packet;
}

function appendPatch(room: Room, seat: ApplyOpRequest["seat"], op: Op, summary: string): void {
  room.log.push({
    seq: room.nextSeq,
    at: nowIso(),
    seat,
    op,
    summary,
  });
  room.nextSeq += 1;
}

export async function applyOp(
  store: RoomStore,
  req: ApplyOpRequest,
): Promise<ApplyOpSuccess> {
  if (!ALL_OPS.includes(req.op)) {
    throw new OpError("unknown_op", `Unknown op "${req.op}".`);
  }
  if (OWNER_OPS.has(req.op) && req.seat !== "owner") {
    throw new OpError(
      "wrong_seat",
      `${req.op} is an owner op. Open the owner URL.`,
    );
  }
  if (CONTRIBUTOR_OPS.has(req.op) && req.seat !== "contributor") {
    throw new OpError(
      "wrong_seat",
      `${req.op} is a contributor op. Open the contributor URL.`,
    );
  }

  const room = await loadRoom(store, req.roomId);
  if (!room) {
    throw new OpError("not_found", `Room ${req.roomId} does not exist.`);
  }

  if (req.op === "edit_doc") {
    const markdown = requireText(req.input, "markdown");
    room.docMarkdown = markdown;
    appendPatch(room, req.seat, req.op, "Edited the document");
    await store.putRoom(room.id, room);
    return { ok: true, room, result: { chars: String(markdown.length) } };
  }

  if (req.op === "open_decision") {
    const question = requireText(req.input, "question");
    const packet: Packet = {
      id: newId("pkt"),
      question,
      status: "open",
      options: [],
      evidence: [],
      challenges: [],
      requests: [],
      comments: [],
    };
    room.packets.push(packet);
    appendPatch(room, req.seat, req.op, `Opened decision: ${question}`);
    await store.putRoom(room.id, room);
    return { ok: true, room, result: { packetId: packet.id } };
  }

  if (req.op === "add_task") {
    const text = requireText(req.input, "text");
    const assignee = normalizeSeat(req.input.assignee ?? "");
    if (!assignee) {
      throw new OpError("not_found", "assignee must be owner or contributor.");
    }
    const task: Task = {
      id: newId("task"),
      text,
      assignee,
      done: false,
      at: nowIso(),
    };
    room.tasks.push(task);
    appendPatch(room, req.seat, req.op, `Task for ${assignee}: ${text}`);
    await store.putRoom(room.id, room);
    return { ok: true, room, result: { taskId: task.id } };
  }

  if (req.op === "complete_task") {
    const taskId = requireText(req.input, "taskId");
    const task = room.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new OpError("not_found", `Task ${taskId} is not in this room.`);
    }
    task.done = !task.done;
    appendPatch(
      room,
      req.seat,
      req.op,
      task.done ? `Completed: ${task.text}` : `Reopened: ${task.text}`,
    );
    await store.putRoom(room.id, room);
    return { ok: true, room, result: { taskId, done: String(task.done) } };
  }

  const packetId = requireText(req.input, "packetId");
  const packet = findPacket(room, packetId);
  if (packet.status !== "open") {
    throw new OpError(
      "packet_frozen",
      "This packet is closed. Reload to see the stamped decision.",
    );
  }
  if (!packet.comments) packet.comments = [];

  let result: Record<string, string> = { packetId };

  switch (req.op) {
    case "comment": {
      const text = requireText(req.input, "text");
      const row = {
        id: newId("cm"),
        text,
        authorSeat: req.seat,
      };
      packet.comments.push(row);
      appendPatch(room, req.seat, req.op, `Commented: ${text}`);
      result = { packetId, commentId: row.id };
      break;
    }
    case "propose_option": {
      const label = requireText(req.input, "label");
      const body = req.input.body?.trim() ?? "";
      const option = {
        id: newId("opt"),
        label,
        body,
        authorSeat: req.seat,
      };
      packet.options.push(option);
      appendPatch(room, req.seat, req.op, `Proposed option: ${label}`);
      result = { packetId, optionId: option.id };
      break;
    }
    case "attach_evidence": {
      const text = requireText(req.input, "text");
      const evidence = {
        id: newId("ev"),
        text,
        authorSeat: req.seat,
      };
      packet.evidence.push(evidence);
      appendPatch(room, req.seat, req.op, `Attached evidence`);
      result = { packetId, evidenceId: evidence.id };
      break;
    }
    case "challenge": {
      const text = requireText(req.input, "text");
      const challenge = {
        id: newId("ch"),
        text,
        authorSeat: req.seat,
      };
      packet.challenges.push(challenge);
      appendPatch(room, req.seat, req.op, `Challenged an assumption`);
      result = { packetId, challengeId: challenge.id };
      break;
    }
    case "request_evidence": {
      const what = requireText(req.input, "what");
      const request = {
        id: newId("rq"),
        what,
        authorSeat: req.seat,
      };
      packet.requests.push(request);
      appendPatch(room, req.seat, req.op, `Requested evidence`);
      result = { packetId, requestId: request.id };
      break;
    }
    case "decide": {
      if (!req.decideToken) {
        throw new OpError(
          "needs_human_decide",
          "Decide is not a tool. A human must click Decide.",
        );
      }
      const payload = await store.consumeDecideToken(req.decideToken);
      const optionId = requireText(req.input, "optionId");
      if (
        !payload ||
        payload.roomId !== room.id ||
        payload.packetId !== packet.id ||
        payload.optionId !== optionId
      ) {
        throw new OpError(
          "needs_human_decide",
          "Decide is not a tool. A human must click Decide.",
        );
      }
      const option = packet.options.find((o) => o.id === optionId);
      if (!option) {
        throw new OpError("not_found", `Option ${optionId} is not on this packet.`);
      }
      packet.status = "decided";
      packet.decision = {
        optionId,
        decidedBySeat: req.seat,
        at: nowIso(),
      };
      appendPatch(room, req.seat, req.op, `Decided: ${option.label}`);
      result = { packetId, optionId };
      break;
    }
  }

  await store.putRoom(room.id, room);
  return { ok: true, room, result };
}
