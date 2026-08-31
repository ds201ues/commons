# WebMCP product brief — 31 Aug 2026 (evening IST)

**Status:** **superseded for product lock.** Builder locked **Decision Window (primary) + team daily board (feature)** on 31 Aug 2026. Source of truth: [`PRODUCT.md`](PRODUCT.md). Contest cut: [`SCOPE.md`](SCOPE.md). This file remains the research brief (killed ideas, veto list). Do not revive killed ideas. Do not start another research pass unless the lock is explicitly reopened.

**Contest:** OpenAI WebMCP Challenge. Deadline **3 Sep 2026, 1:00pm PT**. Solo. Host: **Vercel Hobby**. Video **&lt;3 min** with audio. Judges may only watch the video. Criteria (equal): WebMCP Leverage, Execution, Potential Impact, Creativity. Direction we must show: *the page is shared working memory; any WebMCP agent is a client; no Drive; not a one-shot file.*

**Repo:** `redress-desk`. Do not copy `redress-eval`.

---

## 1. Conversation arc (how we got here)

1. **Win-odds canvases.** Showcase (Sunday Table, Cubecade, Paperie, Verdant Market, Modeling Studio, Margin, Crossword, Fieldwork, WanderNote, Webroom) is lifestyle/creative. Early Countersign (airline letter + send gate) was scoped then weakened vs Margin + a gate.

2. **Swatch / Legend hollow.** Design-token workbench lost to “agent already edits code, app hot-reloads.” Legend (author tools on a fixture) is meta-crowded (Chrome inspector/evals). **File generation (PDF/PPT) is solved** by Claude/Opus/code; WebMCP scrolling is slower.

3. **Zenity / page-owned gates.** Real 2026 problem: untrusted page content hijacks logged-in browser agents (Grand Theft Atlas). Soft chat confirms fail; **hard code on the origin** holds. Chrome: `untrustedContentHint`, `readOnlyHint`, confirm with user. OWASP LLM06: approval **inside the tool**. Useful as a **gate on export**, not as the daily product (Holdfire incident board is not a daily artifact).

4. **First principles.** Minting an artifact → **code wins**. Co-edit of **current shared state** → live page wins. WebMCP cell-by-cell is not faster than pandas. Honest win is **coordination latency** (no generate → upload Drive → merge).

5. **Collab room.** Product is not “a spreadsheet.” It is humans + **BYO agents** on one URL, no GDrive/M365. Five models (Opus, Fable, Sol, Kimi, GLM) all said: **LOCK only if** role-asymmetric tools (per-viewer register), attributed patches, two ChatGPT tabs. Generic Sheets+Gemini is hollow.

6. **Split / Tab killed (builder).** Settle-up ledger requires humans to add every transaction. People will not. **iPhone cannot access Messages** (or typical chat/payment apps) to ingest. Demand is not “agent collab on a ledger.”

7. **Quoted / Term Sheet killed (builder).** Two-sided quote / job-offer desk **invents** a collaboration problem. The scarce thing is **job offers / deals**, not two agents editing columns.

8. **Artifact-as-memory.** “Hosted room with memory” does **not** mean LLM memory, RAG, or “what we discussed yesterday” on a server. **Only what is shown on the artifact is memory.** Self-contained, like a whiteboard you can reopen. Persist visible state (reload URL, same rows) is allowed — that *is* the artifact. Hidden chat history as source of truth is forbidden.

9. **Now:** find **real** products with **high repeat per day** (or addictive), that still fit the mechanism. Mix of collaboration shapes (below). **Market research required** — not another invented two-column table.

---

## 2. Hard rules

1. **Daily-repeat bar.** Argue **sessions per user per day** (or honest “unknown”). Weekly quotes and annual deposits fail this bar. “Millions of users” without frequency is invalid.

2. **Artifact is the only memory.** Source of truth = what the human sees. No hidden agent memory. Persistence of visible state is OK.

3. **No ingest from iMessage / WhatsApp / Gmail / Venmo / iOS SMS.** If the product needs that data, the human or the **ChatGPT conversation** (paste / talk) puts it on the page. Do not assume phone OS access.

4. **No host dependency** on Gmail, Google Drive, Sheets, M365, PowerPoint, Claude.ai, Splitwise, Linear, etc. We host the room.

5. **Code already wins file minting.** Do not compete with “make me a PDF/PPT/xlsx from a prompt.”

6. **WebMCP load-bearing.** `document.modelContext.registerTool`. Tools **differ by seat** when roles differ (tool never registered, not “please don’t”). Writes are **attributed patches on the live page**. Export / send / settle / accept is **not a tool** (human button). Agent identity = **that human’s browser session**.

