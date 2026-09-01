import { randomBytes } from "node:crypto";
import type { Seat } from "./types";

/** Per-seat so Owner tab and Contributor share-link can coexist in one browser. */
export function partyCookieName(roomId: string, seat: Seat): string {
  return `commons_party_${roomId}_${seat}`;
}

/** Stable per-browser-seat identity for a visitor in a room. */
export function mintPartyId(): string {
  return randomBytes(16).toString("base64url");
}
