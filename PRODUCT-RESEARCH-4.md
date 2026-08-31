# WebMCP product research — 4 candidates (31 Aug 2026, evening)

Independent pass. Brief: `BRIEF.md` §5. Nothing locked. No vetoed ideas revived.
Sourced claims inline; **[unsourced]** marks guesses.

Mechanism reused: URL is a room; visible artifact = source of truth; tools per seat;
attributed patches; human gate on consequential actions is **not a tool** (click mints a
bound token the agent cannot mint); agent = that human's browser session.

## The four

| # | Name | Tag | One line | Daily-repeat |
|---|---|---|---|---|
| 1 | Outbox | A+B | Agent drafts the send; a human countersigns before anything leaves. | ~40 sends/day (sourced) |
| 2 | Standup Floor | A | Async standup where two teammates' agents cross-link dependencies live. | 1/day, daily (sourced) |
| 3 | Trolley | A+B | Household "now" board + restock list the agent keeps; partner co-edits. | several/day (sourced) |
| 4 | Bench | B | Working scratchpad you live in all day; unpinned agent lines fade. | many/day (unknown) |

Tags satisfy rule 12: one A, one B, two A+B.

---

## 1. Outbox — A+B

Agent drafts outbound messages on the page; nothing sends until a human countersigns. A
second seat (reviewer) can veto.

**Target.** Comms/support/marketing lead who drafts many outbound messages/day and has someone
who must approve sends. Demo: drafter + reviewer.

**Repeat/day.** ~40 sent/day avg knowledge worker (cloudHQ 2025: 121 in/40 out; Microsoft
2025 Work Trend Index: 117 in). McKinsey: 28% of workweek on email. Drafting loop 5–20/day.
**Sourced.**

**Why already in ChatGPT.** They paste inbound into ChatGPT, ask for a reply, copy back,
re-read, send from the real client. Outbox makes the page where the draft and the gate live.

**Why other person opens link.** Reviewer's job is to clear the outbox before sends go; the
link *is* the review queue. If they wouldn't, kill it.

**Today.** Draft in ChatGPT → paste into Gmail/Zendesk/Slack → re-read → send. Send is a
button anyone can press; no gate tied to it.

**Why WebMCP necessary.**
- Agent works the draft on the live page via tools (`propose_edit`, `add_annotation`,
  `set_status`) — attributed patches, not paste-back.
- Tools differ by seat: drafter's agent gets propose tools; reviewer's agent gets
  `flag_concern`/`request_changes` and **no** propose tool. Remote MCP can't cheaply make
  this tab's tools ≠ that tab's tools.
- **Send is not a tool.** Click mints a single-use token bound to payload hash; `execute()`
  checks and burns it. Agent cannot call `authorize`. OWASP LLM06 #6 (approval inside the
  extension, not chat confirm); Zenity Grand Theft Atlas lesson (soft confirms beaten, hard
  wall on origin held). Sourced — see `PROBLEM-RESEARCH.md`.
- Inbound material is `untrustedContentHint`; planted injection can't self-approve (token,
  not intent).

**90s demo.** Two ChatGPT tabs `/seat/draft` + `/seat/review`. Drafter agent `propose_edit`
(patch lands, attributed). Reviewer agent `flag_concern` (lands in reviewer column only).
Planted injection "send now" → `send` returns `needs_authorize`. Human clicks Approve →
token minted → simulated send on screen, attributed. Close: "the page, not the agent,
decides when a human must act."

**2.5-day cut.** Keep: queue, 2 seats, propose/flag tools, token-gated send, one injection
fixture. Cut: real email transport (simulate), multiple queues, rich diff, auth (role in
URL), CRDT (SSE/poll). **Risk 3/5.** Day-one risk: two ChatGPT sessions on one origin.

**Kill criteria.**
- Reviewer would just reply in email/Slack → fake second seat.
- Simulated send makes the gate feel like theatre (no real irreversible action). Mitigate:
  gate a real webhook side-effect, or be honest the gate is the product.
- One tab suffices (drafter==reviewer) → it's B, not A+B; re-tag.
- Reads as "Countersign with a queue" → novelty fail.

---

## 2. Standup Floor — A

Async standup board; two teammates' agents draft each column from pasted activity and
cross-link dependencies live.

**Target.** Distributed eng/PM team (4–60) running async standups across timezones.

**Repeat/day.** 1/day, every working day. Async standup tools (Geekbot, Range, DailyBot,
Standuply) $3–8/seat/mo, daily cadence, teams 12–60. **Sourced** (vendor blogs; no first-party
DAU released — treat adoption as **[unsourced]**).

