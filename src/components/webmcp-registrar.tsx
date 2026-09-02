"use client";

import { useEffect } from "react";
import { ACTOR_VIA_HEADER } from "@/lib/actor-via";
import { workspaceSnapshot } from "@/lib/snapshot";
import { NEVER_REGISTER, toolsForSeat } from "@/lib/tools";
import type { Room, Seat } from "@/lib/types";
import { trimToolOutput } from "@/lib/summarize";

type Props = {
  roomId: string
  seat: Seat
};

type OpResponse = {
  ok: boolean
  room?: Room
  result?: Record<string, string>
  hint?: string
  code?: string
};

async function readRoom(roomId: string): Promise<Room> {
  const res = await fetch(`/api/rooms/${roomId}`, { cache: "no-store" });
  const json = (await res.json()) as { ok: boolean; room?: Room; hint?: string };
  if (!json.ok || !json.room) {
    throw new Error(json.hint ?? "Room read failed");
  }
  return json.room;
}

export function WebmcpRegistrar({ roomId, seat }: Props) {
  useEffect(() => {
    const ctx = document.modelContext;
    if (!ctx) return;
    const abort = new AbortController();

    for (const tool of toolsForSeat(seat)) {
      if ((NEVER_REGISTER as readonly string[]).includes(tool.name)) continue;
      void ctx.registerTool(
        {
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
          annotations: {
            readOnlyHint: tool.readOnlyHint,
            untrustedContentHint: tool.untrustedContentHint,
          },
          execute: async (input) => {
            if (tool.name === "get_workspace") {
              const room = await readRoom(roomId);
              return workspaceSnapshot(room, { seat });
            }
            const res = await fetch(`/api/rooms/${roomId}/ops`, {
              method: "POST",
              credentials: "same-origin",
              headers: {
                "content-type": "application/json",
                [ACTOR_VIA_HEADER]: "agent",
              },
              body: JSON.stringify({
                as: seat,
                via: "agent",
                op: tool.name,
                input: input ?? {},
              }),
            });
            const json = (await res.json()) as OpResponse;
            if (!json.ok) return trimToolOutput(json);
            if (json.room) return workspaceSnapshot(json.room, { seat });
            return trimToolOutput({ ok: true, result: json.result ?? {} });
          },
        },
        { signal: abort.signal },
      );
    }

    return () => abort.abort();
  }, [roomId, seat]);

  return null;
}
