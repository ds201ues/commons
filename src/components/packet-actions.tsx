"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Op, Packet, Room, Seat } from "@/lib/types";
import "./packets.css";

type Props = {
  roomId: string
  seat: Seat
  packet: Packet  // must be open; parent hides if decided
  onUpdated: (room: Room) => void
};

type OpsJson = {
  ok: boolean
  room?: Room
  hint?: string
};

type Intent = {
  id: string
  op: Op
  label: string
  placeholder: string
  submitLabel: string
  needsRationale?: boolean
  needsAssignee?: boolean
};

const OWNER_INTENTS: Intent[] = [
  {
    id: "propose",
    op: "propose_option",
    label: "Propose",
    placeholder: "Option label — e.g. Ship Friday",
    submitLabel: "Propose",
    needsRationale: true,
  },
  {
    id: "evidence",
    op: "attach_evidence",
    label: "Evidence",
    placeholder: "Fact or citation that informs the call",
    submitLabel: "Attach",
  },
  {
    id: "open_decision",
    op: "open_decision",
    label: "New decision",
    placeholder: "What should we decide next?",
    submitLabel: "Open",
  },
  {
    id: "task",
    op: "add_task",
    label: "Task",
    placeholder: "Work to hand to a seat",
    submitLabel: "Assign",
    needsAssignee: true,
  },
];

const CONTRIBUTOR_INTENTS: Intent[] = [
  {
    id: "comment",
    op: "comment",
    label: "Comment",
    placeholder: "Note on this packet",
    submitLabel: "Comment",
  },
  {
    id: "challenge",
    op: "challenge",
    label: "Challenge",
    placeholder: "Assumption to contest",
    submitLabel: "Challenge",
  },
  {
    id: "request",
    op: "request_evidence",
    label: "Request evidence",
    placeholder: "What is missing before we can decide?",
    submitLabel: "Request",
  },
  {
    id: "task",
    op: "add_task",
    label: "Task",
    placeholder: "Work to hand to a seat",
    submitLabel: "Assign",
    needsAssignee: true,
  },
];

export function PacketActions({ roomId, seat, packet, onUpdated }: Props) {
  const intents = seat === "owner" ? OWNER_INTENTS : CONTRIBUTOR_INTENTS;
  const [intentId, setIntentId] = useState(intents[0]?.id ?? "comment");
  const [text, setText] = useState("");
  const [rationale, setRationale] = useState("");
  const [assignee, setAssignee] = useState<Seat>(seat === "owner" ? "contributor" : "owner");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intent = intents.find((i) => i.id === intentId) ?? intents[0];

  useEffect(() => {
    function onIntent(event: Event) {
      const detail = (event as CustomEvent<string>).detail;
      if (intents.some((i) => i.id === detail)) setIntentId(detail);
    }
    window.addEventListener("commons:intent", onIntent);
    return () => window.removeEventListener("commons:intent", onIntent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seat]);

  if (packet.status !== "open") return null;
  if (!intent) return null;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (!value || !intent) return;

    let input: Record<string, string>;
    switch (intent.op) {
      case "propose_option":
        input = { packetId: packet.id, label: value, body: rationale.trim() };
        break;
      case "attach_evidence":
      case "comment":
      case "challenge":
        input = { packetId: packet.id, text: value };
        break;
      case "request_evidence":
        input = { packetId: packet.id, what: value };
        break;
      case "open_decision":
        input = { question: value };
        break;
      case "add_task":
        input = { text: value, assignee };
        break;
      default:
        return;
    }

    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${roomId}/ops`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ seat, as: seat, op: intent.op, input }),
      });
      const json = (await res.json()) as OpsJson;
      if (!json.ok || !json.room) {
        setError(json.hint ?? "Request failed");
        return;
      }
      onUpdated(json.room);
      setText("");
      setRationale("");
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="packet-actions composer" aria-label="Contribute">
      <div className="composer__intents" role="tablist" aria-label="Action type">
        {intents.map((i) => (
          <button
            key={i.id}
            type="button"
            role="tab"
            aria-selected={i.id === intent.id}
            className={
              i.id === intent.id
                ? "composer__intent composer__intent--active"
                : "composer__intent"
            }
            onClick={() => setIntentId(i.id)}
            disabled={pending}
          >
            {i.label}
          </button>
        ))}
      </div>

      <form className="composer__form" onSubmit={(e) => void onSubmit(e)}>
        <input
          id="packet-composer-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={intent.placeholder}
          disabled={pending}
          required
          autoComplete="off"
          aria-label={intent.label}
        />
        {intent.needsRationale ? (
          <input
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Rationale (optional)"
            disabled={pending}
            autoComplete="off"
            aria-label="Rationale (optional)"
          />
        ) : null}
        {intent.needsAssignee ? (
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value as Seat)}
            disabled={pending}
            aria-label="Assign to seat"
          >
            <option value="owner">Owner</option>
            <option value="contributor">Contributor</option>
          </select>
        ) : null}
        <button type="submit" disabled={pending || !text.trim()}>
          {pending ? "Working…" : intent.submitLabel}
        </button>
      </form>

      {error ? <p className="packet-actions__error" role="alert">{error}</p> : null}
    </section>
  );
}