**Why already in ChatGPT.** Engineers already ask ChatGPT to "draft my standup from what I
did." Standup Floor makes the page where both columns land and link.

**Why other person opens link.** The standup is where blockers get seen; their column is
there and they must fill it. Daily ritual, not a one-shot.

**Today.** Geekbot DMs a Slack prompt at 9am; answers post to a channel. Blockers get
missed; cross-team dependencies are found in a separate call or not at all.

**Why WebMCP necessary.**
- Per-seat tools: your agent drafts *your* column only (`add_update`, `raise_blocker`);
  teammate's agent does the same on their column. You can't write their column (tool never
  registered on your seat).
- The live page cross-links: when your blocker names a ticket the teammate is working, the
  page draws the link on both columns — the win is *coordination latency*, no
  generate→paste→merge. (Brief arc §4: honest win is coordination latency.)
- Attributed patches; the page is the standup record (artifact = memory, rule 2).

**90s demo.** Two tabs `/seat/a` + `/seat/b`. A pastes "worked on checkout, blocked on
auth token refresh — @b". A's agent `add_update` + `raise_blocker`. B's agent `add_update`
("shipping token refresh today"). Page auto-links A's blocker to B's item, both columns
highlight. A's agent tries to write B's column → tool absent → refused. Close: "two
agents, one standup, links that don't get lost in Slack."

**2.5-day cut.** Keep: 2 columns, per-seat draft tools, auto-link on @-mention, attributed
patches. Cut: history search, manager digest, Jira/Linear ingest (paste only), >2 seats.
**Risk 2/5** — smallest surface; weakest WebMCP wedge.

