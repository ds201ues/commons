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
  it("cookie owner wins", () => {
    const secret = mintOwnerSecret();
    const hash = hashOwnerSecret(secret);
    expect(
      resolveRole({
        roomId: "r1",
        ownerTokenHash: hash,
        cookieSecret: secret,
        asParam: "contributor",
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
