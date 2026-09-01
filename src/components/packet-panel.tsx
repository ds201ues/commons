import type { Packet } from "@/lib/types";
import { normalizeSeat } from "@/lib/types";
import "./packets.css";

type Props = {
  packet: Packet
};

function formatSeat(seat: string) {
  const normalized = normalizeSeat(seat);
  return normalized === "owner" ? "Owner" : "Contributor";
}

export function PacketPanel({ packet }: Props) {
  const isOpen = packet.status === "open";
  const options = packet.options ?? [];
  const evidence = packet.evidence ?? [];
  const challenges = packet.challenges ?? [];
  const requests = packet.requests ?? [];
  const comments = packet.comments ?? [];

  return (
    <article className="packet">
      <header className="packet__header">
        <p
          className={`packet__status packet__status--${packet.status}`}
          aria-label={`Decision status: ${packet.status}`}
        >
          {isOpen ? "Open" : packet.status === "decided" ? "Closed" : packet.status}
        </p>
        <h1>{packet.question}</h1>
      </header>

      <div className="packet__body">
        <section className="packet__section" aria-labelledby="options-heading">
          <div className="packet__section-head">
            <h2 id="options-heading">Options</h2>
            <span className="packet__count">{options.length}</span>
          </div>
          {options.length === 0 ? (
            <p className="packet__empty-inline">
              No options yet — propose a path forward below.
            </p>
          ) : (
            <ol className="packet__options">
              {options.map((opt) => (
                <li
                  key={opt.id}
                  className={
                    packet.decision?.optionId === opt.id
                      ? "packet__option packet__option--picked"
                      : "packet__option"
                  }
                >
                  <strong className="packet__option-label">{opt.label}</strong>
                  {opt.body ? <p className="packet__option-body">{opt.body}</p> : null}
                </li>
              ))}
            </ol>
          )}
        </section>

        {evidence.length > 0 ? (
          <section className="packet__section" aria-labelledby="evidence-heading">
            <div className="packet__section-head">
              <h2 id="evidence-heading">Evidence</h2>
              <span className="packet__count">{evidence.length}</span>
            </div>
            <ul className="packet__feed">
              {evidence.map((ev) => (
                <li key={ev.id} className="packet__feed-item packet__feed-item--evidence">
                  <span className="packet__feed-meta">{formatSeat(ev.authorSeat)}</span>
                  {ev.text}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {challenges.length > 0 ? (
          <section className="packet__section" aria-labelledby="challenges-heading">
            <div className="packet__section-head">
              <h2 id="challenges-heading">Challenges</h2>
              <span className="packet__count">{challenges.length}</span>
            </div>
            <ul className="packet__feed">
              {challenges.map((ch) => (
                <li key={ch.id} className="packet__feed-item packet__feed-item--challenge">
                  <span className="packet__feed-meta">{formatSeat(ch.authorSeat)}</span>
                  {ch.text}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {requests.length > 0 ? (
          <section className="packet__section" aria-labelledby="requests-heading">
            <div className="packet__section-head">
              <h2 id="requests-heading">Evidence requested</h2>
              <span className="packet__count">{requests.length}</span>
            </div>
            <ul className="packet__feed">
              {requests.map((rq) => (
                <li key={rq.id} className="packet__feed-item packet__feed-item--request">
                  <span className="packet__feed-meta">{formatSeat(rq.authorSeat)}</span>
                  {rq.what}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {comments.length > 0 ? (
          <section className="packet__section" aria-labelledby="comments-heading">
            <div className="packet__section-head">
              <h2 id="comments-heading">Comments</h2>
              <span className="packet__count">{comments.length}</span>
            </div>
            <ul className="packet__feed">
              {comments.map((cm) => (
                <li key={cm.id} className="packet__feed-item packet__feed-item--comment">
                  <span className="packet__feed-meta">{formatSeat(cm.authorSeat)}</span>
                  {cm.text}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {packet.decision ? (
        <p className="packet__stamp" aria-label="Decision stamp">
          Closed · {options.find((o) => o.id === packet.decision?.optionId)?.label} ·{" "}
          {new Date(packet.decision.at).toUTCString()}
        </p>
      ) : null}
    </article>
  );
}
