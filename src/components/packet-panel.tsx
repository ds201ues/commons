import type { Packet } from "@/lib/types";
import "./packets.css";

type Props = {
  packet: Packet
};

function formatSeat(seat: string) {
  return seat === "owner" ? "Owner" : "Contributor";
}

export function PacketPanel({ packet }: Props) {
  const isOpen = packet.status === "open";

  return (
    <article className="packet">
      <header className="packet__header">
        <p className="eyebrow">Decision packet · {packet.id}</p>
        <h1>{packet.question}</h1>
        <p
          className={`packet__status packet__status--${packet.status}`}
          aria-label={`Packet status: ${packet.status}`}
        >
          {isOpen ? "Open" : packet.status === "decided" ? "Closed" : packet.status}
        </p>
      </header>

      <div className="packet__body">
        <section className="packet__section" aria-labelledby="options-heading">
          <div className="packet__section-head">
            <h2 id="options-heading">Options</h2>
            <span className="packet__count">{packet.options.length}</span>
          </div>
          {packet.options.length === 0 ? (
            <p className="packet__empty">
              <strong>No options yet</strong>
              Propose at least one path forward before this packet can be decided.
            </p>
          ) : (
            <ol className="packet__options">
              {packet.options.map((opt) => (
                <li
                  key={opt.id}
                  className={
                    packet.decision?.optionId === opt.id
                      ? "packet__option packet__option--picked"
                      : "packet__option"
                  }
                >
                  <span className="packet__option-id">{opt.id}</span>
                  <strong className="packet__option-label">{opt.label}</strong>
                  {opt.body ? <p className="packet__option-body">{opt.body}</p> : null}
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="packet__section" aria-labelledby="evidence-heading">
          <div className="packet__section-head">
            <h2 id="evidence-heading">Evidence</h2>
            <span className="packet__count">{packet.evidence.length}</span>
          </div>
          {packet.evidence.length === 0 ? (
            <p className="packet__empty">
              <strong>Nothing attached</strong>
              Facts and citations land here — attach evidence to strengthen the record.
            </p>
          ) : (
            <ul className="packet__feed">
              {packet.evidence.map((ev) => (
                <li key={ev.id} className="packet__feed-item packet__feed-item--evidence">
                  <span className="packet__feed-meta">{formatSeat(ev.authorSeat)}</span>
                  {ev.text}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="packet__section" aria-labelledby="challenges-heading">
          <div className="packet__section-head">
            <h2 id="challenges-heading">Challenges</h2>
            <span className="packet__count">{packet.challenges.length}</span>
          </div>
          {packet.challenges.length === 0 ? (
            <p className="packet__empty">
              <strong>No challenges</strong>
              Contributors can contest assumptions before a decision is stamped.
            </p>
          ) : (
            <ul className="packet__feed">
              {packet.challenges.map((ch) => (
                <li key={ch.id} className="packet__feed-item packet__feed-item--challenge">
                  <span className="packet__feed-meta">{formatSeat(ch.authorSeat)}</span>
                  {ch.text}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="packet__section" aria-labelledby="requests-heading">
          <div className="packet__section-head">
            <h2 id="requests-heading">Evidence requested</h2>
            <span className="packet__count">{packet.requests.length}</span>
          </div>
          {packet.requests.length === 0 ? (
            <p className="packet__empty">
              <strong>No open requests</strong>
              Ask for missing facts before closing — requests show up here.
            </p>
          ) : (
            <ul className="packet__feed">
              {packet.requests.map((rq) => (
                <li key={rq.id} className="packet__feed-item packet__feed-item--request">
                  <span className="packet__feed-meta">{formatSeat(rq.authorSeat)}</span>
                  {rq.what}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="packet__section" aria-labelledby="comments-heading">
          <div className="packet__section-head">
            <h2 id="comments-heading">Comments</h2>
            <span className="packet__count">{packet.comments.length}</span>
          </div>
          {packet.comments.length === 0 ? (
            <p className="packet__empty">
              <strong>No comments</strong>
              Contributors can leave notes on this packet without changing the options.
            </p>
          ) : (
            <ul className="packet__feed">
              {packet.comments.map((cm) => (
                <li key={cm.id} className="packet__feed-item packet__feed-item--comment">
                  <span className="packet__feed-meta">{formatSeat(cm.authorSeat)}</span>
                  {cm.text}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {packet.decision ? (
        <p className="packet__stamp" aria-label="Decision stamp">
          Closed · {packet.options.find((o) => o.id === packet.decision?.optionId)?.label} ·{" "}
          {new Date(packet.decision.at).toUTCString()}
        </p>
      ) : null}
    </article>
  );
}
