import type { Room } from "./types";
import { trimToolOutput } from "./summarize";

export function workspaceSnapshot(room: Room): string {
  const packet = room.packets[0];
  const body = {
    roomId: room.id,
    title: room.title,
    docMarkdown: room.docMarkdown,
    packet: packet
      ? {
          id: packet.id,
          question: packet.question,
          status: packet.status,
          options: packet.options.map((o) => ({ id: o.id, label: o.label })),
          evidence: packet.evidence.map((e) => e.text),
          challenges: packet.challenges.map((c) => c.text),
          requests: packet.requests.map((r) => r.what),
          comments: packet.comments.map((c) => c.text),
          decision: packet.decision ?? null,
        }
      : null,
    logTail: room.log.slice(-6).map((p) => `${p.seq} ${p.seat} ${p.op}: ${p.summary}`),
  };
  return trimToolOutput(body);
}
