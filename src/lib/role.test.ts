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
  it("cookie owner wins over ?as=contributor", () => {
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

  it("uses ?as= when there is no valid cookie", () => {
    expect(
      resolveRole({
        roomId: "r1",
        ownerTokenHash: hashOwnerSecret("x"),
        cookieSecret: "wrong",
        asParam: "maker",
      }),
    ).toBe("owner");
    expect(
      resolveRole({
        roomId: "r1",
        asParam: "decider",
      }),
    ).toBe("contributor");
  });

  it("defaults to contributor", () => {
    expect(resolveRole({ roomId: "r1" })).toBe("contributor");
  });
});
