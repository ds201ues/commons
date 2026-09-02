"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
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

function collapseStorageKey(roomId: string) {
  return `commons_decide_collapsed_${roomId}`;
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
  /** Sticky Decide starts minimized; Expand is opt-in. */
  const [collapsed, setCollapsed] = useState(true);
  const persistBlocked = persist === "ephemeral";
  const disabled = pending || persistBlocked || !nonce;
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function moveRadioSelection(fromId: string, key: string) {
    const opts = packet.options;
    if (opts.length === 0) return;
    const idx = opts.findIndex((o) => o.id === fromId);
    const current = idx < 0 ? 0 : idx;
    let nextIdx = current;
    if (key === "ArrowRight" || key === "ArrowDown") {
      nextIdx = (current + 1) % opts.length;
    } else if (key === "ArrowLeft" || key === "ArrowUp") {
      nextIdx = (current - 1 + opts.length) % opts.length;
    } else if (key === "Home") {
      nextIdx = 0;
    } else if (key === "End") {
      nextIdx = opts.length - 1;
    } else {
      return;
    }
    const next = opts[nextIdx];
    setSelectedOptionId(next.id);
    pillRefs.current[next.id]?.focus();
  }

  function onRadioKeyDown(event: KeyboardEvent<HTMLButtonElement>, optId: string) {
    if (disabled) return;
    if (
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight" &&
      event.key !== "ArrowUp" &&
      event.key !== "ArrowDown" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }
    event.preventDefault();
    moveRadioSelection(optId, event.key);
  }

  useEffect(() => {
    setSelectedOptionId(null);
  }, [packet.id]);

  useEffect(() => {
    if (variant !== "sticky") return;
    try {
      const stored = window.localStorage.getItem(collapseStorageKey(roomId));
      // Default minimized when unset; only "0" expands on load.
      setCollapsed(stored !== "0");
    } catch {
      setCollapsed(true);
    }
  }, [roomId, variant]);

  function setCollapsedPersist(next: boolean) {
    setCollapsed(next);
    try {
      window.localStorage.setItem(collapseStorageKey(roomId), next ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  if (packet.status !== "open") return null;

  async function stampDecide() {
    if (!selectedOptionId || persistBlocked || !nonce) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${roomId}/human/decide`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packetId: packet.id, optionId: selectedOptionId, nonce, as: seat }),
      });
      const json = (await res.json()) as { ok: boolean; hint?: string };
      if (!json.ok) {
        setError(json.hint ?? "Decide failed");
        return;
      }
      onDecided(packet.id);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  const optionPills = (
    <div
      className="decide-bar__pills"
      role="radiogroup"
      aria-label="Decision options"
    >
      {packet.options.map((opt, index) => (
        <button
          key={opt.id}
          ref={(node) => {
            pillRefs.current[opt.id] = node;
          }}
          type="button"
          role="radio"
          aria-checked={selectedOptionId === opt.id}
          tabIndex={
            selectedOptionId === opt.id || (selectedOptionId === null && index === 0)
              ? 0
              : -1
          }
          className={
            selectedOptionId === opt.id
              ? "decide-bar__pill decide-bar__pill--selected"
              : "decide-bar__pill"
          }
          disabled={disabled}
          onClick={() => setSelectedOptionId(opt.id)}
          onKeyDown={(event) => onRadioKeyDown(event, opt.id)}
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
        <p className="decide-bar__error" role="alert">
          Decide is disabled on this deploy: no Upstash Redis. The decision would
          not survive the next lambda.
        </p>
      ) : null}
      {error ? (
        <p className="decide-bar__error" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );

  if (variant === "sticky") {
    if (collapsed) {
      return (
        <div
          className="decide-bar decide-bar--sticky decide-bar--collapsed"
          role="region"
          aria-label="Decide"
        >
          <span className="decide-bar__seal decide-bar__seal--compact" aria-hidden="true">
            Human only
          </span>
          <p className="decide-bar__question" title={packet.question}>
            {truncateQuestion(packet.question, 48)}
          </p>
          <span className="decide-bar__collapsed-meta">
            {packet.options.length} option{packet.options.length === 1 ? "" : "s"}
            {selectedOptionId ? " · selected" : ""}
          </span>
          <button
            type="button"
            className="decide-bar__collapse"
            onClick={() => setCollapsedPersist(false)}
            aria-expanded={false}
          >
            Expand
          </button>
        </div>
      );
    }

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
        <button
          type="button"
          className="decide-bar__collapse"
          onClick={() => setCollapsedPersist(true)}
          aria-expanded={true}
          title="Collapse to a single line"
        >
          Minimize
        </button>
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
