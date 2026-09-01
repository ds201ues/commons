import { describe, expect, it } from "vitest";
import { MemoryStore } from "./memory-store";

describe("MemoryStore tokens", () => {
  it("GETDEL analog: second consume is null", async () => {
    const db = new MemoryStore();
    const token = await db.mintDecideToken({
      roomId: "r",
      packetId: "p",
      optionId: "o",
    });
    const first = await db.consumeDecideToken(token);
    const second = await db.consumeDecideToken(token);
    expect(first).toEqual({ roomId: "r", packetId: "p", optionId: "o" });
    expect(second).toBeNull();
  });

  it("takes a human nonce only once", async () => {
    const db = new MemoryStore();
    const nonce = await db.issueHumanNonce("r");
    expect(await db.takeHumanNonce("r", nonce)).toBe(true);
    expect(await db.takeHumanNonce("r", nonce)).toBe(false);
  });
});
