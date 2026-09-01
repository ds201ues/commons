import { describe, expect, it } from "vitest";
import { canStickyDecide } from "./decide-sticky";
import type { Packet } from "./types";

const base: Packet = {
  id: "pkt-1",
  question: "Ship Friday?",
  status: "open",
  options: [],
  evidence: [],
  challenges: [],
  requests: [],
  comments: [],
};

describe("canStickyDecide", () => {
  it("is false when missing or closed", () => {
    expect(canStickyDecide(undefined)).toBe(false);
    expect(
      canStickyDecide({
        ...base,
        status: "decided",
        options: [{ id: "a", label: "Yes", body: "", authorSeat: "owner" }],
      }),
    ).toBe(false);
  });

  it("is false when open but no options", () => {
    expect(canStickyDecide({ ...base, status: "open", options: [] })).toBe(false);
  });

  it("is true when open with options", () => {
    expect(
      canStickyDecide({
        ...base,
        status: "open",
        options: [{ id: "a", label: "Ship", body: "", authorSeat: "owner" }],
      }),
    ).toBe(true);
  });
});
