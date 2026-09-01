import { newRoomId } from "./ids";
import { hashOwnerSecret, mintOwnerSecret } from "./owner";
import type { RoomStore } from "./store";
import type { Packet, Room } from "./types";

export type CreateRoomInput = {
  title?: string
  question?: string
};

export type CreateRoomResult = {
  room: Room
  ownerSecret: string
};

function seedDocMarkdown(title: string): string {
  return `# ${title}

**Context** — Why this room exists and what decision we're working toward.

**Open questions**
- What do we need to agree on?
- What evidence would change our minds?

**Notes**
- Owner: edit this brief anytime. Contributors see it read-only on the table.
`;
}

function emptyPacket(question: string): Packet {
  return {
    id: `pkt-${newRoomId().slice(0, 8)}`,
    question,
    status: "open",
    options: [],
    evidence: [],
    challenges: [],
    requests: [],
    comments: [],
  };
}

export async function createRoom(
  store: RoomStore,
  input: CreateRoomInput = {},
): Promise<CreateRoomResult> {
  const id = newRoomId();
  const title = input.title?.trim() || "Untitled room";
  const question =
    input.question?.trim() || `What should we decide in “${title}”?`;
  const ownerSecret = mintOwnerSecret();
  const room: Room = {
    id,
    title,
    docMarkdown: seedDocMarkdown(title),
    ownerTokenHash: hashOwnerSecret(ownerSecret),
    createdAt: new Date().toISOString(),
    packets: [emptyPacket(question)],
    tasks: [],
    log: [],
    nextSeq: 1,
  };
  await store.putRoom(id, room);
  return { room, ownerSecret };
}
