import { MemoryStore } from "./memory-store";
import type { RoomStore } from "./store";
import type { OpErrorBody, PersistMode } from "./types";
import { UpstashStore } from "./upstash-store";

const globalForStore = globalThis as typeof globalThis & {
  __commonsMemoryStore?: MemoryStore
};

export function hasUpstash(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

/** upstash = durable Redis. memory = local process (globalThis). ephemeral = Vercel without Redis. */
export function persistMode(): PersistMode {
  if (hasUpstash()) return "upstash";
  if (process.env.VERCEL) return "ephemeral";
  return "memory";
}

export function persistUnavailableBody(): OpErrorBody | null {
  if (persistMode() !== "ephemeral") return null;
  return {
    ok: false,
    code: "persist_unavailable",
    hint: "This deploy has no Upstash Redis. Decide cannot run until UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set.",
  };
}

export function getStore(): RoomStore {
  if (hasUpstash()) {
    return new UpstashStore();
  }
  if (process.env.VERCEL) {
    console.warn(
      "Commons: UPSTASH_REDIS_REST_URL/TOKEN missing; decided packets will not survive a cold start.",
    );
  }
  if (!globalForStore.__commonsMemoryStore) {
    globalForStore.__commonsMemoryStore = new MemoryStore();
  }
  return globalForStore.__commonsMemoryStore;
}