7. **Not Claude Artifacts.** Artifacts = one Claude Code session publishes HTML to claude.ai; teammates watch or republish via **Claude**; official docs: **no backend, cannot store form input**. We need **durable two-sided (or solo) state**, **ChatGPT WebMCP** (not only Claude), **no claude.ai account**.

8. **Not Sheets + Gemini.** One vendor agent + range ACL is not our wedge. Wedge is **BYO agent**, URL is the install, page-owned rules.

9. **Not a showcase clone.** Grocery, meals, notes, maps, photo, crossword, music canvases already exist.

10. **2.5-day ship.** No Univer Pro, no full websocket CRDT on Vercel Hobby as the bet, no real OAuth. Role can live in the URL (`/a/...` vs `/b/...`). SSE/poll OK. Day-one risk: two ChatGPT sessions on one origin — say if the idea **requires** that.

11. **Privacy.** No medical/PHI nanny logs, no real child data, no “read my texts.”

12. **Tag every idea A / B / A+B** (see §4). Propose **exactly 4 products**: at least one **A**, one **B**, one **A+B**.

---

## 3. Room shapes (builder mix — do not pick only one)

- **A** — Two humans + their agents are **load-bearing**. Demo fails if only one tab is used.
- **B** — You live in it **all day** with your agent; a second human+agent is **optional**, but the **demo still shows share**.
- **A+B** — Daily solo loop **and** a real second seat.

Work **multiple ideas** spanning A, B, and A+B. Do not collapse everything into one table.

---

## 4. Incumbents

| Incumbent | What it is | Why we are not it |
|---|---|---|
| Claude Artifacts | One session’s HTML capture; org/public link; editors republish via Claude | No form backend; one vendor; not ChatGPT-on-our-origin with different tool surfaces |
| Google Sheets + Gemini | Real collab + one built-in agent | Vendor lock, Google account, same tools both sides |
| Cursor + git | Best mint + patch for engineers | Other party often non-technical; not the ChatGPT-browser channel |
| Showcase apps | Polished lifestyle canvases | Do not clone grocery/notes/maps/photo |
| WhatsApp / iMessage | Where coordination actually happens | We cannot read them; product cannot depend on ingest |

---

## 5. Research mandate (every product)

For **each** of the 4 products, fill all of:

- **Name** + one sentence
- **Tag:** A / B / A+B
- **Target user** (who, not “everyone”)
- **Repeat/day:** number or range + **source or “unknown”**. Closest apps and their published usage if you can name them.
- **Why they are already in ChatGPT** (browser or app) for this job
- **Why the other person would open the link** (A and A+B). If they would not, kill it.
- **What they do today** (WhatsApp, Notes, Sheets, a greasy notebook)
- **Why WebMCP is necessary** (what fails if this is just shared HTML or a remote MCP)
- **90-second demo**
- **2.5-day cut list** + risk 1–5
- **Kill criteria** (when this is fake demand)

**Rank** the 4 for contest win odds: daily-repeat × real demand × WebMCP necessity × 2.5-day ship × not-a-clone.

**Pick:** **primary** and **backup** (backup must have a **different A/B tag** than primary).

Mark unsourced market claims. Prefer boring high-frequency jobs over clever toys. Addictive/game ideas only if WebMCP is load-bearing (not Crossword Desk 2).

---

## 6. Veto list (do not propose these)

- Split / Tab / Settlewise / who-owes-whom ledgers that need manual transaction entry or chat ingest
- Quoted / Term Sheet / job-offer / freelance SOW column editors (invented collab; scarce resource is the deal/offer)
- Deposit / move-out / landlord legal utilities (annual cadence)
- Swatch, Legend-as-product, Specimen “any site → code”
- PDF/PPT/xlsx **creation** as the product
- Holdfire-style incident board as the **daily** app
- Gmail/Drive/Sheets/M365-hosted flows
- Care Relay with medication, photos of minors, PHI
- “Shared spreadsheet” / mini Excel
- iMessage/WhatsApp/Venmo ingest
- Claude Artifacts clone (one agent publishes HTML others watch)

---

## 7. Hypotheses to stress-test (not locks — you may reject all)

- Household “today” board (errands, dinner, pickup) — high pings; share risk like Split (will the other person open it?).
- Workday object two people hit for hours (live decision list, **not** email).
- Solo all-day board you reopen many times (**B**) that is **not** Notes.app.
- Classroom / tutoring / coach–athlete if **repeat/day** is real.
- Addictive streak/game only if tools + page rules are the product.

---

## 8. Mechanism that survived (use it; do not re-derive)

URL is a room. Visible artifact = source of truth. Tools per seat. Attributed patches. Human gate on consequential actions. Agent = browser session. Two role URLs if needed (`/seat/a`, `/seat/b`).
