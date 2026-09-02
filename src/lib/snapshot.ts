import { activeOpenPacket, openPackets } from "./active-packet";
import { liveParties } from "./presence";
import type { Packet, Room, Seat, Task } from "./types";
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

function summarizeTask(task: Task) {
  return {
    id: task.id,
    text: task.text,
    assignee: task.assignee,
    done: task.done,
  };
}

export type WorkspaceSnapshotOptions = {
  /** Seat of the agent calling get_workspace — used to surface myOpenTasks. */
  seat?: Seat
};

/**
 * Compact JSON for WebMCP (≤1.5K). Priority order: myOpenTasks first so
 * truncation never hides assigned work.
 */
export function workspaceSnapshot(
  room: Room,
  options: WorkspaceSnapshotOptions = {},
): string {
  const open = openPackets(room);
  const active = activeOpenPacket(room);
  const present = liveParties(room.parties);
  const closed = (room.packets ?? []).filter((p) => p.status === "decided");
  const tasks = room.tasks ?? [];
  const openTasks = tasks.filter((t) => !t.done);
  const myOpenTasks =
    options.seat != null
      ? openTasks.filter((t) => t.assignee === options.seat).map(summarizeTask)
      : [];

  const taskHint =
    options.seat == null
      ? "Pass seat context via the seat page so myOpenTasks is filled."
      : myOpenTasks.length > 0
        ? `Do myOpenTasks (${myOpenTasks.length}), then complete_task(taskId).`
        : openTasks.length > 0
          ? "No tasks for your seat; other openTasks exist."
          : "No open tasks. add_task hands work to a seat (pull on next get_workspace).";

  // Keep doc short — full brief is editable via edit_doc; agents need the lead.
  const doc = room.docMarkdown ?? "";
  const docLead = doc.length > 280 ? `${doc.slice(0, 265)}…[doc truncated]` : doc;

  const body = {
    roomId: room.id,
    title: room.title,
    yourSeat: options.seat ?? null,
    myOpenTasks,
    openTasks: openTasks.map(summarizeTask),
    taskHint,
    activePacketId: active?.id ?? null,
    hint:
      open.length > 1
        ? "Multiple open decisions — pass packetId or use activePacketId (newest)."
        : "Omit packetId to target activePacketId.",
    present: present.map((p) => ({
      partyId: p.id,
      seat: p.seat,
      lastActor: p.lastActor ?? "human",
    })),
    openPackets: open.map(summarizePacket),
    /** @deprecated use openPackets + activePacketId */
    packet: active ? summarizePacket(active) : null,
    closedPackets: closed.map((p) => ({
      id: p.id,
      question: p.question,
      chosen:
        p.options.find((o) => o.id === p.decision?.optionId)?.label ??
        p.decision?.optionId ??
        null,
    })),
    docMarkdown: docLead,
    /** Includes done — prefer myOpenTasks / openTasks. */
    tasks: tasks.map(summarizeTask),
    logTail: room.log.slice(-4).map((p) => {
      const via = p.via === "agent" ? "agent" : "human";
      return `${p.seq} ${p.seat}/${via} ${p.op}: ${p.summary}`;
    }),
  };
  return trimToolOutput(body);
}
