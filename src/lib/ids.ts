import { randomBytes } from "node:crypto";

/** Unguessable room id for link-shared access. */
export function newRoomId(): string {
  return randomBytes(16).toString("base64url");
}
