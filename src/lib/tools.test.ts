import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoom } from "./fixture";
import { workspaceSnapshot } from "./snapshot";
import { isAllowedOp, NEVER_REGISTER, toolsForSeat } from "./tools";

describe("toolsForSeat", () => {
  it("gives the owner the locked tool list and never decide", () => {
    const names = toolsForSeat("owner").map((t) => t.name);
    expect(names).toEqual([
      "get_workspace",
      "edit_doc",
      "open_packet",
      "propose_option",
      "attach_evidence",
      "add_task",
      "complete_task",
    ]);
    expect(names.some((n) => (NEVER_REGISTER as readonly string[]).includes(n))).toBe(
      false,
    );
  });

  it("gives the contributor the locked tool list and never decide", () => {
    const names = toolsForSeat("contributor").map((t) => t.name);
    expect(names).toEqual([
      "get_workspace",
      "comment",
      "challenge",
      "request_evidence",
      "add_task",
      "complete_task",
    ]);
    expect(names.some((n) => (NEVER_REGISTER as readonly string[]).includes(n))).toBe(
      false,
    );
  });

  it("marks get_workspace read-only and not a mutating op", () => {
    const tool = toolsForSeat("owner").find((t) => t.name === "get_workspace");
    expect(tool?.readOnlyHint).toBe(true);
    expect(isAllowedOp("owner", "get_workspace")).toBe(false);
    expect(isAllowedOp("contributor", "decide")).toBe(false);
    expect(isAllowedOp("owner", "propose_option")).toBe(true);
    expect(isAllowedOp("owner", "edit_doc")).toBe(true);
    expect(isAllowedOp("contributor", "comment")).toBe(true);
    expect(isAllowedOp("owner", "challenge")).toBe(false);
  });

  it("never registers decide, choose, close, defer, or reopen", () => {
    for (const blocked of NEVER_REGISTER) {
      expect(toolsForSeat("owner").some((t) => t.name === blocked)).toBe(false);
      expect(toolsForSeat("contributor").some((t) => t.name === blocked)).toBe(false);
    }
  });
});

describe("workspaceSnapshot", () => {
  it("never includes the page nonce or decide token", () => {
    const out = workspaceSnapshot(fixtureRoom());
    expect(out.toLowerCase()).not.toContain("nonce");
    expect(out).not.toMatch(/decideToken/i);
  });

  it("includes the document and packet comments", () => {
    const room = fixtureRoom();
    room.packets[0]?.comments.push({
      id: "cm-review",
      text: "Add the rollout owner.",
      authorSeat: "contributor",
    });
    const out = workspaceSnapshot(room);
    // JSON-escaped newlines — match distinctive substrings, not raw markdown.
    expect(out).toContain("Discuss whether to ship the payment-form rewrite");
    expect(out).toContain("Add the rollout owner.");
    expect(out).toContain('"docMarkdown"');
  });

  it("includes room tasks so an assigned agent can discover its work", () => {
    const out = workspaceSnapshot(fixtureRoom());
    expect(out).toContain('"tasks"');
    expect(out).toContain("Pull the load-test numbers");
    expect(out).toContain('"assignee"');
  });
});

describe("webmcp-registrar isolation", () => {
  it("does not import decide-bar or nonce", () => {
    const src = readFileSync(
      path.resolve(__dirname, "../components/webmcp-registrar.tsx"),
      "utf8",
    );
    expect(src).not.toMatch(/decide-bar/);
    expect(src).not.toMatch(/\bnonce\b/);
    expect(src).toContain("annotations");
    expect(src).toContain("abort.signal");
  });
});
