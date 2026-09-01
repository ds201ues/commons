import { verifyOwnerSecret } from "./owner";
import { normalizeSeat, type Seat } from "./types";

export type RoleInput = {
  roomId: string
  ownerTokenHash?: string | null
  cookieSecret?: string | null
  /**
   * Demo override for fixture / legacy rooms that have no ownerTokenHash.
   * Ignored when the room has a real owner cookie hash — seat is cookie-only.
   */
  asParam?: string | null
};

export function parseAsParam(value: string | null | undefined): Seat | null {
  if (!value) return null;
  return normalizeSeat(value);
}

/**
 * Resolve seat for a room view / ops call.
 *
 * Real rooms (ownerTokenHash set): valid owner cookie → owner; else contributor.
 * Fixture / legacy rooms (no hash): optional `?as=` / body.as for contest demos.
 */
export function resolveRole(input: RoleInput): Seat {
  const hash = input.ownerTokenHash;
  const secret = input.cookieSecret;
  if (hash && secret && verifyOwnerSecret(secret, hash)) {
    return "owner";
  }

  // Owned rooms: cookie is the only owner proof. Sharing the URL never elevates.
  if (hash) {
    return "contributor";
  }

  const fromAs = parseAsParam(input.asParam ?? undefined);
  if (fromAs) return fromAs;

  return "contributor";
}
