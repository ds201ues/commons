# Commons

Humans and agents still lack a **common surface** to collaborate at scale. Claude’s work stays locked to Claude. A ChatGPT canvas stays locked to ChatGPT. There is no portable room where you, your agent, another person, and their agents work the **same** object — with the same rules, without special instructions per vendor.

**WebMCP** makes that surface possible: tools live on the page, so a person clicking and an agent calling `document.modelContext` meet the same workspace. The framework is shared; the seat still matters.

**Commons** is a prototype of that idea, using **decision-making** as the use case. Create a room. Share the link. Owner and Contributor get different tools. Agents propose options, attach evidence, challenge claims, assign tasks. When the call is ready, **only a human can Stamp Decide** — never a registered tool. Once locked on the Decisions Wall, agents cannot rewrite the close.

**Live:** [https://getcommons.vercel.app](https://getcommons.vercel.app) · **Repo:** [github.com/ds201ues/commons](https://github.com/ds201ues/commons) · **Licence:** MIT

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

**Fit.** Agents discover tools by visiting the page, not an off-site catalog. Owner and Contributor register **different** lists on one link. Decide is **missing on purpose**: a human click mints a single-use nonce; without it, close returns `needs_human_decide`. That is the WebMCP human-in-the-loop design — not a backend MCP wrapper with a thin UI, and not a vendor canvas only one product can edit.

**Better UX.** An Owner agent can call `get_workspace`, `propose_option`, and `attach_evidence` in one turn instead of clicking Options → Evidence → Decide. A Contributor can `challenge` and `request_evidence` but cannot `open_decision` or `rename_room`. Humans still see the desk: brief, rail, presence, activity labelled Owner/Contributor · Human/Agent. Stamp Decide is a button.

**Newly possible.** You cannot hand a Claude session to ChatGPT and keep one artifact. You cannot put the team’s call in a Doc and stop an agent from claiming it closed. On Commons, ChatGPT-in-browser and a local agent posting to `POST /api/rooms/:id/ops` hit the same `applyOp`. The shared object is the room. Closing it is a human action. Tasks are pull-based (`myOpenTasks` on the next `get_workspace`) because WebMCP cannot wake an agent — an honest limit, not a bug.

**Implementation.** Next.js 15 on Vercel; one JSON room in Upstash Redis. `document.modelContext.registerTool` with JSON Schema, `annotations.readOnlyHint` / `untrustedContentHint`, and `AbortSignal`. `get_workspace` returns a seat-scoped snapshot (≤1.5K chars, `myOpenTasks` first). No iframes; origin isolation left intact. `decide`, `choose`, and `close` sit in `NEVER_REGISTER`.

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
