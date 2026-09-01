"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AboutModal } from "@/components/about-modal";
import { DecideBar } from "@/components/decide-bar";
import { ContributeRail } from "@/components/contribute-rail";
import { DocEditor } from "@/components/doc-editor";
import { PacketList } from "@/components/packet-list";
import { PacketPanel } from "@/components/packet-panel";
import { PatchLog } from "@/components/patch-log";
import { ShareModal } from "@/components/share-modal";
import { TasksPanel } from "@/components/tasks-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { WebmcpRegistrar } from "@/components/webmcp-registrar";
import { openPackets, pickUiActivePacket } from "@/lib/active-packet";
import { canStickyDecide } from "@/lib/decide-sticky";
import { writeLastRoomId } from "@/lib/last-room";
import { liveParties, shortPartyLabel } from "@/lib/presence";
import { partiesPresenceSignature, roomPollSignature } from "@/lib/room-dirty";
import type { Party, PersistMode, Room, Seat } from "@/lib/types";
import "./room-shell.css";

type Props = {
  roomId: string
  seat: Seat
  nonce?: string
  persist: PersistMode
  initialRoom: Room
};

type Capability = {
  label: string
  tool: string
};

const OWNER_CAPABILITIES: Capability[] = [
  { label: "Read workspace", tool: "get_workspace" },
  { label: "Edit document", tool: "edit_doc" },
  { label: "Rename room", tool: "rename_room" },
  { label: "Open decisions", tool: "open_decision" },
  { label: "Propose options", tool: "propose_option" },
  { label: "Attach evidence", tool: "attach_evidence" },
  { label: "Assign tasks", tool: "add_task" },
  { label: "Complete tasks", tool: "complete_task" },
];

const CONTRIBUTOR_CAPABILITIES: Capability[] = [
  { label: "Read workspace", tool: "get_workspace" },
  { label: "Edit document", tool: "edit_doc" },
  { label: "Propose options", tool: "propose_option" },
  { label: "Attach evidence", tool: "attach_evidence" },
  { label: "Comment", tool: "comment" },
  { label: "Challenge", tool: "challenge" },
  { label: "Request evidence", tool: "request_evidence" },
  { label: "Assign tasks", tool: "add_task" },
  { label: "Complete tasks", tool: "complete_task" },
];

