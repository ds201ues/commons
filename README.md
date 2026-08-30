# Redress Desk — an agent-operable desk for contesting airline refusals

> **OpenAI WebMCP Challenge submission.**
> Status: **scaffold only — not yet built.** Do not start this until `redress-eval` is submitted
> (see `../docs/07-timeline.md`).

**Live app:** _tbd_ · **Demo video:** _tbd_ · **Licence:** _tbd — must be OSS_

---

## What it is

Half of all air-passenger compensation claims that get filed are rejected unlawfully. The refusal
email cites a real article, uses the correct statutory language, and sounds settled. The passenger
has no way to audit it, so they drop the claim.

**Redress Desk lets your agent do it for you.** Forward the refusal, and the agent — working
through site tools exposed by this page — assesses whether the stated ground is lawful, explains
the rule it turns on, computes what you're owed, and drafts a rebuttal letter and a regulator
escalation packet.

**You approve before anything is sent.** That gate is enforced server-side, not by prompt.

## Why WebMCP

- **The manual UI is genuinely painful.** Doing this by hand means reading a regulation, finding
  case law, computing a great-circle distance band, and drafting a formal letter. Nobody completes
  that in a web form.
- **One sentence replaces twenty minutes.** *"My flight to Delhi was delayed six hours last Tuesday
  and the airline refused — here's their email."*
- **The decision stays human.** Sending a legal letter in your own name is not an unattended agent
  action. The approval gate is correct product design, not compliance theatre.
- **It's a real open-web story:** a passenger's agent, acting for them, contesting an institution's
  decision.

## Site tools

Registered via `document.modelContext.registerTool()`.

| Tool | Purpose | Side effects |
|---|---|---|
| `assess_denial` | Refusal + flight facts → verdict, ground, amount | none |
| `explain_ground` | Plain-language explanation of the rule relied on | none |
| `get_entitlement_breakdown` | Distance band, amount, reductions, arithmetic shown | none |
| `list_required_evidence` | What to attach, for this specific case | none |
| `draft_rebuttal` | Produce the letter | creates draft |
| `draft_neb_escalation` | Produce the regulator packet | creates draft |
| `request_approval` | Surface a draft for human sign-off | **gate** |
| `submit_claim` | Simulated submission | **gated** |

### Tool design

Anyone can wrap CRUD endpoints. What we did instead:

- **Intent-level tools.** `assess_denial` is one call, not four.
- **Tight schemas** — enums for verdicts, causes and regimes, not free text.
- **Structured repair hints on failure**, so a blocked agent knows its next move:
  ```json
  { "error": "missing_fact", "field": "actual_arrival_time",
    "hint": "Ask the passenger for arrival time from their boarding pass or the airline app" }
  ```
- **Writes are unreachable without approval**, enforced server-side. An agent calling
  `submit_claim` early gets a structured refusal pointing it at `request_approval`.
- **Every result carries evidence IDs** back to rulepack entries, so the agent can explain rather
  than assert.

## Human–agent collaboration

The desk is a **shared surface**, not a chat log. Agent actions appear live in the page; the
passenger watches the assessment fill in, sees which rule was applied, disagrees in place, edits
the draft, and approves. The agent sees the edit and adapts.

---

## Under the hood

**The model never applies the law.** It extracts facts and writes prose. Entitlement arithmetic is
deterministic; the extraordinary-circumstances classifier may only return a verdict attached to a
key from a versioned rulepack; and every citation in a drafted letter is mechanically verified
against that rulepack before the document is allowed to exist.

The rulepack is **versioned by flight date**. The EU reached political agreement in June 2026 on
revising Regulation 261/2004, with the new rules expected in force in the second half of 2027 — so
two rulesets will coexist, and this system already knows which one applies.

## Run locally

```bash
npm install
npm run dev
```

Requires HTTPS for `document.modelContext` — use a tunnel or the deployed URL when testing with an
agent. Set `MODEL_API_KEY` in `.env` (see `.env.example`); it stays server-side.

---

## Compliance & limits

- All demo data is **synthetic**. No real passengers, no real refusal letters, no personal data.
- **Nothing is actually filed with any airline.** Submission is simulated end to end.
- If you paste a real refusal email into the live app, its text is sent to a model provider for
  processing. Don't include anything you wouldn't share.
- **Not legal advice.** This drafts an argument for you to review and send in your own name. Where
  a case turns on a fact it doesn't have, it says so rather than guessing.
- Letters address the legal ground, never the carrier's motives.

## Related

Built on the same core as `redress-eval`, an evaluation harness submitted to the micro1 Frontier
Engineering Challenge. Separate repository, separate history.
