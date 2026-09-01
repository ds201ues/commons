import { randomBytes } from "node:crypto";
import type { DecideTokenPayload, Room } from "./types";
import type { RoomStore } from "./store";

type TokenRow = { payload: DecideTokenPayload; expiresAt: number };
type NonceRow = { expiresAt: number };

const TOKEN_TTL_MS = 120_000;
const NONCE_TTL_MS = 60 * 60 * 1000;

export class MemoryStore implements RoomStore {
  private rooms = new Map<string, Room>();
  private tokens = new Map<string, TokenRow>();
  private nonces = new Map<string, NonceRow>();

  async getRoom(id: string): Promise<Room | null> {
    const room = this.rooms.get(id);
    return room ? structuredClone(room) : null;
  }

  async putRoom(id: string, room: Room): Promise<void> {
    this.rooms.set(id, structuredClone(room));
  }

  async mintDecideToken(payload: DecideTokenPayload): Promise<string> {
    const token = randomBytes(16).toString("hex");
    this.tokens.set(token, { payload, expiresAt: Date.now() + TOKEN_TTL_MS });
    return token;
  }

  async consumeDecideToken(token: string): Promise<DecideTokenPayload | null> {
    const row = this.tokens.get(token);
    this.tokens.delete(token);
    if (!row || row.expiresAt < Date.now()) return null;
    return row.payload;
  }

  async issueHumanNonce(roomId: string): Promise<string> {
    const nonce = randomBytes(16).toString("hex");
    this.nonces.set(`${roomId}:${nonce}`, { expiresAt: Date.now() + NONCE_TTL_MS });
    return nonce;
  }

  async takeHumanNonce(roomId: string, nonce: string): Promise<boolean> {
    const key = `${roomId}:${nonce}`;
    const row = this.nonces.get(key);
    this.nonces.delete(key);
    if (!row || row.expiresAt < Date.now()) return false;
    return true;
  }
}
