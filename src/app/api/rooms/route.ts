import { NextResponse } from "next/server";
import { createRoom } from "@/lib/create-room";
import { getStore, persistUnavailableBody } from "@/lib/get-store";
import { ownerCookieName } from "@/lib/owner";

export async function POST(req: Request) {
  const persistFail = persistUnavailableBody();
  if (persistFail) {
    return NextResponse.json(persistFail, { status: 503 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const title = typeof body.title === "string" ? body.title : undefined;
  const question = typeof body.question === "string" ? body.question : undefined;

  const { room, ownerSecret } = await createRoom(getStore(), { title, question });
  const url = `/r/${room.id}`;

  const res = NextResponse.json({
    ok: true,
    roomId: room.id,
    url,
  });

  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(ownerCookieName(room.id), ownerSecret, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return res;
}
