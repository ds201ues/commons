import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { loadRoom } from "@/lib/apply-op";
import { getStore, persistUnavailableBody } from "@/lib/get-store";
import { ownerCookieName } from "@/lib/owner";
import { mintPartyId, partyCookieName } from "@/lib/party";
import { liveParties, touchParty } from "@/lib/presence";
import { resolveRole } from "@/lib/role";

type Params = { params: Promise<{ roomId: string }> };

/**
 * Heartbeat: mint/read a per-seat party cookie, resolve seat from the owner
 * cookie plus optional body.as (contributor downgrade on share links; fixture
 * `?as=` when the room has no owner hash). Parties live on a sidecar key so
 * heartbeats cannot clobber document writes.
 */
export async function POST(req: Request, { params }: Params) {
  const { roomId } = await params;

  const persistFail = persistUnavailableBody();
  if (persistFail) {
    return NextResponse.json(persistFail, { status: 503 });
  }

  let asParam: string | null = null;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    asParam = typeof body.as === "string" ? body.as : null;
  } catch {
    asParam = null;
  }

  const store = getStore();
  const room = await loadRoom(store, roomId);
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

  const existingParty = jar.get(partyCookieName(roomId, seat))?.value ?? null;
  const partyId =
    existingParty && /^[A-Za-z0-9_-]{8,64}$/.test(existingParty)
      ? existingParty
      : mintPartyId();
  const minted = partyId !== existingParty;

  touchParty(room, partyId, seat);
  await store.putParties(roomId, room.parties);

  const present = liveParties(room.parties);
  const res = NextResponse.json({
    ok: true,
    partyId,
    seat,
    parties: room.parties,
    present,
  });

  if (minted) {
    const secure = process.env.NODE_ENV === "production";
    res.cookies.set(partyCookieName(roomId, seat), partyId, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return res;
}
