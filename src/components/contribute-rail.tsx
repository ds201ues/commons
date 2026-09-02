"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { DecisionsWall } from "@/components/decisions-wall";
import { OpenDecisionControl } from "@/components/open-decision-control";
import { normalizeSeat, type Packet, type Room, type Seat } from "@/lib/types";
import "./packets.css";

type TabId = "options" | "evidence" | "tasks" | "decisions";
type EvidenceOp = "attach_evidence" | "comment" | "challenge" | "request_evidence";

type Props = {
  roomId: string
  seat: Seat
  packet: Packet | null
  packets: Packet[]
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

function evidenceOpsForSeat(seat: Seat): {
  op: EvidenceOp
  label: string
  placeholder: string
}[] {
  const shared: { op: EvidenceOp; label: string; placeholder: string }[] = [
    {
      op: "attach_evidence",
      label: "Evidence",
      placeholder: "Fact or citation that informs the call",
    },
    {
      op: "comment",
      label: "Comment",
      placeholder: "A note on this decision",
    },
  ];
  if (seat !== "contributor") return shared;
  return [
    ...shared,
    {
      op: "challenge",
      label: "Challenge",
      placeholder: "An assumption to pressure-test",
    },
    {
      op: "request_evidence",
      label: "Request",
      placeholder: "What fact is still missing",
    },
  ];
}

function formatSeat(seat: string) {
  const normalized = normalizeSeat(seat);
  return normalized === "owner" ? "Owner" : "Contributor";
}

export function ContributeRail({
  roomId,
  seat,
  packet,
  packets,
  highlightPacketId,
  onUpdated,
}: Props) {
  const openPacket = packet?.status === "open" ? packet : null;
  const hasOpen = Boolean(openPacket);
  const [tab, setTab] = useState<TabId>(hasOpen ? "options" : "tasks");
  const [text, setText] = useState("");
  const [assignee, setAssignee] = useState<Seat>(seat === "owner" ? "contributor" : "owner");
  const [evidenceOp, setEvidenceOp] = useState<EvidenceOp>("attach_evidence");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tabsId = useId();
  const panelId = `${tabsId}-panel`;
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});
  const inputRef = useRef<HTMLInputElement | null>(null);

  function tabButtonId(id: TabId) {
    return `${tabsId}-tab-${id}`;
  }

  function enabledTabIds(): TabId[] {
    return TABS.filter((item) => {
      if ((item.id === "options" || item.id === "evidence") && !hasOpen) return false;
      return true;
    }).map((item) => item.id);
  }

  function onTabListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }
    const ids = enabledTabIds();
    if (ids.length === 0) return;
    const idx = ids.indexOf(tab);
    const current = idx < 0 ? 0 : idx;
    let nextIdx = current;
    if (event.key === "ArrowRight") nextIdx = (current + 1) % ids.length;
    else if (event.key === "ArrowLeft") nextIdx = (current - 1 + ids.length) % ids.length;
    else if (event.key === "Home") nextIdx = 0;
    else nextIdx = ids.length - 1;
    event.preventDefault();
    const next = ids[nextIdx];
    setTab(next);
    queueMicrotask(() => tabRefs.current[next]?.focus());
  }

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
    }
    window.addEventListener("commons:intent", onIntent);
    return () => window.removeEventListener("commons:intent", onIntent);
  }, []);

  useEffect(() => {
    setText("");
    setError(null);
    setEvidenceOp("attach_evidence");
  }, [tab]);

  async function submitCreate(event?: FormEvent) {
    event?.preventDefault();
    const value = text.trim();
    if (!value || pending) return;

    let op: string;
    let input: Record<string, string>;

    if (tab === "options") {
      if (!openPacket) return;
      op = "propose_option";
      input = { packetId: openPacket.id, label: value, body: "" };
    } else if (tab === "evidence") {
      if (!openPacket) return;
      op = evidenceOp;
      input =
        evidenceOp === "request_evidence"
          ? { packetId: openPacket.id, what: value }
          : { packetId: openPacket.id, text: value };
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
      queueMicrotask(() => inputRef.current?.focus());
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

  const evidenceKinds = evidenceOpsForSeat(seat);
  const evidenceKind =
    evidenceKinds.find((item) => item.op === evidenceOp) ?? evidenceKinds[0];

  const placeholder =
    tab === "options"
      ? "Add an option — press Enter"
      : tab === "evidence"
        ? `${evidenceKind.placeholder} — press Enter`
        : "Assign a task — press Enter";

  const showCreate = tab === "options" || tab === "evidence" || tab === "tasks";

  return (
    <section className="contribute-rail" aria-label="Contribute">
      <div
        className="composer__intents contribute-rail__tabs"
        role="tablist"
        aria-label="Contribute sections"
        onKeyDown={onTabListKeyDown}
      >
        {TABS.map((item) => {
          const disabled =
            (item.id === "options" || item.id === "evidence") && !hasOpen;
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              id={tabButtonId(item.id)}
              ref={(node) => {
                tabRefs.current[item.id] = node;
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              className={
                selected
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

      <div
        className="contribute-rail__panel"
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabButtonId(tab)}
      >
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
            {showCreate ? (
              <form
                className="composer__form composer__form--inline"
                onSubmit={(e) => void submitCreate(e)}
              >
                {tab === "evidence" ? (
                  <select
                    value={evidenceOp}
                    onChange={(e) => setEvidenceOp(e.target.value as EvidenceOp)}
                    disabled={pending}
                    aria-label="Contribution kind"
                  >
                    {evidenceKinds.map((item) => (
                      <option key={item.op} value={item.op}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                ) : null}
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={placeholder}
                  disabled={pending}
                  required
                  autoComplete="off"
                  aria-label={
                    tab === "options"
                      ? "New option"
                      : tab === "evidence"
                        ? evidenceKind.label
                        : "New task"
                  }
                />
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
              </form>
            ) : null}

            {error ? (
              <p className="contribute-rail__error" role="alert">
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
          </>
        )}
      </div>
    </section>
  );
}
