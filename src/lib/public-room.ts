import type { Room } from "./types";

/** Room JSON safe to send to the browser / WebMCP. Drops the owner cookie hash. */
export function publicRoom(room: Room): Room {
  const { ownerTokenHash: _omit, ...rest } = room;
  return rest;
}
