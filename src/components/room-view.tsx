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
import { canStickyDecide } from "@/lib/decide-sticky";
import { liveParties, shortPartyLabel } from "@/lib/presence";
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

function roleLabel(seat: Seat): string {
  return seat === "owner" ? "Owner" : "Contributor";
}

export function RoomView({ roomId, seat, nonce, persist, initialRoom }: Props) {
  const [room, setRoom] = useState(initialRoom);
  const [shareOpen, setShareOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [highlightPacketId, setHighlightPacketId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [selfPartyId, setSelfPartyId] = useState<string | null>(null);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const shareBtnRef = useRef<HTMLButtonElement>(null);
  const aboutBtnRef = useRef<HTMLButtonElement>(null);
  const highlightTimerRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/rooms/${roomId}`, { cache: "no-store" });
    const json = (await res.json()) as { ok: boolean; room?: Room };
    if (json.ok && json.room) setRoom(json.room);
  }, [roomId]);

  const heartbeat = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/presence`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        // Fixture rooms without ownerTokenHash still honor as= for contest demos.
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
        setRoom((prev) => ({ ...prev, parties: json.parties ?? [] }));
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
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = (await res.json()) as { ok: boolean; url?: string; roomId?: string };
      if (!json.ok || !json.url) return;
      const nextId = json.roomId ?? json.url.split("/").pop() ?? "";
      if (nextId) {
        try {
          window.localStorage.setItem("commons_room", nextId);
        } catch {
          // private mode
        }
      }
      // Full navigation so the new owner cookie from Set-Cookie is applied.
      window.location.assign(json.url);
    } catch {
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
        body: JSON.stringify({ as: seat, op: "rename_room", input: { title } }),
      });
      const json = (await res.json()) as { ok: boolean; room?: Room };
      if (json.ok && json.room) setRoom(json.room);
      else void refresh();
    } catch {
      void refresh();
    }
  }

  const present = useMemo(() => liveParties(room.parties), [room.parties]);
  const openPacket = room.packets.find((p) => p.status === "open") ?? room.packets[0];
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
  return (
    <div className={`room shell seat-${seat}`}>
      <WebmcpRegistrar roomId={roomId} seat={seat} />

      <header className="room-header">
        <div className="room-header-top">
          <p className="brand">Commons</p>
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
          <span className="role-badge">{roleLabel(seat)}</span>
          <ul className="presence" aria-label="People in this room">
            {present.length === 0 ? (
              <li className="presence__chip presence__chip--empty">Just you</li>
            ) : (
              present.map((party) => {
                const mine = selfPartyId === party.id;
                const label =
                  party.seat === "owner"
                    ? mine
                      ? "You · Owner"
                      : "Owner"
                    : mine
                      ? `You · ${shortPartyLabel(party.id)}`
                      : `C · ${shortPartyLabel(party.id)}`;
                return (
                  <li
                    key={party.id}
                    className={`presence__chip presence__chip--${party.seat}${mine ? " presence__chip--self" : ""}`}
                    title={`${party.seat} · ${party.id}`}
                  >
                    {label}
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
            Decide is a human action on this page — not a registered tool. One share
            link for everyone; your browser cookie decides Owner vs Contributor.
          </p>
        </details>
      </header>

      <div className="room-desk">
        <div className="room-desk__main">
          <section className="room-section room-section--doc" aria-label="Document">
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
          <PacketList packets={room.packets} />

          {openPacket ? (
            <PacketPanel packet={openPacket} />
          ) : seat !== "owner" ? (
            <p className="empty rail-empty">No open decision in this room yet.</p>
          ) : null}

          {/* Tabs: Options | Evidence | Tasks | Decisions → Decide → Tasks list */}
          <ContributeRail
            roomId={roomId}
            seat={seat}
            packet={openPacket?.status === "open" ? openPacket : null}
            packets={room.packets}
            tasks={room.tasks ?? []}
            highlightPacketId={highlightPacketId}
            onUpdated={setRoom}
          />

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

          <TasksPanel
            roomId={roomId}
            seat={seat}
            tasks={room.tasks ?? []}
            onUpdated={setRoom}
          />
        </aside>
      </div>

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
