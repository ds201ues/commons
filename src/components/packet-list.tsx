import type { Packet } from "@/lib/types";
import "./packets.css";

type Props = {
  packets: Packet[]
  activePacketId?: string | null
  onSelect?: (packetId: string) => void
};

export function PacketList({ packets, activePacketId, onSelect }: Props) {
  const open = packets.filter((p) => p.status === "open");

  if (open.length <= 1) return null;

  return (
    <nav className="packet-list" aria-label="Open decisions">
      <h2>Open decisions</h2>
      <ul className="packet-list__items">
        {open.map((p, index) => {
          const selected = p.id === activePacketId;
          return (
            <li key={p.id}>
              <button
                type="button"
                className={
                  selected
                    ? "packet-list__item packet-list__item--active"
                    : "packet-list__item"
                }
                aria-current={selected ? "true" : undefined}
                onClick={() => onSelect?.(p.id)}
              >
                <span className="packet-list__item-id">{index + 1}</span>
                <span className="packet-list__item-q">{p.question}</span>
                <span className="packet-list__item-count">
                  {(p.options ?? []).length} opt
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
