import { verifyOwnerSecret } from "./owner";
import { normalizeSeat, type Seat } from "./types";

export type RoleInput = {
  roomId: string
  ownerTokenHash?: string | null
  cookieSecret?: string | null
  /**
   * Join override. `contributor` downgrades even with a valid owner cookie
   * (share link in the same browser / ChatGPT webview). `owner` never elevates.
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
 * Real rooms (ownerTokenHash set):
 * - valid owner cookie → owner, unless as=contributor (share-link downgrade)
 * - `?as=owner` never elevates; sharing the URL cannot mint Owner
 * Fixture / legacy rooms (no hash): optional `?as=` / body.as for contest demos.
 */
export function resolveRole(input: RoleInput): Seat {
  const hash = input.ownerTokenHash;
  const secret = input.cookieSecret;
  if (hash && secret && verifyOwnerSecret(secret, hash)) {
    // Same browser still has the owner cookie when ChatGPT opens the share link.
    // Downgrade is allowed; elevation is not.
    if (parseAsParam(input.asParam) === "contributor") return "contributor";
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
