import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { applyOp, peekRoom } from "@/lib/apply-op";
import { isOpError } from "@/lib/errors";
import { getStore, persistUnavailableBody } from "@/lib/get-store";
import { ownerCookieName } from "@/lib/owner";
import { partyCookieName } from "@/lib/party";
import { touchParty } from "@/lib/presence";
import { publicRoom } from "@/lib/public-room";
import { resolveRole } from "@/lib/role";
import { ALL_OPS, type ActorKind, type Op } from "@/lib/types";

type Params = { params: Promise<{ roomId: string }> };

function isOp(value: unknown): value is Op {
  return typeof value === "string" && (ALL_OPS as string[]).includes(value);
}

export async function POST(req: Request, { params }: Params) {
  const { roomId } = await params;
  const body = (await req.json()) as Record<string, unknown>;
  const op = body.op;
  const input =
    body.input && typeof body.input === "object" && !Array.isArray(body.input)
      ? (body.input as Record<string, string>)
      : {};
  const decideToken = typeof body.decideToken === "string" ? body.decideToken : undefined;
  // Share-link downgrade: ?as=contributor / body.as=contributor. Never elevates.
  const asParam = typeof body.as === "string" ? body.as : null;
  const viaRaw = typeof body.via === "string" ? body.via : "human";
  const via: ActorKind = viaRaw === "agent" ? "agent" : "human";

  const persistFail = persistUnavailableBody();
  if (persistFail) {
    return NextResponse.json(persistFail, { status: 503 });
  }

  if (!isOp(op)) {
    return NextResponse.json(
      { ok: false, code: "unknown_op", hint: "Body must include a known op." },
      { status: 400 },
    );
  }

  const store = getStore();
  const room = await peekRoom(store, roomId);
  if (!room) {
    return NextResponse.json(
      { ok: false, code: "not_found", hint: `Room ${roomId} does not exist.` },
      { status: 404 },
    );
  }

  const jar = await cookies();
  const cookieSecret = jar.get(ownerCookieName(roomId))?.value ?? null;
  const seat = resolveRole({
    roomId,
    ownerTokenHash: room.ownerTokenHash,
    cookieSecret,
    asParam,
  });

  try {
    const out = await applyOp(store, {
      roomId,
      seat,
      op,
      input,
      decideToken,
      via,
    });
    const partyId = jar.get(partyCookieName(roomId, seat))?.value ?? null;
    if (out.ok && out.room && partyId && /^[A-Za-z0-9_-]{8,64}$/.test(partyId)) {
      const latest = await store.getRoom(roomId);
      const merged = {
        ...out.room,
        parties: latest?.parties ?? out.room.parties,
      };
      touchParty(merged, partyId, seat, new Date().toISOString(), via);
      await store.putParties(roomId, merged.parties);
      out.room = merged;
    }
    return NextResponse.json({ ...out, room: publicRoom(out.room) });
  } catch (err) {
    if (isOpError(err)) {
      return NextResponse.json(err.toBody(), { status: 400 });
    }
    throw err;
  }
}
