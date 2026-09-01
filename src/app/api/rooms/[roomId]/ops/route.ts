import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { applyOp, peekRoom } from "@/lib/apply-op";
import { isOpError } from "@/lib/errors";
import { getStore, persistUnavailableBody } from "@/lib/get-store";
import { ownerCookieName } from "@/lib/owner";
import { partyCookieName } from "@/lib/party";
import { touchParty } from "@/lib/presence";
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
  // Fixture-only demo override. Ignored when the room has ownerTokenHash.
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
    const partyId = jar.get(partyCookieName(roomId))?.value ?? null;
    if (out.ok && out.room && partyId && /^[A-Za-z0-9_-]{8,64}$/.test(partyId)) {
      touchParty(out.room, partyId, seat, new Date().toISOString(), via);
      await store.putRoom(roomId, out.room);
    }
    return NextResponse.json(out);
  } catch (err) {
    if (isOpError(err)) {
      return NextResponse.json(err.toBody(), { status: 400 });
    }
    throw err;
  }
}
