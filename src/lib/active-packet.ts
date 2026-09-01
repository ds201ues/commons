import type { Packet, Room } from "./types";

/** Open decisions in array order (oldest → newest). */
export function openPackets(room: Room): Packet[] {
  return (room.packets ?? []).filter((p) => p.status === "open");
}

/**
 * Prefer the newest open decision — `open_decision` appends, so agents who
 * open a cleaner question then propose options should hit this id by default.
 */
export function activeOpenPacket(room: Room): Packet | null {
  const open = openPackets(room);
  if (open.length === 0) return null;
  return open[open.length - 1] ?? null;
}

export function resolveOpenPacketId(room: Room, packetId?: string): string {
  const trimmed = packetId?.trim();
  if (trimmed) return trimmed;
  const active = activeOpenPacket(room);
  if (!active) {
    throw new Error("No open decision in this room.");
  }
  return active.id;
}

/**
 * UI default when the user has not picked a decision: prefer an open packet
 * that already has options/evidence (so Decide stays useful), else newest open.
 */
export function pickUiActivePacket(room: Room): Packet | null {
  const open = openPackets(room);
  if (open.length === 0) return null;
  const rich = [...open]
    .reverse()
    .find(
      (p) =>
        (p.options?.length ?? 0) > 0 ||
        (p.evidence?.length ?? 0) > 0 ||
        (p.comments?.length ?? 0) > 0,
    );
  return rich ?? open[open.length - 1] ?? null;
}
