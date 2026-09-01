"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function friendlyError(hint: string | undefined, status: number): string {
  if (hint?.trim()) return hint;
  if (status === 503) {
    return "The server is not ready to create rooms yet. Try again in a moment.";
  }
  if (status >= 500) {
    return "Something went wrong on our side. Try again — your fields are still here.";
  }
  return "Room creation failed. Check your connection and try again.";
}

export function CreateRoomForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || undefined,
          question: question.trim() || undefined,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean
        url?: string
        hint?: string
      };
      if (!json.ok || !json.url) {
        setError(friendlyError(json.hint, res.status));
        setPending(false);
        return;
      }
      router.push(json.url);
    } catch {
      setError("No response from the server. Check your connection and try again.");
      setPending(false);
    }
  }

  return (
    <form className="create-room" onSubmit={(e) => void onSubmit(e)}>
      <h2>Start a room</h2>
      <p className="create-room-intro">
        Name the room and the first decision question. You land as owner with a
        share link ready to copy.
      </p>

      <label>
        Room title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Checkout rewrite"
          disabled={pending}
          autoComplete="off"
        />
        <span className="field-hint">Optional — shows in the room header.</span>
      </label>

      <label>
        First decision question
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ship the checkout rewrite this Friday?"
          disabled={pending}
          autoComplete="off"
        />
        <span className="field-hint">
          Optional — opens the first packet when the room loads.
        </span>
      </label>

      <button type="submit" disabled={pending}>
        {pending ? "Creating room…" : "Create room and open as owner"}
      </button>

      {error ? (
        <p className="error" role="alert" aria-live="polite">{error}</p>
      ) : null}
    </form>
  );
}
