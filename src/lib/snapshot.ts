import { activeOpenPacket, openPackets } from "./active-packet";
import { liveParties } from "./presence";
import type { Packet, Room } from "./types";
import { trimToolOutput } from "./summarize";

function summarizePacket(packet: Packet) {
  return {
    id: packet.id,
    question: packet.question,
    status: packet.status,
    options: (packet.options ?? []).map((o) => ({ id: o.id, label: o.label })),
    evidence: (packet.evidence ?? []).map((e) => e.text),
    challenges: (packet.challenges ?? []).map((c) => c.text),
    requests: (packet.requests ?? []).map((r) => r.what),
    comments: (packet.comments ?? []).map((c) => c.text),
    decision: packet.decision ?? null,
  };
}

export function workspaceSnapshot(room: Room): string {
  const open = openPackets(room);
  const active = activeOpenPacket(room);
  const present = liveParties(room.parties);
  const closed = (room.packets ?? []).filter((p) => p.status === "decided");

  const body = {
    roomId: room.id,
    title: room.title,
    docMarkdown: room.docMarkdown,
    /** Newest open decision — default target when packetId is omitted. */
    activePacketId: active?.id ?? null,
    hint:
      open.length > 1
        ? "Multiple open decisions. Pass packetId explicitly, or omit it to use activePacketId (newest open). Prefer editing one open decision instead of opening another."
        : "Omit packetId on propose_option / attach_evidence to target activePacketId.",
    openPackets: open.map(summarizePacket),
    /** @deprecated use openPackets + activePacketId — kept for older agents */
    packet: active ? summarizePacket(active) : null,
    closedPackets: closed.map((p) => ({
      id: p.id,
      question: p.question,
      chosen:
        p.options.find((o) => o.id === p.decision?.optionId)?.label ??
        p.decision?.optionId ??
        null,
    })),
    tasks: (room.tasks ?? []).map((t) => ({
      id: t.id,
      text: t.text,
      assignee: t.assignee,
      done: t.done,
    })),
    present: present.map((p) => ({
      partyId: p.id,
      seat: p.seat,
      lastSeenAt: p.lastSeenAt,
      lastActor: p.lastActor ?? "human",
    })),
    logTail: room.log.slice(-6).map((p) => {
      const via = p.via === "agent" ? "agent" : "human";
      return `${p.seq} ${p.seat}/${via} ${p.op}: ${p.summary}`;
    }),
  };
  return trimToolOutput(body);
}
