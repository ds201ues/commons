"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Room } from "@/lib/types";

type Props = {
  roomId: string
  /** When true, room already has an open decision — softer "+ Open another" affordance. */
  hasOpenDecision: boolean
  onUpdated: (room: Room) => void
};

/** Owner-only: open a decision outside the contribute tabs (rail taxonomy). */
export function OpenDecisionControl({ roomId, hasOpenDecision, onUpdated }: Props) {
  const [expanded, setExpanded] = useState(!hasOpenDecision);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasOpenDecision) setExpanded(true);
  }, [hasOpenDecision]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = question.trim();
    if (!value) return;
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
      setExpanded(false);
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  }

  if (!expanded) {
    return (
      <div className="open-decision">
        <button
          type="button"
          className="open-decision__link"
          onClick={() => setExpanded(true)}
        >
          + Open another decision
        </button>
      </div>
    );
  }

  return (
    <div className="open-decision open-decision--form">
      {!hasOpenDecision ? (
        <p className="open-decision__hint">Start with a decision question.</p>
      ) : null}
      <form className="open-decision__form" onSubmit={(e) => void onSubmit(e)}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What should we decide next?"
          disabled={pending}
          required
          autoComplete="off"
          aria-label="New decision question"
          autoFocus={hasOpenDecision}
        />
        <button type="submit" disabled={pending || !question.trim()}>
          {pending ? "Opening…" : "Open"}
        </button>
        {hasOpenDecision ? (
          <button
            type="button"
            className="open-decision__cancel"
            disabled={pending}
            onClick={() => {
              setExpanded(false);
              setQuestion("");
              setError(null);
            }}
          >
            Cancel
          </button>
        ) : null}
      </form>
      {error ? (
        <p className="open-decision__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
