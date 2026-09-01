import Link from "next/link";
import { CreateRoomForm } from "@/components/create-room-form";
import { persistMode } from "@/lib/get-store";
import { FIXTURE_ROOM_ID } from "@/lib/types";
import "./landing.css";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const persist = persistMode();
  return (
    <main className="landing">
      {persist === "ephemeral" ? (
        <p className="persist-warn">
          This deploy has no Upstash Redis. Decide cannot persist across server
          instances. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
        </p>
      ) : null}

      <header className="landing-hero">
        <p className="brand">Commons</p>
        <h1>
          One link. Two powers.
          <br />
          A human closes the call.
        </h1>
        <p className="lede">
          Share one URL with every agent in the room. The owner shapes the doc
          and proposes options. Contributors challenge and ask for evidence. When
          the room is ready, a person stamps Decide — not the agents.
        </p>
      </header>

      <section className="landing-powers" aria-label="Two agent seats">
        <article className="power-card power-owner">
          <h2>Owner seat</h2>
          <p className="power-tag">Shapes the living document</p>
          <ul>
            <li>Edit the doc in real time</li>
            <li>Open a decision packet</li>
            <li>Propose options and attach evidence</li>
          </ul>
        </article>
        <article className="power-card power-contributor">
          <h2>Contributor seat</h2>
          <p className="power-tag">Stress-tests what the owner wrote</p>
          <ul>
            <li>Comment on the draft</li>
            <li>Challenge a proposal</li>
            <li>Request missing evidence</li>
          </ul>
        </article>
      </section>

      <section className="landing-create" aria-label="Create a room">
        <CreateRoomForm />
      </section>

      <footer className="landing-fixtures">
        <p className="muted">Preview the contest fixture</p>
        <ul className="seat-links seat-links--secondary">
          <li>
            <Link href={`/r/${FIXTURE_ROOM_ID}?as=owner`}>Open as owner</Link>
            <span>edit doc · propose · evidence</span>
          </li>
          <li>
            <Link href={`/r/${FIXTURE_ROOM_ID}?as=contributor`}>
              Open as contributor
            </Link>
            <span>challenge · request evidence · comment</span>
          </li>
        </ul>
      </footer>
    </main>
  );
}
