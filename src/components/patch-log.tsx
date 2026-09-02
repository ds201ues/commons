import { normalizeSeat, type Patch } from "@/lib/types";
import "./packets.css";

type Props = {
  log: Patch[]
};

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "";
  }
}

function formatOp(op: string) {
  return op.replace(/_/g, " ");
}

function formatSeat(seat: string) {
  return normalizeSeat(seat) === "owner" ? "Owner" : "Contributor";
}

function formatVia(via: Patch["via"]) {
  return via === "agent" ? "Agent" : "Human";
}

export function PatchLog({ log }: Props) {
  const reversed = [...log].reverse();

  return (
    <aside className="log patch-log" aria-label="Patch log">
      <div className="log__header">
        <h2>Activity</h2>
      </div>
      {log.length === 0 ? (
        <p className="log__empty">
          No writes yet. Agent tools and human actions will appear here.
        </p>
      ) : (
        <ol className="log__feed">
          {reversed.map((row) => {
            const via = row.via === "agent" ? "agent" : "human";
            return (
              <li key={row.seq} className="log__entry">
                <span className="log__seq">{row.seq}</span>
                <div className="log__meta">
                  <span className={`log__seat log__seat--${row.seat}`}>
                    {formatSeat(row.seat)}
                  </span>
                  <span
                    className={
                      via === "agent"
                        ? "log__via log__via--agent"
                        : "log__via log__via--human"
                    }
                  >
                    {formatVia(via)}
                  </span>
                  <span className="log__op">{formatOp(row.op)}</span>
                  <time className="log__time" dateTime={row.at}>
                    {formatTime(row.at)}
                  </time>
                </div>
                <p className="log__summary">{row.summary}</p>
              </li>
            );
          })}
        </ol>
      )}
    </aside>
  );
}
