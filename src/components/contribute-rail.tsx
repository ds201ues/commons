"use client";

import { useEffect, useState, type FormEvent } from "react";
import { DecisionsWall } from "@/components/decisions-wall";
import { OpenDecisionControl } from "@/components/open-decision-control";
import { normalizeSeat, type Packet, type Room, type Seat, type Task } from "@/lib/types";
import "./packets.css";

type TabId = "options" | "evidence" | "tasks" | "decisions";

type Props = {
  roomId: string
  seat: Seat
  packet: Packet | null
  packets: Packet[]
  tasks: Task[]
  highlightPacketId?: string | null
  onUpdated: (room: Room) => void
};

type OpsJson = {
  ok: boolean
  room?: Room
  hint?: string
};

const TABS: { id: TabId; label: string }[] = [
  { id: "options", label: "Options" },
  { id: "evidence", label: "Evidence" },
  { id: "tasks", label: "Tasks" },
  { id: "decisions", label: "Decisions" },
];

function formatSeat(seat: string) {
  const normalized = normalizeSeat(seat);
  return normalized === "owner" ? "Owner" : "Contributor";
}

export function ContributeRail({
  roomId,
  seat,
  packet,
  packets,
  tasks,
  highlightPacketId,
  onUpdated,
}: Props) {
  const openPacket = packet?.status === "open" ? packet : null;
  const hasOpen = Boolean(openPacket);
  const [tab, setTab] = useState<TabId>(hasOpen ? "options" : "tasks");
  const [text, setText] = useState("");
  const [rationale, setRationale] = useState("");
  const [assignee, setAssignee] = useState<Seat>(seat === "owner" ? "contributor" : "owner");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(true);

  useEffect(() => {
    if ((tab === "options" || tab === "evidence") && !hasOpen) {
      setTab("tasks");
    }
  }, [hasOpen, tab]);

  useEffect(() => {
    function onIntent(event: Event) {
      const detail = (event as CustomEvent<string>).detail;
      if (detail === "propose") setTab("options");
      else if (detail === "evidence") setTab("evidence");
      else if (detail === "task") setTab("tasks");
      else if (detail === "open_decision" || detail === "decisions") setTab("decisions");
      setCreating(true);
    }
    window.addEventListener("commons:intent", onIntent);
    return () => window.removeEventListener("commons:intent", onIntent);
  }, []);

  useEffect(() => {
    setText("");
    setRationale("");
    setError(null);
    setCreating(true);
  }, [tab]);

  async function submitCreate(event: FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;

    let op: string;
    let input: Record<string, string>;

    if (tab === "options") {
      if (!openPacket) return;
      op = "propose_option";
      input = { packetId: openPacket.id, label: value, body: rationale.trim() };
    } else if (tab === "evidence") {
      if (!openPacket) return;
      op = "attach_evidence";
      input = { packetId: openPacket.id, text: value };
    } else if (tab === "tasks") {
      op = "add_task";
      input = { text: value, assignee };
    } else {
      return;
    }

    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${roomId}/ops`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ as: seat, via: "human", op, input }),
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

  const options = openPacket?.options ?? [];
  const evidence = openPacket?.evidence ?? [];
  const challenges = openPacket?.challenges ?? [];
  const requests = openPacket?.requests ?? [];
  const comments = openPacket?.comments ?? [];
  const openTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);

  const createLabel =
    tab === "options"
      ? "+ New option"
      : tab === "evidence"
        ? "+ Attach evidence"
        : tab === "tasks"
          ? "+ Assign task"
          : null;

  return (
    <section className="contribute-rail" aria-label="Contribute">
      <div className="composer__intents contribute-rail__tabs" role="tablist" aria-label="Contribute sections">
        {TABS.map((item) => {
          const disabled =
            (item.id === "options" || item.id === "evidence") && !hasOpen;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={
                tab === item.id
                  ? "composer__intent composer__intent--active"
                  : "composer__intent"
              }
              disabled={disabled || pending}
              onClick={() => setTab(item.id)}
              title={
                disabled ? "Open a decision first" : undefined
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="contribute-rail__panel" role="tabpanel">
        {tab === "decisions" ? (
          <div className="contribute-rail__decisions">
            {seat === "owner" ? (
              <OpenDecisionControl
                roomId={roomId}
                hasOpenDecision={hasOpen}
                onUpdated={onUpdated}
              />
            ) : !hasOpen ? (
              <p className="packet__empty-inline">No open decision yet.</p>
            ) : (
              <p className="packet__empty-inline">
                Owner opens new decisions. Closed calls appear below.
              </p>
            )}
            <DecisionsWall
              packets={packets}
              highlightPacketId={highlightPacketId}
              embedded
            />
          </div>
        ) : (
          <>
            {createLabel ? (
              <div className="contribute-rail__create">
                {!creating ? (
                  <button
                    type="button"
                    className="contribute-rail__create-toggle"
                    onClick={() => setCreating(true)}
                  >
                    {createLabel}
                  </button>
                ) : (
                  <form className="composer__form" onSubmit={(e) => void submitCreate(e)}>
                    <div className="contribute-rail__create-head">
                      <span className="contribute-rail__create-label">{createLabel}</span>
                      <button
                        type="button"
                        className="contribute-rail__create-cancel"
                        disabled={pending}
                        onClick={() => {
                          setCreating(false);
                          setText("");
                          setRationale("");
                          setError(null);
                        }}
                      >
                        Hide
                      </button>
                    </div>
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={
                        tab === "options"
                          ? "Option label — e.g. Ship Friday"
                          : tab === "evidence"
                            ? "Fact or citation that informs the call"
                            : "Work to hand to a seat"
                      }
                      disabled={pending}
                      required
                      autoComplete="off"
                      aria-label={createLabel}
                    />
                    {tab === "options" ? (
                      <input
                        value={rationale}
                        onChange={(e) => setRationale(e.target.value)}
                        placeholder="Rationale (optional)"
                        disabled={pending}
                        autoComplete="off"
                        aria-label="Rationale (optional)"
                      />
                    ) : null}
                    {tab === "tasks" ? (
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
                      {pending
                        ? "Working…"
                        : tab === "options"
                          ? "Propose"
                          : tab === "evidence"
                            ? "Attach"
                            : "Assign"}
                    </button>
                  </form>
                )}
              </div>
            ) : null}

            {error ? (
              <p className="packet-actions__error" role="alert">
                {error}
              </p>
            ) : null}

            {tab === "options" ? (
              options.length === 0 ? (
                <p className="packet__empty-inline">No options yet.</p>
              ) : (
                <ol className="packet__options">
                  {options.map((opt) => (
                    <li
                      key={opt.id}
                      className={
                        openPacket?.decision?.optionId === opt.id
                          ? "packet__option packet__option--picked"
                          : "packet__option"
                      }
                    >
                      <strong className="packet__option-label">{opt.label}</strong>
                      {opt.body ? <p className="packet__option-body">{opt.body}</p> : null}
                    </li>
                  ))}
                </ol>
              )
            ) : null}

            {tab === "evidence" ? (
              evidence.length === 0 &&
              challenges.length === 0 &&
              requests.length === 0 &&
              comments.length === 0 ? (
                <p className="packet__empty-inline">No evidence yet.</p>
              ) : (
                <ul className="packet__feed">
                  {evidence.map((ev) => (
                    <li key={ev.id} className="packet__feed-item packet__feed-item--evidence">
                      <span className="packet__feed-meta">{formatSeat(ev.authorSeat)}</span>
                      {ev.text}
                    </li>
                  ))}
                  {challenges.map((ch) => (
                    <li key={ch.id} className="packet__feed-item packet__feed-item--challenge">
                      <span className="packet__feed-meta">Challenge · {formatSeat(ch.authorSeat)}</span>
                      {ch.text}
                    </li>
                  ))}
                  {requests.map((rq) => (
                    <li key={rq.id} className="packet__feed-item packet__feed-item--request">
                      <span className="packet__feed-meta">Request · {formatSeat(rq.authorSeat)}</span>
                      {rq.what}
                    </li>
                  ))}
                  {comments.map((cm) => (
                    <li key={cm.id} className="packet__feed-item packet__feed-item--comment">
                      <span className="packet__feed-meta">Comment · {formatSeat(cm.authorSeat)}</span>
                      {cm.text}
                    </li>
                  ))}
                </ul>
              )
            ) : null}

            {tab === "tasks" ? (
              tasks.length === 0 ? (
                <p className="packet__empty-inline">No tasks yet.</p>
              ) : (
                <ul className="contribute-rail__task-list">
                  {[...openTasks, ...doneTasks].map((task) => (
                    <li
                      key={task.id}
                      className={
                        task.done
                          ? "contribute-rail__task contribute-rail__task--done"
                          : "contribute-rail__task"
                      }
                    >
                      <span>{task.text}</span>
                      <span className={`task__assignee task__assignee--${task.assignee}`}>
                        {task.assignee}
                      </span>
                    </li>
                  ))}
                </ul>
              )
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
