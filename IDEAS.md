# WebMCP idea brainstorm — full merge

Deadline: **3 Sep 2026 1:00pm PT** / **4 Sep 1:30am IST**.  
Showcase (from OpenAI collection screenshots, 31 Aug): **Sunday Table** (meals) · **Cubecade**
(puzzle) · **Paperie** (cards) · **Verdant Market** (grocery storefront) · **Codex Modeling Studio**
(3D) · **Margin Editor** (notes) · **Crossword Desk** · **Fieldwork // 12** (music) · **WanderNote**
(trip map) · **Webroom** (agent photo editing). Pattern: polished lifestyle/creative canvases —
not meta/devtools, not dual-control ops, not “forgetting” UIs.

Probes: [weird](d9354910-c8db-4516-925a-47743f5110b7) · [creative](f0c65d0f-de80-462f-907a-8a6afa3b531e) · [ops](91cf45f0-bc63-4270-9d3c-2b2910679464) · [devtools](cea525f9-c66e-42ff-8af7-f06efb9dbd64) · [social](8fbc5b19-cc4d-443c-a080-7852f4ba4abf)

---

## Catalog (all lanes)

| Idea | Lane | Shared object | Human-only beat |
|---|---|---|---|
| **Palimpsest** | weird | fading notebook | pin before text dies |
| **Rumor Block** | weird | rumor map | stamp out gossip |
| **Mise** | weird | kitchen counter | drag ingredients off-board |
| **Phosphor** | creative | neon sign | lock / hang sign |
| **Rehearsal** | creative | animatic timeline | picture-lock |
| **Holdfire** | ops | incident board | authorize execute |
| **Tombstone** | ops | erasure map | commit irreversible delete |
| **Legend** | meta | capability overlay | export tools |
| **Swatch** | meta | token + preview | publish tokens |
| **Ward Purse** | social | civic budget pie | publish budget |
| **Stoop** | social | blockface pins | post digest |
| Countersign | prior | decision letter | send |
| Specimen | prior | UI→code board | export code |

---

## Ranked shortlist (win odds × 3-day ship)

Scoring gut: Creativity / Leverage / Execution / Impact for **this** judge panel (Chrome, OpenAI browser, MCP-B, Next, Shopify, CF, Netlify).

### Tier A — pick one of these

| Rank | Idea | Why |
|---|---|---|
| **1** | **Legend** | Meta story judges respect; Play + gated `registerTool` export; secure-tools hygiene on camera; not a showcase clone |
| **2** | **Swatch** | Constraint is the product (tokens only + computed contrast); optional light codegen; engineers lean in |
| **3** | **Palimpsest** | Instant memorable demo (page goes blank); tiny surface area; human pin is load-bearing |
| **4** | **Holdfire** | Clearest dual-control ops story; fixture-easy; lower creativity than Legend/Swatch |
| **5** | **Phosphor** | Visual wow + failed `bend_tube` repair; watch toy-risk in first 15s of video |

### Tier B — strong but pick only if you love the vibe

| Idea | Note |
|---|---|
| **Ward Purse** | Civic lock→rebalance is clever; can look like a dashboard if pie is weak |
| **Stoop** | High creativity; medium risk of “tiny WanderNote” |
| **Tombstone** | Visceral; map UI costs a day vs Holdfire |
| **Rehearsal** | Highest creative novelty; timeline UI can eat the week |
| **Rumor Block** / **Mise** | Sticky Friday memories; easier to dismiss as toys |

### Tier C — keep as fallback only

| Idea | Note |
|---|---|
| **Countersign** | Already scoped; weaker “haven’t seen before” |
| **Specimen** | Overlaps Swatch/Legend; easy to overclaim “any site → code” |

---

## Recommendation

**Lock Legend** unless you strongly prefer a visceral toy (**Palimpsest**) or a design-system constraint (**Swatch**).

Do **not** build two. Withdraw Countersign from `SCOPE.md` only after you pick.

---

## Explainers (read this if the shortlist felt too abstract)

### Legend — “teach the agent your page”

**Problem today.** ChatGPT (or any browser agent) opens your web app and has to *guess*: which button saves, which field is the display name vs legal name, what “Archive” does. That’s slow and wrong. WebMCP fixes it **if someone defined tools**. Most apps haven’t. Legend is the product for **defining those tools together with an agent, on the real UI**.

**What you see on screen**
1. A small **fixture app** in the middle (e.g. a fake Settings page: Display name, Email, Save, Danger zone).
2. A **transparent overlay** — you can draw/select a region (“this strip is the save bar”).
3. A **contract table** on the side: tool name, description, inputs, side-effect class (`read` / `mutate` / `gated`), hints like `readOnlyHint`.
4. Buttons: **Play** (run the tools against the fixture so the page actually updates) and **Export** (download JS stubs) — Export needs **your** approval.

**Who does what**
- **You:** paint regions, edit tool names, reject bad proposals, Approve export.
- **Agent (via WebMCP):** proposes capabilities (`save_profile`, `get_settings`), fills JSON Schema, marks read vs mutate, calls Play, asks for export.

**Concrete story (demo)**
1. Open Legend. Fixture shows a profile form.
2. In ChatGPT: *“Map the tools an agent would need to update my display name safely.”*
3. Agent calls something like `propose_region` + `bind_capability` → overlay highlights the name field + Save; table gets `update_display_name` (mutate) and `get_profile` (read).
4. You change the tool name from `update_name` to `update_display_name` because “name” was ambiguous.
5. Agent `run_play` → the fixture’s display name changes to “Alex” live. You see it.
6. Agent tries `export_tools` → **fails**: needs approval.
7. You Approve → downloadable `tools.js` with `document.modelContext.registerTool({...})` and secure-tools hints.

