import { describe, expect, it } from "vitest";
import { resolveActorVia } from "./actor-via";

describe("resolveActorVia", () => {
  it("prefers the header over the body", () => {
    expect(resolveActorVia("agent", "human")).toBe("agent");
    expect(resolveActorVia("human", "agent")).toBe("human");
  });

  it("falls back to body.via when the header is absent", () => {
    expect(resolveActorVia(null, "agent")).toBe("agent");
    expect(resolveActorVia(undefined, "human")).toBe("human");
    expect(resolveActorVia("", "agent")).toBe("agent");
  });

  it("defaults to human", () => {
    expect(resolveActorVia(null, undefined)).toBe("human");
    expect(resolveActorVia(null, "bot")).toBe("human");
  });
});
