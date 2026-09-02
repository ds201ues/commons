import { describe, expect, it } from "vitest";
import { roomShareUrl } from "./share-url";

describe("roomShareUrl", () => {
  it("builds a contributor join URL so the owner cookie cannot impersonate the agent", () => {
    expect(roomShareUrl("https://getcommons.vercel.app", "abc123")).toBe(
      "https://getcommons.vercel.app/r/abc123?as=contributor",
    );
  });

  it("strips trailing slash on origin", () => {
    expect(roomShareUrl("https://example.com/", "room-1")).toBe(
      "https://example.com/r/room-1?as=contributor",
    );
  });
});
