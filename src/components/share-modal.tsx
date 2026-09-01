"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { roomShareUrl } from "@/lib/share-url";
import "./share-modal.css";

type Props = {
  open: boolean
  roomId: string
  onClose: () => void
  returnFocusRef?: RefObject<HTMLElement | null>
};

export function ShareModal({ open, roomId, onClose, returnFocusRef }: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => {
    if (!open || typeof window === "undefined") return "";
    return roomShareUrl(window.location.origin, roomId);
  }, [open, roomId]);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = panel.querySelector<HTMLElement>(
      "button, input, [tabindex]:not([tabindex=\"-1\"])",
    );
    focusable?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (wasOpenRef.current && !open) {
      returnFocusRef?.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open, returnFocusRef]);

  const copy = useCallback(async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [url]);

  if (!open) return null;

  return (
    <div className="share-modal" onClick={onClose}>
      <div
        ref={panelRef}
        className="share-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="share-modal__title">
          Share this room
        </h2>

        <div className="share-modal__url-row">
          <input
            className="share-modal__input"
            type="text"
            readOnly
            value={url}
            onFocus={(event) => event.target.select()}
            aria-label="Room share link"
          />
          <button
            type="button"
            className="share-modal__copy btn btn-primary"
            onClick={() => void copy()}
          >
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>

        <p className="share-modal__explainer">
          One link for everyone. Anyone who opens it joins as Contributor. Your
          browser keeps the Owner cookie — there is no separate owner URL.
        </p>

        <button type="button" className="share-modal__close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
