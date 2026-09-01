import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { RoomView } from "@/components/room-view";
import { loadRoom } from "@/lib/apply-op";
import { getStore, persistMode } from "@/lib/get-store";
import { ownerCookieName } from "@/lib/owner";
import { resolveRole } from "@/lib/role";

type Props = {
  params: Promise<{ roomId: string }>
  searchParams: Promise<{ as?: string }>
};

export const dynamic = "force-dynamic";

export default async function RoomPage({ params, searchParams }: Props) {
  const { roomId } = await params;
  const { as: asParam } = await searchParams;

  const store = getStore();
  const room = await loadRoom(store, roomId);
  if (!room) notFound();

  const jar = await cookies();
  const cookieSecret = jar.get(ownerCookieName(roomId))?.value ?? null;
  const seat = resolveRole({
    roomId,
    ownerTokenHash: room.ownerTokenHash,
    cookieSecret,
    asParam: asParam ?? null,
  });

  const persist = persistMode();
  const nonce =
    persist !== "ephemeral" ? await store.issueHumanNonce(roomId) : undefined;

  return (
    <>
      {persist === "ephemeral" ? (
        <p className="persist-warn">
          This deploy has no Upstash Redis. Decide is disabled until
          UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set.
        </p>
      ) : null}
      <RoomView
        roomId={roomId}
        seat={seat}
        nonce={nonce}
        persist={persist}
        initialRoom={room}
      />
    </>
  );
}
