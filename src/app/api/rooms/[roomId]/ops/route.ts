import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { applyOp, peekRoom } from "@/lib/apply-op";
import { isOpError } from "@/lib/errors";
import { getStore, persistUnavailableBody } from "@/lib/get-store";
import { ownerCookieName } from "@/lib/owner";
import { resolveRole } from "@/lib/role";
import { ALL_OPS, normalizeSeat, type Op } from "@/lib/types";

type Params = { params: Promise<{ roomId: string }> };

function isOp(value: unknown): value is Op {
  return typeof value === "string" && (ALL_OPS as string[]).includes(value);
}

export async function POST(req: Request, { params }: Params) {
  const { roomId } = await params;
  const body = (await req.json()) as Record<string, unknown>;
  const claimed =
    typeof body.seat === "string" ? normalizeSeat(body.seat) : null;
  const op = body.op;
  const input =
    body.input && typeof body.input === "object" && !Array.isArray(body.input)
      ? (body.input as Record<string, string>)
      : {};
  const decideToken = typeof body.decideToken === "string" ? body.decideToken : undefined;
  const asParam = typeof body.as === "string" ? body.as : null;

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
  // Prefer explicit demo `as`; else forward claimed seat as demo override for fixture links.
  const seat = resolveRole({
    roomId,
    ownerTokenHash: room.ownerTokenHash,
    cookieSecret,
    asParam: asParam ?? claimed,
  });

  try {
    const out = await applyOp(store, {
      roomId,
      seat,
      op,
      input,
      decideToken,
    });
    return NextResponse.json(out);
  } catch (err) {
    if (isOpError(err)) {
      return NextResponse.json(err.toBody(), { status: 400 });
    }
    throw err;
  }
}
