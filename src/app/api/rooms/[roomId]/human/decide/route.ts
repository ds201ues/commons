import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { applyOp, peekRoom } from "@/lib/apply-op";
import { isOpError } from "@/lib/errors";
import { getStore, persistUnavailableBody } from "@/lib/get-store";
import { ownerCookieName } from "@/lib/owner";
import { publicRoom } from "@/lib/public-room";
import { resolveRole } from "@/lib/role";

type Params = { params: Promise<{ roomId: string }> };

export async function POST(req: Request, { params }: Params) {
  const { roomId } = await params;
  const body = (await req.json()) as Record<string, unknown>;
  const packetId = typeof body.packetId === "string" ? body.packetId : "";
  const optionId = typeof body.optionId === "string" ? body.optionId : "";
  const nonce = typeof body.nonce === "string" ? body.nonce : "";
  const asParam = typeof body.as === "string" ? body.as : null;

  const persistFail = persistUnavailableBody();
  if (persistFail) {
    return NextResponse.json(persistFail, { status: 503 });
  }

  if (!packetId || !optionId || !nonce) {
    return NextResponse.json(
      { ok: false, code: "not_found", hint: "packetId, optionId, and nonce are required." },
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
  // Real rooms: owner cookie, unless body.as asks for a contributor downgrade.
  // Fixture rooms without ownerTokenHash may use body.as either direction.
  const seat = resolveRole({
    roomId,
    ownerTokenHash: room.ownerTokenHash,
    cookieSecret,
    asParam,
  });

  const okNonce = await store.takeHumanNonce(roomId, nonce);
  if (!okNonce) {
    return NextResponse.json(
      {
        ok: false,
        code: "needs_human_decide",
        hint: "This Decide click expired. Reload the page and click again.",
      },
      { status: 400 },
    );
  }

  try {
    const token = await store.mintDecideToken({ roomId, packetId, optionId });
    const out = await applyOp(store, {
      roomId,
      seat,
      op: "decide",
      input: { packetId, optionId },
      decideToken: token,
    });
    return NextResponse.json({ ...out, room: publicRoom(out.room) });
  } catch (err) {
    if (isOpError(err)) {
      return NextResponse.json(err.toBody(), { status: 400 });
    }
    throw err;
  }
}
