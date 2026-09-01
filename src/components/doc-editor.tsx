"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { htmlToMarkdown, markdownToHtml } from "@/lib/brief-markdown";
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

function saveErrorMessage(status: number, hint?: string): string {
  if (status === 404) {
    return "This room no longer exists. Return home and open a fresh link.";
  }
  if (hint) return hint;
  if (status >= 500) {
    return "The server couldn't save your changes. Wait a moment and keep typing.";
  }
  return `Save failed (${status}). Check your connection and keep typing.`;
}

/**
 * In-place rich brief: edit the rendered page (Notion-like).
 * Persists as markdown for agents / get_workspace.
 */
export function DocEditor({ roomId, seat, docMarkdown, onSaved }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [tone, setTone] = useState<SaveTone>("idle");
  const [isDirty, setIsDirty] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!(docMarkdown ?? "").trim());
  const dirtyRef = useRef(false);
  const draftRef = useRef(docMarkdown);
  const timerRef = useRef<number | null>(null);
  const savedTimerRef = useRef<number | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastSyncedRef = useRef(docMarkdown);

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
            as: seat,
            via: "human",
            op: "edit_doc",
            input: { markdown },
          }),
        });
        const json = (await res.json()) as { ok: boolean; room?: Room; hint?: string };
        if (!json.ok || !json.room) {
          setError(saveErrorMessage(res.status, json.hint));
          setTone("error");
          return;
        }
        if (draftRef.current === markdown) {
          dirtyRef.current = false;
          setIsDirty(false);
        }
        lastSyncedRef.current = json.room.docMarkdown;
        onSaved(json.room);
        flashSaved();
      } catch (err) {
        const message =
          err instanceof Error && err.message
            ? `Couldn't reach the server (${err.message}). Check your connection.`
            : "Couldn't reach the server. Check your connection.";
        setError(message);
        setTone("error");
      }
    },
    [flashSaved, onSaved, roomId, seat],
  );

  const scheduleSave = useCallback(
    (markdown: string) => {
      setTone("pending");
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        void persist(markdown);
      }, DEBOUNCE_MS);
    },
    [persist],
  );

  function syncFromMarkdown(markdown: string) {
    const el = editorRef.current;
    if (!el) return;
    const html = markdownToHtml(markdown);
    el.innerHTML = html || "";
    lastSyncedRef.current = markdown;
    draftRef.current = markdown;
  }

  // Initial paint + remote updates while not editing dirty.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (dirtyRef.current) return;
    if (document.activeElement === el) return;
    if (docMarkdown === lastSyncedRef.current && el.innerHTML) return;
    syncFromMarkdown(docMarkdown);
    setIsEmpty(!(docMarkdown ?? "").trim());
    setIsDirty(false);
  }, [docMarkdown]);

  useEffect(() => {
    syncFromMarkdown(docMarkdown);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (savedTimerRef.current !== null) window.clearTimeout(savedTimerRef.current);
    };
    // mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function readMarkdownFromEditor(): string {
    const el = editorRef.current;
    if (!el) return draftRef.current;
    return htmlToMarkdown(el);
  }

  function onEditorInput() {
    dirtyRef.current = true;
    setIsDirty(true);
    setError(null);
    const markdown = readMarkdownFromEditor();
    draftRef.current = markdown;
    setIsEmpty(!markdown.trim());
    scheduleSave(markdown);
  }

  function onEditorKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const mod = event.metaKey || event.ctrlKey;
    if (mod && event.key.toLowerCase() === "b") {
      event.preventDefault();
      document.execCommand("bold");
      onEditorInput();
      return;
    }
    if (mod && event.key.toLowerCase() === "i") {
      event.preventDefault();
      document.execCommand("italic");
      onEditorInput();
    }
  }

  function statusLabel(): string | null {
    switch (tone) {
      case "pending":
        return "Unsaved…";
      case "saving":
        return "Saving…";
      case "saved":
        return "Saved";
      case "error":
        return "Save failed";
      default:
        return isDirty ? "Unsaved…" : null;
    }
  }

  const label = statusLabel();

  return (
    <section className={`doc-editor doc-editor--${seat}`} aria-label="Document">
      <header className="doc-editor-header">
        <h2>Brief</h2>
        <p
          className="doc-editor-status"
          data-tone={label ? tone : "idle"}
          data-visible={label ? "true" : "false"}
          aria-live="polite"
          aria-hidden={label ? undefined : true}
        >
          {label ?? ""}
        </p>
      </header>

      <div
        ref={editorRef}
        className="doc-surface doc-markdown doc-surface--rich"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Room brief"
        data-empty={isEmpty ? "true" : "false"}
        data-placeholder="Click here and write the shared brief…"
        spellCheck
        onInput={onEditorInput}
        onKeyDown={onEditorKeyDown}
        onBlur={() => {
          if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
          }
          if (dirtyRef.current) {
            void persist(readMarkdownFromEditor());
          }
        }}
      />

      {error ? (
        <p className="doc-editor-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
