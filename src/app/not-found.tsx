import Link from "next/link";
import "@/components/doc-editor.css";
import "@/components/room-shell.css";

export default function NotFound() {
  return (
    <main className="landing">
      <p className="brand">Commons</p>
      <p className="not-found-code" aria-hidden>
        404
      </p>
      <h1>This link doesn&apos;t resolve</h1>
      <p className="lede">
        The room may have expired, or the URL is incomplete. Commons rooms use one
        share link — the browser that created the room is Owner; everyone else who
        opens that link joins as Contributor.
      </p>
      <div className="not-found-actions">
        <Link href="/" className="bar-btn">
          Back to Commons
        </Link>
      </div>
    </main>
  );
}
