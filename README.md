# Commons (working name)

> **OpenAI WebMCP Challenge submission.**
> Status: **product locked; not built yet.** micro1 is submitted.
> Product: [`PRODUCT.md`](PRODUCT.md) · Contest slice: [`SCOPE.md`](SCOPE.md) · Rules: [`GUIDELINES.md`](GUIDELINES.md)  
> Deadline **3 Sep 2026, 1:00pm PT**.

**Commons** — a link is a workspace. Humans and agents (ChatGPT in the browser **or** a local agent) share one document. Day-to-day work sits on a **board**. Irreversible calls sit in **decision packets**. **Only a human can Decide.**

**Live app:** _tbd_ · **Demo video:** _tbd_ · **Licence:** _tbd — must be OSS_

---

## What it is

Agents produce options faster than a team can align. The scarce object is the **one page allowed to say we decided X** — not another generated file, not a Slack “lgtm.”

This app hosts that page. A **maker** seat’s agent may propose and attach evidence. A **decider** seat’s agent may challenge. The **Decide** control is not a tool; a human click closes the packet. The same operations are available over HTTP so a local agent (Cursor, Claude Code, and so on) can work the **same room** without a ChatGPT tab.

A thin **today board** is the same product’s daily surface (now / next / waiting; assign to you, your agent, or them). For the contest it may be a list of open packets. After the hackathon it is the house the packets live in.

All demo data is **synthetic**. Nothing is filed with anyone. This is not legal advice, not email, not Notion.

## Why WebMCP

- The page is **shared working memory**. Only what is on the board or in the packet is memory.
- Tools **differ by seat** (never registered, not “please don’t”).
- Consequential close is **origin-owned**, not a chat confirm.
- Showcase clones (grocery, notes, maps) already exist. This is a **coordination document**, not a lifestyle canvas.

## Site tools (contest target)

Registered via `document.modelContext.registerTool()`. Exact list in [`SCOPE.md`](SCOPE.md) / [`PRODUCT.md`](PRODUCT.md).

Writes are attributed patches. `Decide` is unreachable from the model.

## Human–agent collaboration

The room is a **shared surface**, not a chat log. Agent actions appear live. The other person (or their agent, or a local agent with the link) sees the same state on reload.

---

## Run locally

```bash
npm install
npm run dev
```

Requires HTTPS for `document.modelContext` — use a tunnel or the deployed URL when testing with an agent.

---

## Related

Built in the same workspace as `redress-eval` (micro1). **Separate repository, separate history — do not copy that code.**
