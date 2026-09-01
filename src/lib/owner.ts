import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function ownerCookieName(roomId: string): string {
  return `commons_owner_${roomId}`;
}

export function mintOwnerSecret(): string {
  return randomBytes(24).toString("base64url");
}

export function hashOwnerSecret(secret: string): string {
  return createHash("sha256").update(secret, "utf8").digest("hex");
}

export function verifyOwnerSecret(secret: string, expectedHash: string): boolean {
  const got = Buffer.from(hashOwnerSecret(secret), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  if (got.length !== expected.length) return false;
  return timingSafeEqual(got, expected);
}
