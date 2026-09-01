import type { Packet } from "@/lib/types";
import "./packets.css";

type Props = {
  packets: Packet[]
};

export function PacketList({ packets }: Props) {
  const open = packets.filter((p) => p.status === "open");

  if (open.length <= 1) return null;

  return (
    <nav className="packet-list" aria-label="Open decisions">
      <h2>Open decisions</h2>
      <ul className="packet-list__items">
        {open.map((p, index) => (
          <li key={p.id} className="packet-list__item">
            <span className="packet-list__item-id">{index + 1}</span>
            <span>{p.question}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
