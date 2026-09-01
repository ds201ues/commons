import { Redis } from "@upstash/redis";
import { randomBytes } from "node:crypto";
import type { DecideTokenPayload, Room } from "./types";
import type { RoomStore } from "./store";

const TOKEN_TTL_S = 120;
const NONCE_TTL_S = 60 * 60;

function roomKey(id: string): string {
  return `room:${id}`;
}

function tokenKey(token: string): string {
  return `dtoken:${token}`;
}

function nonceKey(roomId: string, nonce: string): string {
  return `nonce:${roomId}:${nonce}`;
}

export class UpstashStore implements RoomStore {
  private redis: Redis;

  constructor(redis = Redis.fromEnv()) {
    this.redis = redis;
  }

  async getRoom(id: string): Promise<Room | null> {
    const room = await this.redis.get<Room>(roomKey(id));
    return room ?? null;
  }

  async putRoom(id: string, room: Room): Promise<void> {
    await this.redis.set(roomKey(id), room);
  }

  async mintDecideToken(payload: DecideTokenPayload): Promise<string> {
    const token = randomBytes(16).toString("hex");
    await this.redis.set(tokenKey(token), payload, { ex: TOKEN_TTL_S });
    return token;
  }

  async consumeDecideToken(token: string): Promise<DecideTokenPayload | null> {
    const payload = await this.redis.getdel<DecideTokenPayload>(tokenKey(token));
    return payload ?? null;
  }

  async issueHumanNonce(roomId: string): Promise<string> {
    const nonce = randomBytes(16).toString("hex");
    // Use a non-numeric marker — @upstash/redis JSON-decodes "1" as number 1.
    await this.redis.set(nonceKey(roomId, nonce), "ok", { ex: NONCE_TTL_S });
    return nonce;
  }

  async takeHumanNonce(roomId: string, nonce: string): Promise<boolean> {
    const value = await this.redis.getdel<string | number>(nonceKey(roomId, nonce));
    // Accept "ok", legacy "1", and numeric 1 from older deploys / JSON decode.
    return value === "ok" || value === "1" || value === 1;
  }
}
