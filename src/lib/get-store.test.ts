import { afterEach, describe, expect, it } from "vitest";
import { getStore, hasUpstash, persistMode, persistUnavailableBody } from "./get-store";
import { MemoryStore } from "./memory-store";

const originalVercel = process.env.VERCEL;
const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;

afterEach(() => {
  if (originalVercel === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = originalVercel;
  if (originalUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
  else process.env.UPSTASH_REDIS_REST_URL = originalUrl;
  if (originalToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
  else process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
});

describe("getStore persist mode", () => {
  it("is memory locally without Upstash", () => {
    delete process.env.VERCEL;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    expect(hasUpstash()).toBe(false);
    expect(persistMode()).toBe("memory");
    expect(persistUnavailableBody()).toBeNull();
  });

  it("is ephemeral on Vercel without Upstash", () => {
    process.env.VERCEL = "1";
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    expect(persistMode()).toBe("ephemeral");
    expect(persistUnavailableBody()).toMatchObject({
      ok: false,
      code: "persist_unavailable",
    });
  });

  it("is upstash when REST URL and token are both set", () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    expect(hasUpstash()).toBe(true);
    expect(persistMode()).toBe("upstash");
    expect(persistUnavailableBody()).toBeNull();
  });

  it("reuses one MemoryStore on globalThis", () => {
    delete process.env.VERCEL;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const a = getStore();
    const b = getStore();
    expect(a).toBeInstanceOf(MemoryStore);
    expect(a).toBe(b);
  });
});
