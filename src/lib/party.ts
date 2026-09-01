import { randomBytes } from "node:crypto";

export function partyCookieName(roomId: string): string {
  return `commons_party_${roomId}`;
}

/** Stable per-browser identity for a visitor in a room. */
export function mintPartyId(): string {
  return randomBytes(16).toString("base64url");
}
