"use client";

import { useState, type FormEvent } from "react";
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

export function PacketActions({ roomId, seat, packet, onUpdated }: Props) {
  const [pendingOp, setPendingOp] = useState<Op | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pending = pendingOp !== null;

  const [question, setQuestion] = useState("");
  const [label, setLabel] = useState("");
  const [body, setBody] = useState("");
  const [evidence, setEvidence] = useState("");
  const [comment, setComment] = useState("");
  const [challenge, setChallenge] = useState("");
  const [what, setWhat] = useState("");

  if (packet.status !== "open") return null;

  async function postOp(op: Op, input: Record<string, string>): Promise<boolean> {
    setPendingOp(op);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${roomId}/ops`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ seat, as: seat, op, input }),
      });
      const json = (await res.json()) as OpsJson;
      if (!json.ok || !json.room) {
        setError(json.hint ?? "Request failed");
        return false;
      }
      onUpdated(json.room);
      return true;
    } catch {
      setError("Network error");
      return false;
    } finally {
      setPendingOp(null);
    }
  }

  async function onOpenPacket(event: FormEvent) {
    event.preventDefault();
    const ok = await postOp("open_packet", { question: question.trim() });
    if (ok) setQuestion("");
  }

  async function onPropose(event: FormEvent) {
    event.preventDefault();
    const ok = await postOp("propose_option", {
      packetId: packet.id,
      label: label.trim(),
      body: body.trim(),
    });
    if (ok) {
      setLabel("");
      setBody("");
    }
  }

  async function onEvidence(event: FormEvent) {
    event.preventDefault();
    const ok = await postOp("attach_evidence", {
      packetId: packet.id,
      text: evidence.trim(),
    });
    if (ok) setEvidence("");
  }

  async function onComment(event: FormEvent) {
    event.preventDefault();
    const ok = await postOp("comment", {
      packetId: packet.id,
      text: comment.trim(),
    });
    if (ok) setComment("");
  }

  async function onChallenge(event: FormEvent) {
    event.preventDefault();
    const ok = await postOp("challenge", {
      packetId: packet.id,
      text: challenge.trim(),
    });
    if (ok) setChallenge("");
  }

  async function onRequestEvidence(event: FormEvent) {
    event.preventDefault();
    const ok = await postOp("request_evidence", {
      packetId: packet.id,
      what: what.trim(),
    });
    if (ok) setWhat("");
  }

  return (
    <section className="packet-actions" aria-label="Packet actions">
      <div className="packet-actions__header">
        <p className="eyebrow">Structured ops · {packet.id}</p>
        <h2>Contribute</h2>
      </div>

      <div className="packet-actions__grid">
        {seat === "owner" ? (
          <>
            <div className="packet-actions__card">
              <p className="packet-actions__card-title">Propose option</p>
              <p className="packet-actions__card-hint">
                Add a path forward for others to weigh and decide on.
              </p>
              <form onSubmit={(e) => void onPropose(e)}>
                <label>
                  Label
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Ship Friday"
                    disabled={pending}
                    required
                  />
                </label>
                <label>
                  Rationale
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Why this option"
                    rows={3}
                    disabled={pending}
                  />
                </label>
                <div className="packet-actions__submit">
                  <button type="submit" disabled={pending}>
                    {pendingOp === "propose_option" ? "Working…" : "Propose option"}
                  </button>
                </div>
              </form>
            </div>

            <div className="packet-actions__card">
              <p className="packet-actions__card-title">Attach evidence</p>
              <p className="packet-actions__card-hint">
                Facts and citations that support or constrain the decision.
              </p>
              <form onSubmit={(e) => void onEvidence(e)}>
                <label>
                  Evidence
                  <textarea
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    placeholder="Fact or citation"
                    rows={3}
                    disabled={pending}
                    required
                  />
                </label>
                <div className="packet-actions__submit">
                  <button type="submit" disabled={pending}>
                    {pendingOp === "attach_evidence" ? "Working…" : "Attach evidence"}
                  </button>
                </div>
              </form>
            </div>

            <div className="packet-actions__card">
              <p className="packet-actions__card-title">Open new packet</p>
              <p className="packet-actions__card-hint">
                Start a fresh decision when this one is closed or no longer relevant.
              </p>
              <form onSubmit={(e) => void onOpenPacket(e)}>
                <label>
                  Question
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What should we decide?"
                    disabled={pending}
                    required
                  />
                </label>
                <div className="packet-actions__submit">
                  <button type="submit" disabled={pending}>
                    {pendingOp === "open_packet" ? "Working…" : "Open packet"}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="packet-actions__card">
              <p className="packet-actions__card-title">Comment</p>
              <p className="packet-actions__card-hint">
                Leave a note on this packet without proposing a new option.
              </p>
              <form onSubmit={(e) => void onComment(e)}>
                <label>
                  Comment
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Note on this packet"
                    rows={3}
                    disabled={pending}
                    required
                  />
                </label>
                <div className="packet-actions__submit">
                  <button type="submit" disabled={pending}>
                    {pendingOp === "comment" ? "Working…" : "Comment"}
                  </button>
                </div>
              </form>
            </div>

            <div className="packet-actions__card">
              <p className="packet-actions__card-title">Challenge</p>
              <p className="packet-actions__card-hint">
                Contest an assumption before the packet is stamped closed.
              </p>
              <form onSubmit={(e) => void onChallenge(e)}>
                <label>
                  Challenge
                  <textarea
                    value={challenge}
                    onChange={(e) => setChallenge(e.target.value)}
                    placeholder="Assumption to contest"
                    rows={3}
                    disabled={pending}
                    required
                  />
                </label>
                <div className="packet-actions__submit">
                  <button type="submit" disabled={pending}>
                    {pendingOp === "challenge" ? "Working…" : "Challenge"}
                  </button>
                </div>
              </form>
            </div>

            <div className="packet-actions__card">
              <p className="packet-actions__card-title">Request evidence</p>
              <p className="packet-actions__card-hint">
                Flag what is missing before a decision can be made confidently.
              </p>
              <form onSubmit={(e) => void onRequestEvidence(e)}>
                <label>
                  What is missing?
                  <input
                    value={what}
                    onChange={(e) => setWhat(e.target.value)}
                    placeholder="What is missing?"
                    disabled={pending}
                    required
                  />
                </label>
                <div className="packet-actions__submit">
                  <button type="submit" disabled={pending}>
                    {pendingOp === "request_evidence" ? "Working…" : "Request evidence"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>

      {error ? <p className="packet-actions__error">{error}</p> : null}
    </section>
  );
}