export function RoomView({ roomId, seat, nonce, persist, initialRoom }: Props) {
  const [room, setRoom] = useState(initialRoom);
  const [shareOpen, setShareOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [highlightPacketId, setHighlightPacketId] = useState<string | null>(null);
  const [activePacketId, setActivePacketId] = useState<string | null>(
    () => pickUiActivePacket(initialRoom)?.id ?? null,
  );
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [selfPartyId, setSelfPartyId] = useState<string | null>(null);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const shareBtnRef = useRef<HTMLButtonElement>(null);
  const aboutBtnRef = useRef<HTMLButtonElement>(null);
  const highlightTimerRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/rooms/${roomId}`, { cache: "no-store" });
    const json = (await res.json()) as { ok: boolean; room?: Room };
    if (!json.ok || !json.room) return;
    const next = json.room;
    setRoom((prev) =>
      roomPollSignature(prev) === roomPollSignature(next) ? prev : next,
    );
  }, [roomId]);

  const heartbeat = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/presence`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        // Contributor share links send as=contributor so the owner cookie cannot
        // make ChatGPT (same browser) look like Owner.
        body: JSON.stringify({ as: seat }),
      });
      const json = (await res.json()) as {
        ok: boolean
        partyId?: string
        parties?: Party[]
      };
      if (!json.ok) return;
      if (json.partyId) setSelfPartyId(json.partyId);
      if (json.parties) {
        const incoming = json.parties;
        setRoom((prev) =>
          partiesPresenceSignature(prev.parties) === partiesPresenceSignature(incoming)
            ? prev
            : { ...prev, parties: incoming },
        );
      }
    } catch {
      // presence is best-effort
    }
  }, [roomId, seat]);

  useEffect(() => {
    void heartbeat();
    const id = window.setInterval(() => {
      void heartbeat();
    }, 12_000);
    return () => window.clearInterval(id);
  }, [heartbeat]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void refresh();
    }, 1200);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem("commons_theme", next);
    } catch {
      // private mode — theme lasts for the session only
    }
    setTheme(next);
  }

  async function createNewRoom() {
    if (creatingRoom) return;
    setCreatingRoom(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = (await res.json()) as {
        ok: boolean
        url?: string
        roomId?: string
        hint?: string
      };
      if (!json.ok || !json.url) {
        setCreateError(json.hint ?? "Could not open a new room.");
        setCreatingRoom(false);
        return;
      }
      const nextId = json.roomId ?? json.url.split("/").pop() ?? "";
      if (nextId) writeLastRoomId(nextId);
      // Full navigation so the new owner cookie from Set-Cookie is applied.
      window.location.assign(json.url);
    } catch {
      setCreateError("Could not open a new room. Check your connection.");
      setCreatingRoom(false);
    }
  }

  async function saveTitle() {
    setEditingTitle(false);
    const title = titleDraft.trim();
    if (!title || title === room.title) return;
    setRoom({ ...room, title });
    try {
      const res = await fetch(`/api/rooms/${roomId}/ops`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          as: seat,
          via: "human",
          op: "rename_room",
          input: { title },
        }),
      });
      const json = (await res.json()) as { ok: boolean; room?: Room };
      if (json.ok && json.room) setRoom(json.room);
      else void refresh();
    } catch {
      void refresh();
    }
  }

  const present = useMemo(() => liveParties(room.parties), [room.parties]);
  const opens = useMemo(() => openPackets(room), [room]);

  useEffect(() => {
    if (opens.length === 0) {
      setActivePacketId(null);
      return;
    }
    if (activePacketId && opens.some((p) => p.id === activePacketId)) return;
    setActivePacketId(pickUiActivePacket(room)?.id ?? null);
  }, [opens, activePacketId, room]);

  const openPacket =
    opens.find((p) => p.id === activePacketId) ??
    pickUiActivePacket(room) ??
    room.packets[0];
  const stickyDecide = canStickyDecide(openPacket);

  function handleDecided(packetId: string) {
    setHighlightPacketId(packetId);
    if (highlightTimerRef.current !== null) {
      window.clearTimeout(highlightTimerRef.current);
    }
    highlightTimerRef.current = window.setTimeout(() => {
      setHighlightPacketId(null);
      highlightTimerRef.current = null;
    }, 2500);
    void refresh();
  }

  const capabilities = seat === "owner" ? OWNER_CAPABILITIES : CONTRIBUTOR_CAPABILITIES;
  const dialogOpen = shareOpen || aboutOpen;

  return (
    <div className={`room shell seat-${seat}`}>
      <WebmcpRegistrar roomId={roomId} seat={seat} />

      <div inert={dialogOpen || undefined}>
      <header className="room-header">
        <div className="room-header-top">
          <p className="brand">Commons</p>
          <p
            className={`seat-badge seat-badge--${seat}`}
            title={
              seat === "owner"
                ? "This tab is Owner. Copy the share link for Contributor / agent."
                : "This tab is Contributor. Agent tools and edits are attributed here."
            }
          >
            {seat === "owner" ? "Owner" : "Contributor"}
          </p>
          {seat === "owner" && editingTitle ? (
            <input
              className="room-title-input"
              value={titleDraft}
              autoFocus
              maxLength={120}
              aria-label="Room title"
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => void saveTitle()}
              onKeyDown={(e) => {
                if (e.key === "Enter") void saveTitle();
                if (e.key === "Escape") setEditingTitle(false);
              }}
            />
          ) : seat === "owner" ? (
            <h1 className="room-title">
              <button
                type="button"
                className="room-title__btn"
                title="Rename the room"
                onClick={() => {
                  setTitleDraft(room.title);
                  setEditingTitle(true);
                }}
              >
                {room.title}
              </button>
            </h1>
          ) : (
            <h1 className="room-title">{room.title}</h1>
          )}
          <ul className="presence presence--circles" aria-label="People in this room">
            {present.length === 0 ? (
              <li
                className={`presence__avatar presence__avatar--${seat} presence__avatar--self`}
                title={`You · ${seat}`}
              >
                <span className="presence__initial">Y</span>
                <span className="visually-hidden">{`You · ${seat}`}</span>
              </li>
            ) : (
              present.map((party) => {
                const mine = selfPartyId === party.id;
                const agent = party.lastActor === "agent";
                const initial =
                  party.seat === "owner" ? (mine ? "Y" : "O") : mine ? "Y" : "C";
                const title = [
                  mine ? "You" : party.seat === "owner" ? "Owner" : `Contributor · ${shortPartyLabel(party.id)}`,
                  agent ? "Agent active" : "Human",
                ].join(" · ");
                return (
                  <li
                    key={party.id}
                    className={[
                      "presence__avatar",
                      `presence__avatar--${party.seat}`,
                      mine ? "presence__avatar--self" : "",
                      agent ? "presence__avatar--agent" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    title={title}
                  >
                    <span className="presence__initial">{initial}</span>
                    {agent ? (
                      <span className="presence__agent-dot" aria-hidden="true" />
                    ) : null}
                    <span className="visually-hidden">{title}</span>
                  </li>
                );
              })
            )}
          </ul>
          <div className="room-actions">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button
              ref={shareBtnRef}
              type="button"
              className="share-btn"
              onClick={() => setShareOpen(true)}
            >
              Copy share link
            </button>
            <button
              type="button"
              className="bar-btn"
              disabled={creatingRoom}
              onClick={() => void createNewRoom()}
            >
              {creatingRoom ? "Opening…" : "New room"}
            </button>
            <button
              ref={aboutBtnRef}
              type="button"
              className="bar-btn"
              onClick={() => setAboutOpen(true)}
            >
              About
            </button>
          </div>
        </div>
        {createError ? (
          <p className="room-action-error" role="alert">
            {createError}
          </p>
        ) : null}

        <details className="capabilities">
          <summary>Your agent can</summary>
          <ul className="capability-chips" aria-label="Agent capabilities for this seat">
            {capabilities.map((cap) => (
              <li key={cap.tool} className="capability-chip" title={cap.tool}>
                <strong>{cap.label}</strong>
                <span>{cap.tool}</span>
              </li>
            ))}
          </ul>
          <p className="capabilities-note">
            Decide is a human action on this page — not a registered tool. Copy
            the share link for Contributor (and your agent). This tab without
            the join query stays Owner.
          </p>
        </details>
      </header>

      <main className="room-desk">
        <div className="room-desk__main">
          <section className="room-section room-section--doc" aria-label="Brief column">
            <DocEditor
              roomId={roomId}
              seat={seat}
              docMarkdown={room.docMarkdown}
              onSaved={setRoom}
            />
          </section>

          <PatchLog log={room.log} />
        </div>

        <aside className="room-desk__rail" aria-label="Decision surface">
          <PacketList
            packets={room.packets}
            activePacketId={activePacketId}
            onSelect={setActivePacketId}
          />

          {/* Tabs (assign-only Tasks) → Tasks list → Now deciding → Decide */}
          <ContributeRail
            roomId={roomId}
            seat={seat}
            packet={openPacket?.status === "open" ? openPacket : null}
            packets={room.packets}
            highlightPacketId={highlightPacketId}
            onUpdated={setRoom}
          />

          <TasksPanel
            roomId={roomId}
            seat={seat}
            tasks={room.tasks ?? []}
            onUpdated={setRoom}
          />

          {openPacket ? (
            <PacketPanel packet={openPacket} />
          ) : seat !== "owner" ? (
            <p className="empty rail-empty">No open decision in this room yet.</p>
          ) : null}

          {openPacket?.status === "open" && !stickyDecide ? (
            <div className="decide-zone">
              <DecideBar
                roomId={roomId}
                seat={seat}
                nonce={nonce}
                persist={persist}
                packet={openPacket}
                onDecided={handleDecided}
              />
            </div>
          ) : null}
        </aside>
      </main>

      {stickyDecide && openPacket ? (
        <DecideBar
          variant="sticky"
          roomId={roomId}
          seat={seat}
          nonce={nonce}
          persist={persist}
          packet={openPacket}
          onDecided={handleDecided}
        />
      ) : null}
      </div>

      <ShareModal
        open={shareOpen}
        roomId={roomId}
        onClose={() => setShareOpen(false)}
        returnFocusRef={shareBtnRef}
      />

      <AboutModal
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        returnFocusRef={aboutBtnRef}
      />
    </div>
  );
}
