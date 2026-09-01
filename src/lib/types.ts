export type Seat = "owner" | "contributor";

export type PacketStatus = "open" | "decided" | "withdrawn";

export type Op =
  | "propose_option"
  | "attach_evidence"
  | "challenge"
  | "request_evidence"
  | "decide"
  | "edit_doc"
  | "open_decision"
  | "rename_room"
  | "comment"
  | "add_task"
  | "complete_task";

export type Task = {
  id: string
  text: string
  assignee: Seat
  done: boolean
  at: string
};

export type Option = {
  id: string
  label: string
  body: string
  authorSeat: Seat
};

export type Evidence = {
  id: string
  text: string
  authorSeat: Seat
};

export type Challenge = {
  id: string
  text: string
  authorSeat: Seat
};

export type EvidenceRequest = {
  id: string
  what: string
  authorSeat: Seat
};

export type Comment = {
  id: string
  text: string
  authorSeat: Seat
};

export type Decision = {
  optionId: string
  decidedBySeat: Seat
  at: string
};

export type Packet = {
  id: string
  question: string
  status: PacketStatus
  options: Option[]
  evidence: Evidence[]
  challenges: Challenge[]
  requests: EvidenceRequest[]
  comments: Comment[]
  decision?: Decision
};

export type Patch = {
  seq: number
  at: string
  seat: Seat
  op: string
  summary: string
};

/** Per-browser visitor identity stored on the room (presence + audit). */
export type Party = {
  id: string
  seat: Seat
  lastSeenAt: string
};

export type Room = {
  id: string
  title: string
  docMarkdown: string
  /** SHA-256 hex of the owner cookie secret. Absent on legacy fixture rooms. */
  ownerTokenHash?: string
  createdAt?: string
  packets: Packet[]
  tasks: Task[]
  /** Visitors who have opened this room (cookie UUID → seat + lastSeen). */
  parties: Party[]
  log: Patch[]
  nextSeq: number
};

export type DecideTokenPayload = {
  roomId: string
  packetId: string
  optionId: string
};

export type ApplyOpRequest = {
  roomId: string
  seat: Seat
  op: Op
  input: Record<string, string>
  decideToken?: string
};

export type OpErrorCode =
  | "wrong_seat"
  | "needs_human_decide"
  | "packet_frozen"
  | "unknown_op"
  | "not_found"
  | "persist_unavailable";

export type PersistMode = "upstash" | "memory" | "ephemeral";

export type OpErrorBody = {
  ok: false
  code: OpErrorCode
  hint: string
};

export type ApplyOpSuccess = {
  ok: true
  room: Room
  result: Record<string, string>
};

export const FIXTURE_ROOM_ID = "checkout-friday";
export const FIXTURE_PACKET_ID = "pkt-checkout";
export const FIXTURE_OPT_SHIP = "opt-ship";
export const FIXTURE_OPT_SLIP = "opt-slip";

export const ALL_OPS: Op[] = [
  "propose_option",
  "attach_evidence",
  "challenge",
  "request_evidence",
  "decide",
  "edit_doc",
  "open_decision",
  "rename_room",
  "comment",
  "add_task",
  "complete_task",
];

/** Owner-only: room chrome and opening new decisions. */
export const OWNER_OPS: ReadonlySet<Op> = new Set([
  "open_decision",
  "rename_room",
]);

export const CONTRIBUTOR_OPS: ReadonlySet<Op> = new Set([
  "challenge",
  "request_evidence",
]);

/** Allowed for both seats (humans and agents on either link). */
export const SHARED_OPS: ReadonlySet<Op> = new Set([
  "edit_doc",
  "propose_option",
  "attach_evidence",
  "comment",
  "decide",
  "add_task",
  "complete_task",
]);

/** Map legacy seat path segments to owner/contributor. */
export function normalizeSeat(value: string): Seat | null {
  if (value === "owner" || value === "maker") return "owner";
  if (value === "contributor" || value === "decider") return "contributor";
  return null;
}
