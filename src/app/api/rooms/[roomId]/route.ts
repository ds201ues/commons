import { NextResponse } from "next/server";
import { peekRoom } from "@/lib/apply-op";
import { isOpError } from "@/lib/errors";
import { getStore, persistMode } from "@/lib/get-store";

type Params = { params: Promise<{ roomId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { roomId } = await params;
  try {
    const room = await peekRoom(getStore(), roomId);
    if (!room) {
      return NextResponse.json(
        { ok: false, code: "not_found", hint: `Room ${roomId} does not exist.` },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, room, persist: persistMode() });
  } catch (err) {
    if (isOpError(err)) {
      return NextResponse.json(err.toBody(), { status: 400 });
    }
    throw err;
  }
}
