import { describe, expect, it } from "vitest";
import { partyCookieName } from "./party";

describe("partyCookieName", () => {
  it("scopes the party cookie by seat so owner and contributor tabs do not collide", () => {
    expect(partyCookieName("r1", "owner")).toBe("commons_party_r1_owner");
    expect(partyCookieName("r1", "contributor")).toBe(
      "commons_party_r1_contributor",
    );
    expect(partyCookieName("r1", "owner")).not.toBe(
      partyCookieName("r1", "contributor"),
    );
  });
});
