"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Room, Seat } from "@/lib/types";
import "./doc-editor.css";

type Props = {
  roomId: string
  seat: Seat
  docMarkdown: string
  onSaved: (room: Room) => void
};

type SaveTone = "idle" | "pending" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 800;
const SAVED_FLASH_MS = 2200;

const OWNER_PLACEHOLDER = `Context — why this room exists and what we're deciding.

Open questions
- What do we need to agree on?
- What would change our minds?

Notes
- Drop links, constraints, and background here.`;

function formatInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("_") && part.endsWith("_")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function MarkdownPreview({ markdown }: { markdown: string }) {
  const trimmed = (markdown ?? "").trim();
  if (!trimmed) {
    return (
      <p className="doc-empty">
        No brief on the table yet. The owner sets shared context here — check back once
        they&apos;ve written the opening notes.
      </p>
    );
  }

  const blocks = trimmed.split(/\n\n+/);
  return (
    <article className="doc-markdown" aria-label="Document preview">
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n");
        const first = lines[0] ?? "";

        if (first.startsWith("# ")) {
          return <h3 key={blockIndex}>{first.slice(2)}</h3>;
        }
        if (first.startsWith("## ")) {
          return <h4 key={blockIndex}>{first.slice(3)}</h4>;
        }
        if (first.startsWith("### ")) {
          return <h5 key={blockIndex}>{first.slice(4)}</h5>;
        }
        if (lines.every((line) => line.startsWith("- ") || line.startsWith("* "))) {
          return (
            <ul key={blockIndex}>
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{formatInline(line.slice(2))}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={blockIndex}>{formatInline(block.replace(/\n/g, " "))}</p>
        );
      })}
    </article>
  );
}

function saveErrorMessage(status: number, hint?: string): string {
  if (status === 404) {
    return "This room no longer exists. Return home and open a fresh link.";
  }
  if (status === 403 || status === 401) {
    return "Only the owner can edit the brief. Open the room with your owner link, then try Save again.";
  }
  if (hint) return hint;
  if (status >= 500) {
    return "The server couldn't save your changes. Wait a moment and press Save again.";
  }
  return `Save failed (${status}). Check your connection and try Save again.`;
}

export function DocEditor({ roomId, seat, docMarkdown, onSaved }: Props) {
  const [draft, setDraft] = useState(docMarkdown);
  const [error, setError] = useState<string | null>(null);
  const [tone, setTone] = useState<SaveTone>("idle");
  const [isDirty, setIsDirty] = useState(false);
  const dirtyRef = useRef(false);
  const draftRef = useRef(docMarkdown);
  const timerRef = useRef<number | null>(null);
  const savedTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!dirtyRef.current) {
      setDraft(docMarkdown);
      draftRef.current = docMarkdown;
      setIsDirty(false);
    }
  }, [docMarkdown]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (savedTimerRef.current !== null) window.clearTimeout(savedTimerRef.current);
    };
  }, []);

  const flashSaved = useCallback(() => {
    setTone("saved");
    if (savedTimerRef.current !== null) window.clearTimeout(savedTimerRef.current);
    savedTimerRef.current = window.setTimeout(() => {
      setTone((current) => (current === "saved" ? "idle" : current));
    }, SAVED_FLASH_MS);
  }, []);

  const persist = useCallback(
    async (markdown: string) => {
      setTone("saving");
      setError(null);
      try {
        const res = await fetch(`/api/rooms/${roomId}/ops`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            seat: "owner",
            as: "owner",
            op: "edit_doc",
            input: { markdown },
          }),
        });
        const json = (await res.json()) as { ok: boolean; room?: Room; hint?: string };
        if (!json.ok || !json.room) {
          const message = saveErrorMessage(res.status, json.hint);
          setError(message);
          setTone("error");
          return;
        }
        if (draftRef.current === markdown) {
          dirtyRef.current = false;
          setIsDirty(false);
        }
        onSaved(json.room);
        flashSaved();
      } catch (err) {
        const message =
          err instanceof Error && err.message
            ? `Couldn't reach the server (${err.message}). Check your connection and press Save.`
            : "Couldn't reach the server. Check your connection and press Save.";
        setError(message);
        setTone("error");
      }
    },
    [flashSaved, onSaved, roomId],
  );

  function scheduleSave(markdown: string) {
    setTone("pending");
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      void persist(markdown);
    }, DEBOUNCE_MS);
  }

  function saveNow() {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    void persist(draft);
  }

  function statusLabel(): string | null {
    switch (tone) {
      case "pending":
        return "Unsaved changes…";
      case "saving":
        return "Saving…";
      case "saved":
        return "Saved";
      case "error":
        return "Save failed";
      default:
        return isDirty ? "Unsaved changes" : null;
    }
  }

  if (seat !== "owner") {
    return (
      <section className="doc-editor doc-editor--contributor" aria-label="Document">
        <header className="doc-editor-header">
          <div>
            <h2>The brief</h2>
            <p className="doc-editor-sub">
              Shared context on the table. Contributors read; only the owner edits.
            </p>
          </div>
          <span className="doc-editor-badge">Read-only</span>
        </header>
        <div className="doc-paper">
          {seat === "contributor" ? (
            <p className="doc-ribbon" role="status">
              Contributor · view only
            </p>
          ) : null}
          <MarkdownPreview markdown={docMarkdown} />
        </div>
      </section>
    );
  }

  const label = statusLabel();

  return (
    <section className="doc-editor doc-editor--owner" aria-label="Document editor">
      <header className="doc-editor-header">
        <div>
          <h2>The brief</h2>
          <p className="doc-editor-sub">
            You&apos;re writing on the shared table. Everyone in the room sees this.
          </p>
        </div>
        {label ? (
          <p className="doc-editor-status" data-tone={tone} aria-live="polite">
            {label}
          </p>
        ) : null}
      </header>

      <textarea
        className="doc-editor-textarea"
        value={draft}
        rows={18}
        spellCheck
        data-dirty={isDirty ? "true" : "false"}
        placeholder={OWNER_PLACEHOLDER}
        aria-label="Edit the room brief"
        onChange={(event) => {
          dirtyRef.current = true;
          setIsDirty(true);
          const next = event.target.value;
          draftRef.current = next;
          setDraft(next);
          setError(null);
          scheduleSave(next);
        }}
      />

      <footer className="doc-editor-footer">
        <button
          type="button"
          className="doc-editor-save"
          disabled={tone === "saving"}
          onClick={saveNow}
        >
          {tone === "saving" ? "Saving…" : "Save"}
        </button>
        <span className="doc-editor-hint">Auto-saves shortly after you stop typing</span>
      </footer>

      {error ? (
        <p className="doc-editor-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
