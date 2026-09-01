"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AboutModal } from "@/components/about-modal";
import { DecideBar } from "@/components/decide-bar";
import { DecisionsWall } from "@/components/decisions-wall";
import { DocEditor } from "@/components/doc-editor";
import { PacketActions } from "@/components/packet-actions";
import { PacketList } from "@/components/packet-list";
import { PacketPanel } from "@/components/packet-panel";
import { PatchLog } from "@/components/patch-log";
import { ShareModal } from "@/components/share-modal";
import { TasksPanel } from "@/components/tasks-panel";
import { WebmcpRegistrar } from "@/components/webmcp-registrar";
import { canStickyDecide } from "@/lib/decide-sticky";
import type { PersistMode, Room, Seat } from "@/lib/types";
import "./room-shell.css";

type Props = {
  roomId: string
  seat: Seat
  nonce?: string
  persist: PersistMode
  initialRoom: Room
  /** Freshly created room: open the share modal on arrival. */
  autoShare?: boolean
};

type Capability = {
  label: string
  tool: string
};

const OWNER_CAPABILITIES: Capability[] = [
  { label: "Read workspace", tool: "get_workspace" },
  { label: "Edit document", tool: "edit_doc" },
  { label: "Open packets", tool: "open_packet" },
  { label: "Propose options", tool: "propose_option" },
  { label: "Attach evidence", tool: "attach_evidence" },
  { label: "Assign tasks", tool: "add_task" },
  { label: "Complete tasks", tool: "complete_task" },
];

const CONTRIBUTOR_CAPABILITIES: Capability[] = [
  { label: "Read workspace", tool: "get_workspace" },
  { label: "Comment", tool: "comment" },
  { label: "Challenge", tool: "challenge" },
  { label: "Request evidence", tool: "request_evidence" },
  { label: "Assign tasks", tool: "add_task" },
  { label: "Complete tasks", tool: "complete_task" },
];

function roleLabel(seat: Seat): string {
  return seat === "owner" ? "Owner" : "Contributor";
}

export function RoomView({ roomId, seat, nonce, persist, initialRoom, autoShare }: Props) {
  const [room, setRoom] = useState(initialRoom);
  const [shareOpen, setShareOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [highlightPacketId, setHighlightPacketId] = useState<string | null>(null);
  const shareBtnRef = useRef<HTMLButtonElement>(null);
  const aboutBtnRef = useRef<HTMLButtonElement>(null);
  const highlightTimerRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/rooms/${roomId}`, { cache: "no-store" });
    const json = (await res.json()) as { ok: boolean; room?: Room };
    if (json.ok && json.room) setRoom(json.room);
  }, [roomId]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void refresh();
    }, 1200);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (!autoShare) return;
    setShareOpen(true);
    window.history.replaceState(null, "", window.location.pathname);
  }, [autoShare]);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

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

  function focusComposer(intent?: string) {
    if (intent) {
      window.dispatchEvent(new CustomEvent("commons:intent", { detail: intent }));
    }
    const el = document.getElementById("packet-composer-input");
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    el?.focus({ preventScroll: true });
  }

  const capabilities = seat === "owner" ? OWNER_CAPABILITIES : CONTRIBUTOR_CAPABILITIES;

  return (
    <div className={`room shell seat-${seat}`}>
      <WebmcpRegistrar roomId={roomId} seat={seat} />

      <header className="room-header">
        <div className="room-header-top">
          <p className="brand">Commons</p>
          <h1 className="room-title">{room.title}</h1>
          <span className="role-badge">{roleLabel(seat)}</span>
          <div className="room-actions">
            <button
              ref={shareBtnRef}
              type="button"
              className="share-btn"
              onClick={() => setShareOpen(true)}
            >
              Copy share link
            </button>
            {seat === "owner" ? (
              <button
                type="button"
                className="bar-btn"
                onClick={() => focusComposer("open_packet")}
              >
                New packet
              </button>
            ) : null}
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
            Decide is a human action on this page — not a registered tool.
          </p>
        </details>

        <details className="demo-hint">
          <summary>Demo seat override</summary>
          <p className="demo-hint-body muted">
            Append <code>?as=owner</code> or <code>?as=contributor</code> to preview
            another seat.
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
          ) : (
            <p className="empty">No packet in this room.</p>
          )}

          {openPacket?.status === "open" ? (
            <PacketActions
              roomId={roomId}
              seat={seat}
              packet={openPacket}
              onUpdated={setRoom}
            />
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

          <TasksPanel
            roomId={roomId}
            seat={seat}
            tasks={room.tasks ?? []}
            onUpdated={setRoom}
          />

          <DecisionsWall packets={room.packets} highlightPacketId={highlightPacketId} />
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
        autoCopy={autoShare}
      />

      <AboutModal
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        returnFocusRef={aboutBtnRef}
      />
    </div>
  );
}
