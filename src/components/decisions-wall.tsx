import type { Packet } from "@/lib/types";
import "./packets.css";

type Props = {
  packets: Packet[]
  highlightPacketId?: string | null
};

export function DecisionsWall({ packets, highlightPacketId }: Props) {
  const decided = packets
    .filter((p) => p.status === "decided")
    .slice()
    .sort((a, b) => (a.decision?.at ?? "").localeCompare(b.decision?.at ?? ""));

  if (decided.length === 0) return null;

  return (
    <section className="decisions-wall" aria-label="Closed decisions">
      <div className="decisions-wall__header">
        <div>
          <h2>Closed</h2>
          <p className="decisions-wall__sub">Stamped calls</p>
        </div>
        <span className="decisions-wall__tally">{decided.length}</span>
      </div>
      <ol className="decisions-wall__ledger">
        {decided.map((packet) => {
          const chosen =
            packet.options.find((opt) => opt.id === packet.decision?.optionId)?.label ??
            packet.decision?.optionId ??
            "—";
          const when = packet.decision?.at
            ? new Date(packet.decision.at).toUTCString()
            : "—";
          return (
            <li
              key={packet.id}
              className={
                highlightPacketId === packet.id
                  ? "decisions-wall__entry decisions-wall__entry--flash"
                  : "decisions-wall__entry"
              }
            >
              <p className="wall-question">{packet.question}</p>
              <p className="decisions-wall__stamp stamp-mark">
                {chosen} · {packet.decision?.decidedBySeat ?? "—"} · {when}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
