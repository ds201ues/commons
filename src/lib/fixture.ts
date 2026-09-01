import {
  FIXTURE_OPT_SHIP,
  FIXTURE_OPT_SLIP,
  FIXTURE_PACKET_ID,
  FIXTURE_ROOM_ID,
  type Room,
} from "./types";

export function fixtureRoom(): Room {
  return {
    id: FIXTURE_ROOM_ID,
    title: "Checkout rewrite",
    docMarkdown:
      "## Checkout rewrite\n\nDiscuss whether to ship the payment-form rewrite this Friday.",
    nextSeq: 1,
    log: [],
    parties: [],
    tasks: [
      {
        id: "task-evidence",
        text: "Pull the load-test numbers for the new payment form",
        assignee: "owner",
        done: false,
        at: "2026-09-01T09:00:00.000Z",
      },
      {
        id: "task-review",
        text: "Review the rollout plan and challenge weak assumptions",
        assignee: "contributor",
        done: false,
        at: "2026-09-01T09:05:00.000Z",
      },
    ],
    packets: [
      {
        id: FIXTURE_PACKET_ID,
        question: "Ship the checkout rewrite this Friday?",
        status: "open",
        options: [
          {
            id: FIXTURE_OPT_SHIP,
            label: "Ship Friday",
            body: "Cut the rewrite this Friday. Accept residual risk on the new payment form.",
            authorSeat: "owner",
          },
          {
            id: FIXTURE_OPT_SLIP,
            label: "Slip one week",
            body: "Keep current checkout live. Ship the rewrite the following Friday.",
            authorSeat: "owner",
          },
        ],
        evidence: [
          {
            id: "ev-qa",
            text: "QA: 12 of 14 payment cases pass on the rewrite branch (synthetic).",
            authorSeat: "owner",
          },
        ],
        challenges: [],
        requests: [],
        comments: [],
      },
    ],
  };
}

export function isFixtureRoomId(id: string): boolean {
  return id === FIXTURE_ROOM_ID;
}
