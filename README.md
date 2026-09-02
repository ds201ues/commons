# Commons

A **link is the workspace**. Humans and agents still lack a common surface to collaborate at scale — Claude’s artifacts stay in Claude, a ChatGPT canvas stays in ChatGPT. **WebMCP** puts tools on the page so people and agents meet the same room. **Commons** is a decision-making prototype of that idea: create a room, share the URL, work the same brief and task list. **Owner** and **Contributor** get different tools. **Only a human can Stamp Decide** — once locked, agents cannot rewrite the close.

**Live:** [https://getcommons.vercel.app](https://getcommons.vercel.app) · **Licence:** MIT

Do **not** use bare `commons.vercel.app` — that hostname is a different product.

---

## Try it

No login. No credentials.

1. **ChatGPT desktop**, Personal plan, model **Sol** or **Terra**, **Work** mode, **in-app browser**. Enterprise and Luna return `Capability is not available: webmcp`.
2. Open [https://getcommons.vercel.app](https://getcommons.vercel.app). The homepage creates a room. This browser is **Owner** (HttpOnly cookie).
3. Ask the agent to call `get_workspace`, then `propose_option` and `attach_evidence`. The rail updates; activity shows **Owner · Agent**.
4. **Stamp Decide** is a button on the page — not a registered tool. Reload: the call stays closed on the Decisions Wall.
5. **Copy share link** for Contributor. Sharing cannot forge Owner. Contributor tools include `challenge` / `request_evidence` and omit `open_decision` / `rename_room`.

Chrome backup: `chrome://flags/#enable-webmcp-testing` + [Model Context Tool Inspector](https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd).

Optional fixture (already decided — not the live demo): [https://getcommons.vercel.app/r/checkout-friday](https://getcommons.vercel.app/r/checkout-friday)

---

## Why WebMCP

**Fit.** WebMCP turns the page into the shared surface. Agents discover tools by visiting the URL. Seats register different lists. Decide is missing on purpose: the page owns the close (human click → single-use nonce). That is the human-in-the-loop case — not a backend MCP wrapper with a thin UI, and not a vendor canvas only one product can edit.

**Better UX.** An Owner agent proposes options and attaches evidence in one turn instead of clicking the rail. A Contributor can challenge and request a missing fact but cannot rename the room or open a new call. Humans still see the brief, presence, activity (Owner/Contributor · Human/Agent), and Stamp Decide.

**Newly possible.** You cannot share a Claude artifact with ChatGPT and keep one object. You cannot put the team’s call in a Doc and stop an agent from claiming it closed. Commons is that common room: ChatGPT-in-browser and `POST /api/rooms/:id/ops` hit the same `applyOp`. Closing returns `needs_human_decide` unless a human minted the token.

**Implementation.** Next.js 15 on Vercel, Upstash Redis. `document.modelContext.registerTool` with JSON Schema, `annotations.readOnlyHint` / `untrustedContentHint`, `AbortSignal`. Tool output is a seat-scoped snapshot (`myOpenTasks` first, ≤1.5K). No iframes; origin isolation left intact. `decide` / `choose` / `close` are in `NEVER_REGISTER`.

---

## What ships

- Create room → unguessable `/r/<id>` + owner cookie. Share URL is `/r/<id>?as=contributor`.
- Brief + open decisions + Decisions Wall + activity log + live presence.
- Tasks: assign to a seat. WebMCP is pull-only — the page cannot wake an agent. `get_workspace` returns `myOpenTasks` + `taskHint`.
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

Local agents and curl call the same `applyOp` as tool `execute()`.

```bash
curl -s https://getcommons.vercel.app/api/rooms/checkout-friday

curl -s -X POST https://getcommons.vercel.app/api/rooms/checkout-friday/ops \
  -H 'content-type: application/json' \
  -d '{"as":"owner","op":"propose_option","input":{"packetId":"pkt-checkout","label":"Hold for Monday"}}'

# Decide without a human token — must fail
curl -s -X POST https://getcommons.vercel.app/api/rooms/checkout-friday/ops \
  -H 'content-type: application/json' \
  -d '{"as":"contributor","op":"decide","input":{"packetId":"pkt-checkout","optionId":"opt-ship"}}'
```
