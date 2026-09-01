import type { Packet } from "@/lib/types";
import "./packets.css";

type Props = {
  packet: Packet
};

/** Active decision headline only — options/evidence live in ContributeRail tabs. */
export function PacketPanel({ packet }: Props) {
  const isOpen = packet.status === "open";

  return (
    <article className="packet packet--headline" aria-label={isOpen ? "Now deciding" : "Decision"}>
      <header className="packet__header">
        <p
          className={`packet__status packet__status--${packet.status}`}
          aria-label={`Decision status: ${packet.status}`}
        >
          {isOpen ? "Now deciding" : packet.status === "decided" ? "Closed" : packet.status}
        </p>
        <h1>{packet.question}</h1>
      </header>

      {packet.decision ? (
        <p className="packet__stamp" aria-label="Decision stamp">
          Closed · {packet.options.find((o) => o.id === packet.decision?.optionId)?.label} ·{" "}
          {new Date(packet.decision.at).toUTCString()}
        </p>
      ) : null}
    </article>
  );
}
