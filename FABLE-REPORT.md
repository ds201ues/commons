# Fable research + ranking (31 Aug 2026)

Source: [Fable ranking agent](21a05ad6-bd6f-4816-a794-0cd8a636c830) (`claude-fable-5-thinking-medium`).  
Advisory only — not locked until you confirm.

## Research findings that changed the rank

1. **Meta / propose–approve lane is crowded.** Example: a live competitor shipping staged-approve WebMCP patterns (e.g. WordPress WebMCP work). Chrome Labs already ships tool inspector + evals tooling — a Chrome DE judge may pattern-match **Legend** against “tooling we already know.”
2. **ChatGPT has a practical per-page tool budget** (~30 curated tools as a working shape). Favors **small, deep** tool surfaces over sprawling contracts.

## Task A — Suggested idea: **Swatch**

**One-liner:** Design-token workbench; agent may only touch tokens; page refuses contrast failures with math; human owns publish.

**Why (by criterion)**
- **Leverage:** `apply_token` can structurally fail (`contrast_fail`); repair loop is on-camera WebMCP.
- **Execution:** One page, few components, token table, contrast math — safest solo 2.5-day complete product.
- **Impact:** Real `tokens.json` artifact; audience designers/engs at Vercel/Shopify/Netlify-shaped companies.
- **Creativity:** Constraint-as-product (what the agent *cannot* do), unlike freeform showcase apps.

**Cut:** Button.tsx codegen, multiple themes, second constraint types, auth.  
**Honesty:** Don’t claim full WCAG/axe/Figma or “works on any site.”

**Why over Legend:** Legend’s story is better for the panel, but needs fixture + overlay + contract + play + export (four UI systems). Crowded meta lane. Swatch’s demo *is* the artifact; Legend’s export is stubs for a fixture (impact one step removed).

## Task B — Win-probability ranking

| # | Idea | C | L | E | I | Kill condition |
|---|---|---|---|---|---|---|
| 1 | **Swatch** | 4 | 5 | 5 | 4 | Preview looks bootstrap-cheap |
| 2 | **Legend** | 5 | 5 | 2 | 3 | No overlay→contract→play by end of Day 1 |
| 3 | **Holdfire** | 3 | 4 | 5 | 4 | Too many “stage/authorize” clones |
| 4 | **Palimpsest** | 5 | 2 | 5 | 2 | Can’t answer “what’s it for?” in one line |
| 5 | **Phosphor** | 4 | 4 | 3 | 2 | First 15s look like gen-art |
| 6 | **Countersign** | 2 | 3 | 5 | 4 | “Notes app with send” |
| 7 | **Ward Purse** | 3 | 4 | 4 | 3 | Boring pie dashboard |
| 8 | **Tombstone** | 4 | 4 | 2 | 3 | Map unfinished at video time |
| 9 | **Stoop** | 4 | 3 | 3 | 2 | Anyone says WanderNote |
| 10 | **Mise** | 4 | 3 | 3 | 2 | Drag jank |
| 11 | **Rehearsal** | 5 | 3 | 1 | 2 | Still on scrubber Day 2 |
| 12 | **Rumor Block** | 3 | 2 | 3 | 1 | Impact needs “imagine” |
| 13 | **Specimen** | 2 | 3 | 2 | 2 | “Does this work on my site?” |

## LOCK THIS (Fable): **Swatch**

**First 4 hours:** (1) Deploy empty Next→Vercel HTTPS, prove ChatGPT browser opens it (2) Register `get_tokens` readOnly, verify agent call (3) Token state machine + CSS-var preview (4) Contrast math + first structural refusal.

---

*Team prior lean was Legend. Fable reverses to Swatch on Execution risk + meta-lane crowding. Your user later rejected Swatch as not a real job. See second pass below.*

---

## Second pass — problem spaces, not win-odds ([Fable](3f2c5c78-9ac8-4196-b39b-fae351dc0f20))

Bar changed: “is this a problem today, not solvable by repo-edit?” Full merge in `PROBLEM-RESEARCH.md`.

**Rank:** (1) soft agent gates fail → page-owned deterministic authority (2) irreversibility ceremony (3) SOP/cross-origin (hard to demo in 2.5d) (4) commerce/blind actuation (real money, crowded/hollow).

**Suggest:** **Holdfire** re-founded — approval is **not a tool**; click mints a single-use token; planted injection in incident logs fails structurally. Do not quote Walmart 3× / Adobe conversion lift until first-party checked.

This pass **withdraws Swatch** as the lock recommendation under the new bar.
