"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Room } from "@/lib/types";

type Props = {
  roomId: string
  /** When true, room already has an open decision. */
  hasOpenDecision: boolean
  onUpdated: (room: Room) => void
};

/** Owner-only: open a decision with a single-line Enter submit. */
export function OpenDecisionControl({ roomId, hasOpenDecision, onUpdated }: Props) {
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = question.trim();
    if (!value || pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${roomId}/ops`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          as: "owner",
          via: "human",
          op: "open_decision",
          input: { question: value },
        }),
      });
      const json = (await res.json()) as { ok: boolean; room?: Room; hint?: string };
      if (!json.ok || !json.room) {
        setError(json.hint ?? "Could not open decision");
        return;
      }
      onUpdated(json.room);
      setQuestion("");
      queueMicrotask(() => inputRef.current?.focus());
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="open-decision open-decision--form">
      <form className="open-decision__form open-decision__form--inline" onSubmit={(e) => void onSubmit(e)}>
        <input
          ref={inputRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={
            hasOpenDecision
              ? "Open another decision — press Enter"
              : "What should we decide? — press Enter"
          }
          disabled={pending}
          required
          autoComplete="off"
          aria-label="New decision question"
        />
      </form>
      {error ? (
        <p className="open-decision__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
