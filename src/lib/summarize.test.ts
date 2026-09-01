import { describe, expect, it } from "vitest";
import { trimToolOutput } from "./summarize";

describe("trimToolOutput", () => {
  it("leaves short payloads alone", () => {
    expect(trimToolOutput({ ok: true })).toBe('{"ok":true}');
  });

  it("caps long payloads at 1500 chars", () => {
    const out = trimToolOutput({ blob: "x".repeat(2000) });
    expect(out.length).toBeLessThanOrEqual(1500);
    expect(out.endsWith("…[truncated]")).toBe(true);
  });
});
