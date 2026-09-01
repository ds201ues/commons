import { describe, expect, it } from "vitest";
import { roomShareUrl } from "./share-url";

describe("roomShareUrl", () => {
  it("builds a clean room URL without seat query", () => {
    expect(roomShareUrl("https://redress-desk.vercel.app", "abc123")).toBe(
      "https://redress-desk.vercel.app/r/abc123",
    );
  });

  it("strips trailing slash on origin", () => {
    expect(roomShareUrl("https://example.com/", "room-1")).toBe(
      "https://example.com/r/room-1",
    );
  });
});
