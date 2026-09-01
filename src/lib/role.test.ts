import { describe, expect, it } from "vitest";
import { hashOwnerSecret, mintOwnerSecret } from "./owner";
import { parseAsParam, resolveRole } from "./role";

describe("parseAsParam", () => {
  it("maps legacy and new seat names", () => {
    expect(parseAsParam("owner")).toBe("owner");
    expect(parseAsParam("maker")).toBe("owner");
    expect(parseAsParam("contributor")).toBe("contributor");
    expect(parseAsParam("decider")).toBe("contributor");
    expect(parseAsParam("nope")).toBeNull();
  });
});

describe("resolveRole", () => {
  it("cookie owner can downgrade via as=contributor (share link in the same browser)", () => {
    const secret = mintOwnerSecret();
    const hash = hashOwnerSecret(secret);
    expect(
      resolveRole({
        roomId: "r1",
        ownerTokenHash: hash,
        cookieSecret: secret,
        asParam: "contributor",
      }),
    ).toBe("contributor");
    expect(
      resolveRole({
        roomId: "r1",
        ownerTokenHash: hash,
        cookieSecret: secret,
        asParam: "decider",
      }),
    ).toBe("contributor");
  });

  it("cookie owner stays owner without a contributor join param", () => {
    const secret = mintOwnerSecret();
    const hash = hashOwnerSecret(secret);
    expect(
      resolveRole({
        roomId: "r1",
        ownerTokenHash: hash,
        cookieSecret: secret,
      }),
    ).toBe("owner");
  });

  it("ignores ?as=owner on rooms with ownerTokenHash (no cookie forge)", () => {
    expect(
      resolveRole({
        roomId: "r1",
        ownerTokenHash: hashOwnerSecret("x"),
        cookieSecret: "wrong",
        asParam: "owner",
      }),
    ).toBe("contributor");
    expect(
      resolveRole({
        roomId: "r1",
        ownerTokenHash: hashOwnerSecret("x"),
        asParam: "maker",
      }),
    ).toBe("contributor");
  });

  it("allows ?as= only on fixture/legacy rooms without ownerTokenHash", () => {
    expect(
      resolveRole({
        roomId: "checkout-friday",
        asParam: "owner",
      }),
    ).toBe("owner");
    expect(
      resolveRole({
        roomId: "checkout-friday",
        asParam: "decider",
      }),
    ).toBe("contributor");
  });

  it("defaults to contributor", () => {
    expect(resolveRole({ roomId: "r1" })).toBe("contributor");
    expect(
      resolveRole({
        roomId: "r1",
        ownerTokenHash: hashOwnerSecret("x"),
      }),
    ).toBe("contributor");
  });
});
