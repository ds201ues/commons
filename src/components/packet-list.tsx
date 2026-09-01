import type { Packet } from "@/lib/types";
import "./packets.css";

type Props = {
  packets: Packet[]
};

export function PacketList({ packets }: Props) {
  const open = packets.filter((p) => p.status === "open");

  return (
    <nav className="packet-list" aria-label="Open decisions">
      <h2>Open decisions</h2>
      {open.length === 0 ? (
        <p className="packet-list__empty">
          No open decisions — start one below.
        </p>
      ) : (
        <ul className="packet-list__items">
          {open.map((p) => (
            <li key={p.id} className="packet-list__item">
              <span className="packet-list__item-id">{p.id}</span>
              <span>{p.question}</span>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
