"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.tabIndex >= 0,
  );
}

/** Trap Tab inside an open dialog, close on Escape, restore focus on close. */
export function useDialogFocus({
  open,
  panelRef,
  onClose,
  returnFocusRef,
}: {
  open: boolean
  panelRef: RefObject<HTMLElement | null>
  onClose: () => void
  returnFocusRef?: RefObject<HTMLElement | null>
}) {
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const first = getFocusable(panel)[0];
    (first ?? panel).focus();
  }, [open, panelRef]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = getFocusable(panel);
      if (items.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey) {
        if (active === first || active === panel || !panel.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !panel.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, panelRef]);

  useEffect(() => {
    if (wasOpenRef.current && !open) {
      returnFocusRef?.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open, returnFocusRef]);
}
