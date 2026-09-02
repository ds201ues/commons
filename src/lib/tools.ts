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
  description:
    "Read the shared room. Always check myOpenTasks first (open work assigned to your seat), then openTasks, activePacketId, openPackets, brief, and recent activity. WebMCP cannot wake you — call this when the human asks you to pick up work.",
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
  description: "Update the shared brief (markdown document everyone in the room sees).",
  untrustedContentHint: true,
  inputSchema: {
    type: "object",
    properties: {
      markdown: { type: "string", description: "Full document markdown" },
    },
    required: ["markdown"],
  },
};

const renameRoom: ToolDef = {
  name: "rename_room",
  description:
    "Rename this room. Updates the title in the top bar for everyone sharing the link.",
  untrustedContentHint: true,
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string", description: "New room title" },
    },
    required: ["title"],
  },
};

const openDecision: ToolDef = {
  name: "open_decision",
  description:
    "Open a new decision with a question. Prefer editing the existing open decision when one already exists — multiple open decisions split options/evidence. Returns packetId; use that (or omit packetId later to hit activePacketId).",
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
  description:
    "Add an option to an open decision. Omit packetId to target get_workspace.activePacketId (newest open).",
  untrustedContentHint: true,
  inputSchema: {
    type: "object",
    properties: {
      packetId: {
        type: "string",
        description: "Optional. Open decision id from get_workspace.openPackets / activePacketId",
      },
      label: { type: "string", description: "Short option name" },
      body: { type: "string", description: "Why this option" },
    },
    required: ["label"],
  },
};

const attachEvidence: ToolDef = {
  name: "attach_evidence",
  description:
    "Attach a short evidence bullet. Omit packetId to target get_workspace.activePacketId.",
  untrustedContentHint: true,
  inputSchema: {
    type: "object",
    properties: {
      packetId: {
        type: "string",
        description: "Optional. Open decision id from get_workspace.openPackets / activePacketId",
      },
      text: { type: "string", description: "Evidence text" },
    },
    required: ["text"],
  },
};

const comment: ToolDef = {
  name: "comment",
  description: "Add a comment on an open decision. Omit packetId to use activePacketId.",
  untrustedContentHint: true,
  inputSchema: {
    type: "object",
    properties: {
      packetId: {
        type: "string",
        description: "Optional. Open decision id from get_workspace",
      },
      text: { type: "string", description: "Comment text" },
    },
    required: ["text"],
  },
};

const challenge: ToolDef = {
  name: "challenge",
  description: "Record a challenge. Omit packetId to use activePacketId.",
  untrustedContentHint: true,
  inputSchema: {
    type: "object",
    properties: {
      packetId: {
        type: "string",
        description: "Optional. Open decision id from get_workspace",
      },
      text: { type: "string", description: "The challenge" },
    },
    required: ["text"],
  },
};

const requestEvidence: ToolDef = {
  name: "request_evidence",
  description: "Ask for a missing fact. Omit packetId to use activePacketId.",
  untrustedContentHint: true,
  inputSchema: {
    type: "object",
    properties: {
      packetId: {
        type: "string",
        description: "Optional. Open decision id from get_workspace",
      },
      what: { type: "string", description: "What evidence you need" },
    },
    required: ["what"],
  },
};

const addTask: ToolDef = {
  name: "add_task",
  description:
    "Assign work to a seat (owner or contributor). Pull-based: the assignee's agent sees it in get_workspace.myOpenTasks on their next call — the page cannot wake that agent.",
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
  description:
    "Mark a task done after you finish the work. Pass taskId from myOpenTasks / openTasks / tasks in get_workspace. Calling again reopens it.",
  inputSchema: {
    type: "object",
    properties: {
      taskId: {
        type: "string",
        description: "Task id from get_workspace.myOpenTasks (preferred) or tasks",
      },
    },
    required: ["taskId"],
  },
};

export function toolsForSeat(seat: Seat): ToolDef[] {
  if (seat === "owner") {
    return [getWorkspace, editDoc, renameRoom, openDecision, proposeOption, attachEvidence, addTask, completeTask];
  }
  // Contributors edit the shared brief and argue; only owner opens/renames the room.
  return [
    getWorkspace,
    editDoc,
    proposeOption,
    attachEvidence,
    comment,
    challenge,
    requestEvidence,
    addTask,
    completeTask,
  ];
}

export function isAllowedOp(seat: Seat, op: string): op is Op {
  if (op === "get_workspace") return false;
  return toolsForSeat(seat).some((t) => t.name === op);
}

export const NEVER_REGISTER = ["decide", "choose", "close", "defer", "reopen"] as const;
