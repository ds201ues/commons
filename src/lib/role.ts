import { verifyOwnerSecret } from "./owner";
import { normalizeSeat, type Seat } from "./types";

export type RoleInput = {
  roomId: string
  ownerTokenHash?: string | null
  cookieSecret?: string | null
  asParam?: string | null
};

export function parseAsParam(value: string | null | undefined): Seat | null {
  if (!value) return null;
  return normalizeSeat(value);
}

/**
 * Resolve seat for a room view / ops call.
 * Valid owner cookie wins; else demo `?as=` / body.as; else contributor.
 */
export function resolveRole(input: RoleInput): Seat {
  const hash = input.ownerTokenHash;
  const secret = input.cookieSecret;
  if (hash && secret && verifyOwnerSecret(secret, hash)) {
    return "owner";
  }

  const fromAs = parseAsParam(input.asParam ?? undefined);
  if (fromAs) return fromAs;

  return "contributor";
}
