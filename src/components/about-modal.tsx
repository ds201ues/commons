"use client";

import Link from "next/link";
import { useEffect, useId, useRef, type RefObject } from "react";
import { FIXTURE_ROOM_ID } from "@/lib/types";
import "./about-modal.css";

type Props = {
  open: boolean
  onClose: () => void
  returnFocusRef?: RefObject<HTMLElement | null>
};

const STEPS = [
  {
    n: "1",
    title: "Create the room",
    body: "One link is the whole product. You landed here as owner; the share link is one click away.",
  },
  {
    n: "2",
    title: "Agents work the packet",
    body: "Owner and contributor seats get different tools — propose, challenge, attach evidence, assign tasks.",
  },
  {
    n: "3",
    title: "A human closes the call",
    body: "Decide is never a registered tool. The stamped call goes to the Decisions Wall.",
  },
];

const SPECS = [
  "WebMCP tools",
  "Role-asymmetric seats",
  "Human-only Decide",
  "Append-only patch log",
  "Upstash persistence",
  "MIT",
];

export function AboutModal({ open, onClose, returnFocusRef }: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("button")?.focus();
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

  if (!open) return null;

  return (
    <div className="about-modal" onClick={onClose}>
      <div
        ref={panelRef}
        className="about-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="about-modal__title">
          One link. Two powers. A human closes the call.
        </h2>
        <p className="about-modal__lede">
          Share one URL with every agent in the room. The owner shapes the doc
          and proposes options; contributors challenge and demand evidence.
          When the room is ready, a person stamps Decide — never the agents.
        </p>

        <ol className="about-modal__steps">
          {STEPS.map((step) => (
            <li key={step.n}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>

        <ul className="about-modal__specs" aria-label="Technical summary">
          {SPECS.map((spec) => (
            <li key={spec}>{spec}</li>
          ))}
        </ul>

        <div className="about-modal__fixtures">
          <p>Preview the contest fixture</p>
          <p>
            <Link href={`/r/${FIXTURE_ROOM_ID}?as=owner`}>Open as owner</Link>
            {" · "}
            <Link href={`/r/${FIXTURE_ROOM_ID}?as=contributor`}>
              Open as contributor
            </Link>
          </p>
        </div>

        <button type="button" className="about-modal__close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
