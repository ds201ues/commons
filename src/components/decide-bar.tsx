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
  variant?: "inline" | "sticky"
  onDecided: (packetId: string) => void
};

function truncateQuestion(text: string, max = 72): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function DecideBar({
  roomId,
  seat,
  nonce,
  persist,
  packet,
  variant = "inline",
  onDecided,
}: Props) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const persistBlocked = persist === "ephemeral";
  const disabled = pending || persistBlocked || !nonce;

  if (packet.status !== "open") return null;

  async function stampDecide() {
    if (!selectedOptionId || persistBlocked || !nonce) return;
    setPending(true);
    setError(null);
    const res = await fetch(`/api/rooms/${roomId}/human/decide`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ packetId: packet.id, optionId: selectedOptionId, nonce, as: seat }),
    });
    const json = (await res.json()) as { ok: boolean; hint?: string };
    setPending(false);
    if (!json.ok) {
      setError(json.hint ?? "Decide failed");
      return;
    }
    onDecided(packet.id);
  }

  const optionPills = (
    <div
      className="decide-bar__pills"
      role="radiogroup"
      aria-label="Decision options"
    >
      {packet.options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="radio"
          aria-checked={selectedOptionId === opt.id}
          className={
            selectedOptionId === opt.id
              ? "decide-bar__pill decide-bar__pill--selected"
              : "decide-bar__pill"
          }
          disabled={disabled}
          onClick={() => setSelectedOptionId(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  const stampButton = (
    <button
      type="button"
      className="decide-bar__stamp"
      disabled={disabled || !selectedOptionId}
      onClick={() => void stampDecide()}
    >
      {pending ? "Closing…" : "Stamp Decide"}
    </button>
  );

  const errorBlock = (
    <>
      {persistBlocked ? (
        <p className="decide-bar__error">
          Decide is disabled on this deploy: no Upstash Redis. The decision would
          not survive the next lambda.
        </p>
      ) : null}
      {error ? <p className="decide-bar__error">{error}</p> : null}
    </>
  );

  if (variant === "sticky") {
    return (
      <div className="decide-bar decide-bar--sticky" role="region" aria-label="Decide">
        <span className="decide-bar__seal decide-bar__seal--compact" aria-hidden="true">
          Human only
        </span>
        <p className="decide-bar__question" title={packet.question}>
          {truncateQuestion(packet.question)}
        </p>
        {optionPills}
        {stampButton}
        {errorBlock}
      </div>
    );
  }

  return (
    <div className="decide-bar" role="region" aria-label="Decide">
      <div className="decide-bar__banner">
        <span className="decide-bar__seal" aria-hidden="true">
          Human only
        </span>
        <h2 className="decide-bar__title">Decide</h2>
      </div>
      {packet.options.length === 0 ? (
        <p className="decide-bar__subtitle">Propose an option above, then stamp.</p>
      ) : null}
      {optionPills}
      <div className="decide-bar__actions">
        {stampButton}
      </div>
      {errorBlock}
    </div>
  );
}
