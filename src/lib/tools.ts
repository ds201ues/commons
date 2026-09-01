import type { Op, Seat } from "./types";

export type ToolDef = {
  name: string
  description: string
  readOnlyHint?: boolean
  untrustedContentHint?: boolean
  inputSchema: {
    type: "object"
    properties: Record<string, { type: string; description: string }>
    required: string[]
  }
};

const getWorkspace: ToolDef = {
  name: "get_workspace",
  description: "Read the room: doc, packets, options, evidence, challenges, log.",
  readOnlyHint: true,
  untrustedContentHint: true,
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};

const editDoc: ToolDef = {
  name: "edit_doc",
  description: "Update the room document markdown.",
  untrustedContentHint: true,
  inputSchema: {
    type: "object",
    properties: {
      markdown: { type: "string", description: "Full document markdown" },
    },
    required: ["markdown"],
  },
};

const openPacket: ToolDef = {
  name: "open_packet",
  description: "Open a new decision packet with a question.",
  untrustedContentHint: true,
  inputSchema: {
    type: "object",
    properties: {
      question: { type: "string", description: "The decision question" },
    },
    required: ["question"],
  },
};

const proposeOption: ToolDef = {
  name: "propose_option",
  description: "Add an option to an open packet.",
  untrustedContentHint: true,
  inputSchema: {
    type: "object",
    properties: {
      packetId: { type: "string", description: "Packet id" },
      label: { type: "string", description: "Short option name" },
      body: { type: "string", description: "Why this option" },
    },
    required: ["packetId", "label"],
  },
};

const attachEvidence: ToolDef = {
  name: "attach_evidence",
  description: "Attach a short evidence bullet to a packet.",
  untrustedContentHint: true,
  inputSchema: {
    type: "object",
    properties: {
      packetId: { type: "string", description: "Packet id" },
      text: { type: "string", description: "Evidence text" },
    },
    required: ["packetId", "text"],
  },
};

const comment: ToolDef = {
  name: "comment",
  description: "Add a comment on a packet.",
  untrustedContentHint: true,
  inputSchema: {
    type: "object",
    properties: {
      packetId: { type: "string", description: "Packet id" },
      text: { type: "string", description: "Comment text" },
    },
    required: ["packetId", "text"],
  },
};

const challenge: ToolDef = {
  name: "challenge",
  description: "Record a challenge against the packet.",
  untrustedContentHint: true,
  inputSchema: {
    type: "object",
    properties: {
      packetId: { type: "string", description: "Packet id" },
      text: { type: "string", description: "The challenge" },
    },
    required: ["packetId", "text"],
  },
};

const requestEvidence: ToolDef = {
  name: "request_evidence",
  description: "Ask the owner for a specific missing fact.",
  untrustedContentHint: true,
  inputSchema: {
    type: "object",
    properties: {
      packetId: { type: "string", description: "Packet id" },
      what: { type: "string", description: "What evidence you need" },
    },
    required: ["packetId", "what"],
  },
};

export function toolsForSeat(seat: Seat): ToolDef[] {
  if (seat === "owner") {
    return [getWorkspace, editDoc, openPacket, proposeOption, attachEvidence];
  }
  return [getWorkspace, comment, challenge, requestEvidence];
}

export function isAllowedOp(seat: Seat, op: string): op is Op {
  if (op === "get_workspace") return false;
  return toolsForSeat(seat).some((t) => t.name === op);
}

export const NEVER_REGISTER = ["decide", "choose", "close", "defer", "reopen"] as const;
