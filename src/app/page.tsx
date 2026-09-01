"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clearLastRoomId, readLastRoomId, writeLastRoomId } from "@/lib/last-room";
import { FIXTURE_ROOM_ID } from "@/lib/types";
import "./landing.css";

export default function HomePage() {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function enter() {
      const last = readLastRoomId();
      if (last) {
        try {
          const res = await fetch(`/api/rooms/${last}`, { cache: "no-store" });
          if (res.ok) {
            router.replace(`/r/${last}`);
            return;
          }
          if (res.status === 404) {
            clearLastRoomId();
          } else {
            router.replace(`/r/${last}`);
            return;
          }
        } catch {
          router.replace(`/r/${last}`);
          return;
        }
      }
      try {
        const res = await fetch("/api/rooms", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({}),
        });
        const json = (await res.json()) as {
          ok: boolean
          url?: string
          hint?: string
        };
        if (!json.ok || !json.url) {
          throw new Error(json.hint ?? "create failed");
        }
        const roomId = json.url.split("/").pop() ?? "";
        if (roomId) writeLastRoomId(roomId);
        router.replace(json.url);
      } catch {
        setError(
          "Could not open a room. Check your connection, then reload to retry.",
        );
      }
    }

    void enter();
  }, [router]);

  return (
    <main className="landing landing--splash">
      <p className="brand">Commons</p>
      <h1>Opening your room…</h1>
      <p className="lede">
        One link. Two powers. A human closes the call.
      </p>
      {error ? (
        <p className="splash-error" role="alert">
          {error}
        </p>
      ) : null}
      <p className="splash-demo">
        Just looking?{" "}
        <Link href={`/r/${FIXTURE_ROOM_ID}?as=owner`}>Open the demo room</Link>
      </p>
    </main>
  );
}
