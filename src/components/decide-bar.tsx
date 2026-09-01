"use client";

import { useState } from "react";
import type { Packet, PersistMode, Seat } from "@/lib/types";
import "./packets.css";

type Props = {
  roomId: string
  seat: Seat
  nonce?: string
  persist: PersistMode
  packet: Packet
  onDecided: () => void
};

export function DecideBar({ roomId, seat, nonce, persist, packet, onDecided }: Props) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const persistBlocked = persist === "ephemeral";

  if (packet.status !== "open") return null;

  async function decide(optionId: string) {
    if (persistBlocked || !nonce) return;
    setPending(optionId);
    setError(null);
    const res = await fetch(`/api/rooms/${roomId}/human/decide`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ packetId: packet.id, optionId, nonce, as: seat }),
    });
    const json = (await res.json()) as { ok: boolean; hint?: string };
    setPending(null);
    if (!json.ok) {
      setError(json.hint ?? "Decide failed");
      return;
    }
    onDecided();
  }

  return (
    <div className="decide-bar" role="region" aria-label="Decide">
      <div className="decide-bar__banner">
        <span className="decide-bar__seal" aria-hidden="true">
          Human only
        </span>
        <h2 className="decide-bar__title">Decide</h2>
      </div>
      <p className="decide-bar__subtitle">
        Only a human on this seat can close the packet. Decide is not a tool.
      </p>
      <div className="decide-bar__options" role="group" aria-label="Decision options">
        {packet.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className="decide-bar__option"
            disabled={pending !== null || persistBlocked || !nonce}
            onClick={() => void decide(opt.id)}
          >
            <span className="decide-bar__option-label">{opt.label}</span>
            <span className="decide-bar__option-cta">
              {pending === opt.id ? "Closing…" : "Stamp it"}
            </span>
          </button>
        ))}
      </div>
      {persistBlocked ? (
        <p className="decide-bar__error">
          Decide is disabled on this deploy: no Upstash Redis. Packets would not
          survive the next lambda.
        </p>
      ) : null}
      {error ? <p className="decide-bar__error">{error}</p> : null}
    </div>
  );
}
