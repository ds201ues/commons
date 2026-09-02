# Commons

A **link is the workspace**. Create a room, share the URL. Any human and any agent that can open the page — ChatGPT in the browser, or a local agent over HTTP — work the same brief, the same decision, the same task list. **Owner** and **Contributor** get different WebMCP tools. **Only a human can Decide.**

Pastebin made sharing a page of text a URL. Commons does that for a decision: a disposable room, one link, vendor-agnostic. Today each coding agent keeps its own artifact (Claude Code’s files live in Claude Code; a ChatGPT canvas lives in ChatGPT). There is no common object where a person, a ChatGPT agent, and a laptop agent meet, and where closing the call is a human action the model cannot take. After agentic AI, the human’s job is reviewer and decider. Commons is that job, as a page.

**Live:** [https://redress-desk.vercel.app](https://redress-desk.vercel.app) · **Licence:** MIT · **Solo submission** (no teammates)

OpenAI WebMCP Challenge. Cut: [`SCOPE.md`](SCOPE.md) · Stack: [`DECISIONS.md`](DECISIONS.md) · As shipped: this README. Devpost paste: [`DESCRIPTION.md`](DESCRIPTION.md). Record last: [`VIDEO.md`](VIDEO.md). Judge form fields: [`SUBMISSION.md`](SUBMISSION.md).

---

## Try it (judges)

No login. No account on this app.

1. **ChatGPT desktop**, Personal plan, model **Sol** or **Terra**, **Work** mode, **in-app browser**. Enterprise and Luna return `Capability is not available: webmcp`.
2. Open [https://redress-desk.vercel.app](https://redress-desk.vercel.app). The homepage creates a room. This browser is **Owner** (HttpOnly cookie).
3. Ask the agent to call `get_workspace`, then `propose_option` and `attach_evidence`. The rail and activity log update; activity shows **Agent**, not Human.
4. **Stamp Decide** is a button on the page. It is not a registered tool. Reload: the call stays closed on the Decisions Wall.
5. **Copy share link** for Contributor (and a second agent). Sharing cannot forge Owner. Contributor tools include `challenge` / `request_evidence` and omit `open_decision` / `rename_room`.

Chrome backup: `chrome://flags/#enable-webmcp-testing` + [Model Context Tool Inspector](https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd).

Optional read-only fixture (already decided — do not use as the live demo): [https://redress-desk.vercel.app/r/checkout-friday](https://redress-desk.vercel.app/r/checkout-friday)

---

## Why WebMCP (four answers)

**Fit.** Agents discover tools by visiting the page. Seats register different lists. Decide is missing on purpose: the page owns the close (human click → single-use nonce). That is the spec’s human-in-the-loop case, not a backend MCP server with a thin UI, and not a vendor canvas that only one product can edit.

**Better UX.** An Owner agent opens a decision, proposes options, and attaches evidence in one turn instead of clicking the rail. A Contributor agent can challenge and request a missing fact but cannot rename the room or open a new call. Humans still see the brief, presence, activity (Owner/Contributor · Human/Agent), and Stamp Decide.

**Newly possible.** You cannot share a Claude Code artifact with ChatGPT and have both edit it. You cannot put “the team’s call” in a Google Doc and stop an agent from claiming it closed. Commons is a vendor-neutral room: ChatGPT-in-browser and `POST /api/rooms/:id/ops` hit the same `applyOp`. Closing returns `needs_human_decide` unless a human minted the token.

**Implementation.** Next.js 15 on Vercel, Upstash Redis. `document.modelContext.registerTool` with JSON Schema, `annotations.readOnlyHint` / `untrustedContentHint`, `AbortSignal`. Tool output is a seat-scoped snapshot (`myOpenTasks` first, ≤1.5K). No iframes; origin isolation left intact. `decide` / `choose` / `close` are in `NEVER_REGISTER`.

---

## Product surface (shipped 2 Sep 2026)

- Create room → unguessable `/r/<id>` + owner cookie. Share URL is `/r/<id>?as=contributor` so the same browser cannot stay Owner.
- Brief (in-place rich edit → markdown) + open decisions + Decisions Wall + activity log + live presence.
- Tasks: assign to a seat. WebMCP is pull-only — the page cannot wake an agent. `get_workspace` returns `myOpenTasks` + `taskHint` so the next visit can pick up work.
- **Never** register `decide`. Human button + nonce only.

| Seat | WebMCP tools |
|---|---|
| Owner | `get_workspace`, `edit_doc`, `rename_room`, `open_decision`, `propose_option`, `attach_evidence`, `add_task`, `complete_task` |
| Contributor | `get_workspace`, `edit_doc`, `propose_option`, `attach_evidence`, `comment`, `challenge`, `request_evidence`, `add_task`, `complete_task` |

---

## Run locally

```bash
cp .env.example .env.local   # Upstash required on Vercel; optional locally
npm install
npm test
npm run dev
```

- Home: http://localhost:3000 — creates a room (Owner cookie)
- Fixture: http://localhost:3000/r/checkout-friday

Production persist is **Upstash only**. Without `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`, Vercel returns `persist_unavailable` (503) on writes.

---

## HTTP ops (same kernel as WebMCP)

Local agents and curl call the same `applyOp` as `execute()`.

```bash
curl -s https://redress-desk.vercel.app/api/rooms/checkout-friday

curl -s -X POST https://redress-desk.vercel.app/api/rooms/checkout-friday/ops \
  -H 'content-type: application/json' \
  -d '{"as":"owner","op":"propose_option","input":{"packetId":"pkt-checkout","label":"Hold for Monday"}}'

# Decide without a human token — must fail
curl -s -X POST https://redress-desk.vercel.app/api/rooms/checkout-friday/ops \
  -H 'content-type: application/json' \
  -d '{"as":"contributor","op":"decide","input":{"packetId":"pkt-checkout","optionId":"opt-ship"}}'
```
