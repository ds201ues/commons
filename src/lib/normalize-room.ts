import { normalizeSeat, type Packet, type Room, type Seat } from "./types";

function coerceSeat(value: string): Seat {
  return normalizeSeat(value) ?? "contributor";
}

function normalizePacket(packet: Packet): Packet {
  return {
    ...packet,
    options: (packet.options ?? []).map((opt) => ({
      ...opt,
      authorSeat: coerceSeat(opt.authorSeat),
    })),
    evidence: (packet.evidence ?? []).map((ev) => ({
      ...ev,
      authorSeat: coerceSeat(ev.authorSeat),
    })),
    challenges: (packet.challenges ?? []).map((ch) => ({
      ...ch,
      authorSeat: coerceSeat(ch.authorSeat),
    })),
    requests: (packet.requests ?? []).map((rq) => ({
      ...rq,
      authorSeat: coerceSeat(rq.authorSeat),
    })),
    comments: (packet.comments ?? []).map((cm) => ({
      ...cm,
      authorSeat: coerceSeat(cm.authorSeat),
    })),
    decision: packet.decision
      ? {
          ...packet.decision,
          decidedBySeat: coerceSeat(packet.decision.decidedBySeat),
        }
      : packet.decision,
  };
}

/** Fill missing packet arrays and coerce legacy maker/decider seats. */
export function normalizeRoom(room: Room): Room {
  return {
    ...room,
    title: room.title?.trim() || "Untitled room",
    // Legacy Upstash fixtures predate docMarkdown; SSR must never see undefined.
    docMarkdown: room.docMarkdown ?? "",
    packets: (room.packets ?? []).map(normalizePacket),
    // Rooms created before tasks shipped must never SSR with undefined.
    tasks: (room.tasks ?? []).map((task) => ({
      ...task,
      assignee: coerceSeat(task.assignee),
      done: Boolean(task.done),
    })),
    log: (room.log ?? []).map((row) => ({
      ...row,
      seat: coerceSeat(row.seat),
    })),
  };
}
