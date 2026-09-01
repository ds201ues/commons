import type { Party, Room } from "./types";

/** ids / lastSeen / lastActor — heartbeat should not clone room if this is unchanged. */
export function partiesPresenceSignature(parties: Party[] | undefined): string {
  return [...(parties ?? [])]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((p) => `${p.id}:${p.lastSeenAt}:${p.lastActor ?? ""}`)
    .join(",");
}

/** Cheap fingerprint so the 1.2s poll can skip setState when idle. */
export function roomPollSignature(room: Room): string {
  const parties = partiesPresenceSignature(room.parties);
  const tasksDone = (room.tasks ?? []).reduce((n, t) => n + (t.done ? 1 : 0), 0);
  const openOpts = (room.packets ?? [])
    .filter((p) => p.status === "open")
    .map((p) => `${p.id}:${p.options.length}`)
    .join(",");
  return [
    room.nextSeq,
    room.title,
    room.docMarkdown.length,
    parties,
    tasksDone,
    openOpts,
  ].join("|");
}
