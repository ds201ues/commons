"use client";

import { useCallback, useEffect, useState } from "react";
import { DecideBar } from "@/components/decide-bar";
import { DecisionsWall } from "@/components/decisions-wall";
import { DocEditor } from "@/components/doc-editor";
import { PacketActions } from "@/components/packet-actions";
import { PacketList } from "@/components/packet-list";
import { PacketPanel } from "@/components/packet-panel";
import { PatchLog } from "@/components/patch-log";
import { WebmcpRegistrar } from "@/components/webmcp-registrar";
import type { PersistMode, Room, Seat } from "@/lib/types";
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
  { label: "Open packets", tool: "open_packet" },
  { label: "Propose options", tool: "propose_option" },
  { label: "Attach evidence", tool: "attach_evidence" },
];

const CONTRIBUTOR_CAPABILITIES: Capability[] = [
  { label: "Read workspace", tool: "get_workspace" },
  { label: "Comment", tool: "comment" },
  { label: "Challenge", tool: "challenge" },
  { label: "Request evidence", tool: "request_evidence" },
];

function roleLabel(seat: Seat): string {
  return seat === "owner" ? "Owner" : "Contributor";
}

export function RoomView({ roomId, seat, nonce, persist, initialRoom }: Props) {
  const [room, setRoom] = useState(initialRoom);
  const [linkCopied, setLinkCopied] = useState(false);

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

  const openPacket = room.packets.find((p) => p.status === "open") ?? room.packets[0];
  const capabilities = seat === "owner" ? OWNER_CAPABILITIES : CONTRIBUTOR_CAPABILITIES;

  async function copyLink() {
    const url = `${window.location.origin}/r/${roomId}`;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 2000);
  }

  return (
    <div className={`room shell seat-${seat}`}>
      <WebmcpRegistrar roomId={roomId} seat={seat} />

      <header className="room-header">
        <div className="room-header-top">
          <p className="brand">Commons</p>
          <span className="role-badge">{roleLabel(seat)}</span>
        </div>

        <div className="room-header-main">
          <h1 className="room-title">{room.title}</h1>
          <button
            type="button"
            className={`share-btn${linkCopied ? " share-btn--copied" : ""}`}
            onClick={() => void copyLink()}
          >
            {linkCopied ? "Link copied" : "Copy share link"}
          </button>
        </div>

        <details className="demo-hint">
          <summary>Demo seat override</summary>
          <p className="demo-hint-body muted">
            Append <code>?as=owner</code> or <code>?as=contributor</code> to preview
            another seat.
          </p>
        </details>

        <div className="capabilities">
          <p className="capabilities-label">Your agent can</p>
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
        </div>
      </header>

      <div className="room-body">
        <section className="room-section room-section--doc" aria-label="Document">
          <DocEditor
            roomId={roomId}
            seat={seat}
            docMarkdown={room.docMarkdown}
            onSaved={setRoom}
          />
        </section>

        <section className="room-section room-section--work" aria-label="Open work">
          <p className="room-eyebrow">Open work</p>
          <PacketList packets={room.packets} />

          <div className="room-grid">
            <div className="work-column">
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

              {openPacket?.status === "open" ? (
                <div className="decide-zone">
                  <DecideBar
                    roomId={roomId}
                    seat={seat}
                    nonce={nonce}
                    persist={persist}
                    packet={openPacket}
                    onDecided={() => void refresh()}
                  />
                </div>
              ) : null}
            </div>

            <aside className="side-stack" aria-label="Activity">
              <DecisionsWall packets={room.packets} />
              <PatchLog log={room.log} />
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