**Real-world use case (after hackathon)**
- Product team preparing their SaaS for ChatGPT browser / Chrome agents.
- Not “scrape production.” You sit on a staging page and **author the agent contract**.

**What we must not claim**
- That it auto-discovers tools on arbitrary live production sites.
- That exported tools are production-safe without review.

---

### Swatch — “the agent may only change the design system”

**Problem today.** People ask ChatGPT to “make the UI nicer” and get random hex codes or a whole new layout. That’s dangerous: spacing, type, and color should stay in a **token system**, and contrast should be **measured**, not vibed.

**What you see on screen**
1. A **preview** of a few locked components (Button, Alert, Input) — you cannot rearrange the tree.
2. A **token table**: `--color-bg`, `--color-fg`, `--color-accent`, `--space-2`, `--font-size-body`, etc.
3. A **contrast panel** that computes WCAG ratios from the rendered preview (green/red).
4. Staged **diffs** when the agent proposes a change; **Publish** gated by you.

**Who does what**
- **You:** edit a token by hand, reject a proposal, Approve publish.
- **Agent:** `propose_token`, `run_contrast`, try `apply_token` (page **refuses** if contrast fails), `revert_token`.

**Concrete story (demo)**
1. Open Swatch. Preview looks fine; tokens listed.
2. ChatGPT: *“Make this feel more ‘midnight brand’ — darker background, brighter accent.”*
3. Agent proposes `--color-bg: #0b0f14`, `--color-accent: #5b8cff`. Preview updates as a **staged** look.
4. Contrast on body text goes **red**. Agent calls `apply_token` → error `{ error: "contrast_fail", ratio: 2.1, hint: "Lighten fg or darken less" }`.
5. Agent repairs with a lighter `--color-fg`. Contrast green. `apply_token` succeeds.
6. You tweak `--space-2` yourself from 8→10. Agent continues from new state.
7. `confirm_publish` before Approve fails; after Approve you download `tokens.json` (+ optional tiny `Button.tsx` that only uses those tokens).

**Real-world use case**
- Designer + agent co-tuning a design system under hard rules.
- Hackathon version of your “UI to code” idea: **tokens → code**, not “screenshot any site → full app.”

**What we must not claim**
- Full WCAG / axe / Figma replacement.
- That the agent “designed the product” — the components were locked on purpose.

---

### Palimpsest — “the notebook that forgets”

**Problem (emotional / collaboration).** Agents dump walls of text. Humans lose track of what mattered. Palimpsest makes **memory scarce**: if you don’t pin it, it’s gone.

**What you see on screen**
1. A blank shared page.
2. Lines the agent writes appear, then **fade over ~30 seconds**.
3. A **Pin** control only **you** can use (or a human-only tool the agent cannot call successfully).
4. Pinned lines stay; unpinned lines vanish for real (not in a hidden history for the demo).

**Who does what**
- **Agent:** `write`, `rewrite`, `ask_to_pin` (“please pin the deadline”).
- **You:** pin / unpin. If you ignore the ask, the line dies.

**Concrete story (demo)**
1. ChatGPT: *“Plan my Thursday WebMCP submit.”*
2. Agent writes five bullets. They start fading.
3. Agent: *“Pin the deadline line.”* Calls `ask_to_pin`.
4. You pin only **“Submit by 4 Sep 1:30am IST.”** Other bullets disappear.
5. Agent tries to rewrite a vanished bullet → has to recreate it; you choose again.

**Real-world use case**
- Teaching people (and agents) that **attention is the product**.
- Meeting scratchpad where only ratified notes survive.

**Tradeoff**
- Unforgettable demo; softer “business impact” than Legend/Holdfire.

---

### Holdfire — “nothing hits prod until you say so”

**Problem.** Agents are starting to suggest rollbacks, pages, scale-ups. On-call will not allow unattended execute.

**What you see:** An incident board (fixture): error spike, last deploy, buttons for staged actions. Agent fills a **pending** card. **Execute** stays locked until you authorize.

**Demo beat:** Agent stages “rollback to v1.2” → `execute_action` fails with `needs_authorize` → you Approve → board shows “rollback simulated.”

**Use case:** Two-key change control for ops. Fixtures only for the hackathon.

---

### Phosphor — “bend the neon together”

**Problem (playful).** Designing a physical neon sign has constraints (bend radius, transformer load). Chat can’t nudge glass; a canvas can.

**What you see:** A wall + glowing SVG letters. You drag a tube; agent changes copy/gas; `bend_tube` **fails** if radius too tight; `lock_sign` is your hang.

**Use case:** Memorable creative collab with **real failure modes** (not just “AI made art”).

---

### Countersign — “you own the send” (already scoped)

**What you see:** A letter draft + margin. Agent annotates/proposes; **Send** is gated.

**Use case:** Any consequential document (we seeded airline refusal). Solid, but closest in *shape* to Margin Editor + a gate — weaker novelty vs the showcase.

---

## From [social](8fbc5b19-cc4d-443c-a080-7852f4ba4abf) — done

### Ward Purse
Civic pie + project cards; padlocks force `rebalance`. Publish gated.

### Stoop
Six-building blockface; pins from fixture WhatsApp; you drag corrections; gated digest post.

---

## Prior lane notes (condensed)

See git history of this file for full tool tables from weird / creative / ops / meta probes.
