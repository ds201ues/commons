import type { Party, Room, Seat } from "./types";

/** Consider a party "in the room" if they heartbeated within this window. */
export const LIVE_MS = 45_000;

/** Short display tag for a party id (client-safe — no node:crypto). */
export function shortPartyLabel(partyId: string): string {
  const tail = partyId.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toLowerCase();
  return tail || "····";
}

/** Drop parties that have not been seen for a day (keeps Redis room JSON small). */
export const RETAIN_MS = 24 * 60 * 60 * 1000;

export function isPartyLive(party: Party, nowMs = Date.now()): boolean {
  const at = Date.parse(party.lastSeenAt);
  if (Number.isNaN(at)) return false;
  return nowMs - at <= LIVE_MS;
}

export function liveParties(parties: Party[] | undefined, nowMs = Date.now()): Party[] {
  return (parties ?? []).filter((p) => isPartyLive(p, nowMs));
}

/**
 * Upsert a visitor into room.parties and prune stale entries.
 * Mutates and returns the room.
 */
export function touchParty(
  room: Room,
  partyId: string,
  seat: Seat,
  nowIso = new Date().toISOString(),
): Room {
  const nowMs = Date.parse(nowIso);
  const next: Party = { id: partyId, seat, lastSeenAt: nowIso };
  const retained = (room.parties ?? []).filter((p) => {
    if (p.id === partyId) return false;
    const at = Date.parse(p.lastSeenAt);
    if (Number.isNaN(at)) return false;
    return nowMs - at <= RETAIN_MS;
  });
  room.parties = [...retained, next].sort((a, b) =>
    a.lastSeenAt < b.lastSeenAt ? -1 : a.lastSeenAt > b.lastSeenAt ? 1 : 0,
  );
  return room;
}
