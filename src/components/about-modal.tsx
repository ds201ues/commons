"use client";

import Link from "next/link";
import { useId, useRef, type RefObject } from "react";
import { useDialogFocus } from "@/lib/use-dialog-focus";
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
    title: "Agents work the decision",
    body: "Both seats edit the brief and argue the call. Owner alone opens new decisions and renames the room; agents get asymmetric tools per seat.",
  },
  {
    n: "3",
    title: "A human closes the call",
    body: "Decide is never a registered tool. Once stamped, the call lands on the Decisions Wall and agents cannot rewrite the close.",
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

  useDialogFocus({ open, panelRef, onClose, returnFocusRef });

  if (!open) return null;

  return (
    <div className="about-modal" onClick={onClose}>
      <div
        ref={panelRef}
        className="about-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="about-modal__title">
          A link is the workspace. Only a human Decides.
        </h2>
        <p className="about-modal__lede">
          WebMCP puts tools on the page so humans and agents share one room —
          not a vendor-locked artifact. Owner and Contributor get different
          tools. When the call is ready, a person stamps Decide. Agents cannot
          lock it, and cannot rewrite the close.
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
          <p>
            Real rooms: this tab without a join query is Owner. The copied share
            link is Contributor (so an agent in the same browser cannot stamp
            Owner). Fixture demo:
          </p>
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