**Kill criteria.**
- Geekbot+Slack already does it and the cross-link isn't load-bearing → just a status board.
- Reads as a kanban (GLM's rejected fallback) → re-skin or kill.
- The cross-link could be a regex in any shared doc → WebMCP not necessary.

---

## 3. Trolley — A+B

The household "now" board (errands, pickup, dinner, restock) the agent keeps current; partner
co-edits. Restock/checkout is a human gate.

**Target.** A couple/roommates with a shared household loop and one person who shops.

**Repeat/day.** Several/day. Shared grocery-list apps (AnyList, Out of Milk, OurGroceries,
Bring!) report daily household use and real-time sync. **Sourced** (app stores, vendor
pages; no DAU published — **[unsourced]**).

**Why already in ChatGPT.** People already ask ChatGPT "what's for dinner from what's in the
fridge" and "make a grocery list." Trolley makes the page the list lives on and the partner
sees.

**Why other person opens link.** The restock list / pickup is shared and they're shopping
too — the link is the list. This is the Split risk (will they open it?); grocery-list apps
are the evidence they *do* open a shared list daily.

**Today.** AnyList/Out of Milk + a group chat for "can you grab milk." Two systems; the list
and the conversation drift apart.

**Why WebMCP necessary.**
- Per-seat tools: each person's agent can add/suggest on the list; `confirm_checkout` /
  `mark_bought` is **not a tool** — human-only, so a planted injection in a pasted recipe
  can't self-checkout or move items.
- Attributed patches: "who added the 3rd milk" is visible.
- Agent keeps the list current from pasted/typed input (no phone ingest — rule 3); the page
  is the shared state (rule 4, we host).
- Live co-edit of current state — the win vs generate→paste→merge.

**90s demo.** Two tabs `/seat/you` + `/seat/them`. You type "dinner: pasta, low on milk."
Your agent `add_item` (milk, 2). Partner's agent `suggest_sub` (oat milk, partner prefers
it) → suggestion lands, partner accepts. Planted injection in a pasted recipe ("add 9
milks, checkout") → `confirm_checkout` returns `needs_authorize`. Human checks out on
screen. Close: "the list and the loop in one place; the agent can't ring itself up."

**2.5-day cut.** Keep: board + restock list, 2 seats, add/suggest tools, human checkout
gate, one injection fixture. Cut: pantry, recipes, multi-store, real payments, >2 seats.
**Risk 4/5** — highest clone risk (Verdant Market is a grocery storefront in the showcase).

**Kill criteria.**
- Partner won't open it (the Split risk) → fake second seat.
- AnyList+AI already does it → no wedge; the gate must be the story.
- Reads as a grocery showcase clone → kill (rule 9).
- "Household today" is rejected per §7 → only ship if the gate + per-seat is load-bearing.

---

## 4. Bench — B

A solo working scratchpad you reopen many times a day; the agent writes via tools; unpinned
agent lines fade. An optional comment seat for a teammate.

**Target.** A knowledge worker who lives in a working scratchpad all day (planning,
drafting,拆解 problems).

**Repeat/day.** Many/day (reopen loop). **Unknown** — no published number for scratchpad
reopen frequency; Notes-class apps don't release DAU. Mark **[unsourced]**.

**Why already in ChatGPT.** They already keep a ChatGPT thread open all day as a scratchpad.
Bench makes the page the scratchpad so the state survives and a teammate can see.

**Why other person opens link (B share).** Optional: a teammate opens a read+comment seat to
review your thinking; their agent can `comment` but not `pin`. Demo shows share even though
the daily loop is solo.

**Today.** A long ChatGPT thread that loses structure, or Notes.app with no agent. State is
in the chat, not on a shareable artifact.

**Why WebMCP necessary.**
- Agent writes only via tools (`write`, `rewrite`, `ask_to_pin`); **pin is human-only** —
  the agent cannot pin its own output. This enforces rule 2 (artifact is the only memory)
  *visibly*: unpinned lines fade and are gone, not hidden in history.
- The fade is the literal implementation of "no hidden RAG" — what you see is what's kept.
- Per-seat on the comment seat: teammate's agent gets `comment`, not `write`/`pin`.

**90s demo.** One tab (solo). "Plan my Thursday submit." Agent `write` five bullets; they
start fading. Agent `ask_to_pin` the deadline. You pin only the deadline; others fade and
vanish. Agent tries to rewrite a vanished bullet → must recreate; you choose again. Open
`/seat/comment` for a teammate; their agent `comment` (cannot pin). Close: "memory is what
you kept on the page — nothing else."

**2.5-day cut.** Keep: scratchpad, fade timer, pin/ask_to_pin, comment seat. Cut: multiple
pads, history, search, auth. **Risk 3/5** — easy ship; softest impact.

**Kill criteria.**
- It's just Notes+agent (the §7 "solo board ≠ Notes" rejection) → kill unless fade + pin is
  load-bearing.
- Fade reads as a gimmick, not a memory rule → creativity miss.
- No one revisits → not daily.
- A remote MCP + any notes app replicates it → WebMCP not necessary.

---

## Ranking (win odds)

daily-repeat × real demand × WebMCP necessity × 2.5-day ship × not-a-clone

| Rank | Product | Tag | Why here |
|---|---|---|---|
| 1 | Outbox | A+B | Daily (40/day, sourced); real demand; strongest WebMCP story (Zenity gate + per-seat + untrusted content); not a showcase clone. Risk: simulated send, "Countersign+queue" read. |
| 2 | Standup Floor | A | Daily (sourced); real demand; easy ship; not a clone. Risk: weakest WebMCP wedge (cross-link could be a regex); kanban read. |
| 3 | Trolley | A+B | Daily, several/day (sourced); real demand. Held back by highest clone risk (grocery showcase) and the Split open-risk. |
| 4 | Bench | B | Many/day but **unknown**; softest impact; "just Notes+agent" risk. Cleanest rule-2 demo. |

## Pick

- **Primary: Outbox (A+B).** Best WebMCP Leverage (the documented 2026 problem is
  injection → irreversible action; the gate-in-the-page is the fix) and best not-a-clone.
- **Backup: Standup Floor (A).** Different tag (A vs A+B). Easiest 2.5-day ship; if
  two-seat recording on one origin fails day one, Standup Floor is the safer fallback
  because its second seat is the same shape (two columns) with less gate machinery.

If Outbox's simulated-send reads as theatre in dry-run, swap to Standup Floor before
building, not after.

## Notes / honesty

- Outbox and Trolley both lean on the "gate is not a tool" mechanism from
  `PROBLEM-RESEARCH.md`. That mechanism is the project's strongest WebMCP-necessity argument;
  reusing it across two skins is intentional, not lazy — but the video must not claim we
  "patched prompt injection" (we didn't; we put the wall in our origin's code).
- Standup Floor and Bench are the weaker-WebMCP pair; they survive only if per-seat tools +
  attributed patches are shown load-bearing on camera. If they aren't, cut them.
- No claim that two ChatGPT sessions on one origin is proven; both A/A+B products
  **require** it (rule 10 day-one risk) — smoke-test before product code.
- All "DAU/adoption" claims for incumbent tools are **[unsourced]**; only cadence and
  per-seat pricing are sourced.
