import { describe, expect, it } from "vitest";
import { newRoomId } from "./ids";
import {
  hashOwnerSecret,
  mintOwnerSecret,
  ownerCookieName,
  verifyOwnerSecret,
} from "./owner";

describe("owner secrets", () => {
  it("round-trips mint → hash → verify", () => {
    const secret = mintOwnerSecret();
    const hash = hashOwnerSecret(secret);
    expect(verifyOwnerSecret(secret, hash)).toBe(true);
    expect(verifyOwnerSecret("wrong", hash)).toBe(false);
  });

  it("names cookies per room", () => {
    expect(ownerCookieName("abc")).toBe("commons_owner_abc");
  });
});

describe("newRoomId", () => {
  it("returns a long unguessable id", () => {
    const id = newRoomId();
    expect(id.length).toBeGreaterThanOrEqual(20);
    expect(newRoomId()).not.toBe(id);
  });
});
