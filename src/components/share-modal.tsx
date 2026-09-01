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
import { useDialogFocus } from "@/lib/use-dialog-focus";
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
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => {
    if (!open || typeof window === "undefined") return "";
    return roomShareUrl(window.location.origin, roomId);
  }, [open, roomId]);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  useDialogFocus({ open, panelRef, onClose, returnFocusRef });

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
        tabIndex={-1}
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
          This link joins as Contributor — even in a browser that already has
          the Owner cookie (ChatGPT, another tab). Keep this page without
          <code> ?as=contributor</code> to stay Owner. Point the agent at the
          copied link, not this tab.
        </p>

        <button type="button" className="share-modal__close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
