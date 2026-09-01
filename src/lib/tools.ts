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

const openDecision: ToolDef = {
  name: "open_decision",
  description: "Open a new decision with a question.",
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
      packetId: { type: "string", description: "Decision id (packetId from get_workspace)" },
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
      packetId: { type: "string", description: "Decision id (packetId from get_workspace)" },
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
      packetId: { type: "string", description: "Decision id (packetId from get_workspace)" },
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
      packetId: { type: "string", description: "Decision id (packetId from get_workspace)" },
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
      packetId: { type: "string", description: "Decision id (packetId from get_workspace)" },
      what: { type: "string", description: "What evidence you need" },
    },
    required: ["packetId", "what"],
  },
};

const addTask: ToolDef = {
  name: "add_task",
  description:
    "Assign a task to a seat (owner or contributor). The assignee's agent sees it in get_workspace.",
  untrustedContentHint: true,
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "string", description: "What needs doing" },
      assignee: { type: "string", description: "owner or contributor" },
    },
    required: ["text", "assignee"],
  },
};

const completeTask: ToolDef = {
  name: "complete_task",
  description: "Mark a task done. Calling it again reopens the task.",
  inputSchema: {
    type: "object",
    properties: {
      taskId: { type: "string", description: "Task id from get_workspace" },
    },
    required: ["taskId"],
  },
};

export function toolsForSeat(seat: Seat): ToolDef[] {
  if (seat === "owner") {
    return [getWorkspace, editDoc, openDecision, proposeOption, attachEvidence, addTask, completeTask];
  }
  return [getWorkspace, comment, challenge, requestEvidence, addTask, completeTask];
}

export function isAllowedOp(seat: Seat, op: string): op is Op {
  if (op === "get_workspace") return false;
  return toolsForSeat(seat).some((t) => t.name === op);
}

export const NEVER_REGISTER = ["decide", "choose", "close", "defer", "reopen"] as const;
