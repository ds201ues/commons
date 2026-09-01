import type { DecideTokenPayload, Party, Room } from "./types";

export type RoomStore = {
  getRoom(id: string): Promise<Room | null>;
  putRoom(id: string, room: Room): Promise<void>;
  /** Presence overlay — must not rewrite the room content blob. */
  putParties(id: string, parties: Party[]): Promise<void>;
  mintDecideToken(payload: DecideTokenPayload): Promise<string>;
  consumeDecideToken(token: string): Promise<DecideTokenPayload | null>;
  issueHumanNonce(roomId: string): Promise<string>;
  takeHumanNonce(roomId: string, nonce: string): Promise<boolean>;
};
