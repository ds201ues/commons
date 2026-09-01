import { describe, expect, it } from "vitest";
import { createRoom } from "./create-room";
import { MemoryStore } from "./memory-store";
import { verifyOwnerSecret } from "./owner";

describe("createRoom", () => {
  it("persists a room with owner hash and one open packet", async () => {
    const db = new MemoryStore();
    const { room, ownerSecret } = await createRoom(db, {
      title: "Launch",
      question: "Ship Tuesday?",
    });
    expect(room.id.length).toBeGreaterThanOrEqual(20);
    expect(room.title).toBe("Launch");
    expect(room.packets).toHaveLength(1);
    expect(room.packets[0]?.question).toBe("Ship Tuesday?");
    expect(room.packets[0]?.comments).toEqual([]);
    expect(room.ownerTokenHash).toBeTruthy();
    expect(verifyOwnerSecret(ownerSecret, room.ownerTokenHash!)).toBe(true);
    expect(await db.getRoom(room.id)).toEqual(room);
  });
});
