import type { Patch } from "@/lib/types";
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
          {reversed.map((row) => (
            <li key={row.seq} className="log__entry">
              <span className="log__seq">{row.seq}</span>
              <div className="log__meta">
                <span className={`log__seat log__seat--${row.seat}`}>{row.seat}</span>
                {row.via === "agent" ? (
                  <span className="log__via log__via--agent">agent</span>
                ) : null}
                <span className="log__op">{formatOp(row.op)}</span>
                <time className="log__time" dateTime={row.at}>
                  {formatTime(row.at)}
                </time>
              </div>
              <p className="log__summary">{row.summary}</p>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
