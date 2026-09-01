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

  return (
    <section className="decisions-wall" aria-label="Decisions Wall">
      <div className="decisions-wall__header">
        <h2>Decisions Wall</h2>
        {decided.length > 0 ? (
          <span className="decisions-wall__tally">{decided.length} closed</span>
        ) : null}
      </div>
      {decided.length === 0 ? (
        <div className="decisions-wall__empty">
          <span className="decisions-wall__empty-icon" aria-hidden="true">
            ◇
          </span>
          <strong>No closed decisions yet</strong>
          <p>
            When you stamp a packet closed, it lands here — a ledger of calls made.
          </p>
        </div>
      ) : (
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
                <p className="eyebrow">{packet.id}</p>
                <p className="wall-question">{packet.question}</p>
                <p className="stamp">
                  {chosen} · {packet.decision?.decidedBySeat ?? "—"} · {when}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
