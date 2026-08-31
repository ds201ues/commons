# WebMCP idea brainstorm (in progress)

Deadline: **3 Sep 2026 1:00pm PT** / **4 Sep 1:30am IST**.  
Goal: lock one idea with strong novelty + finishable Execution.

Showcase already covers: 3D · margin notes · crossword · music · trip · meals/cart · cards · cube.

---

## From [weird seeds](d9354910-c8db-4516-925a-47743f5110b7) — done

All three: agent mutates **your** page; human has a move the agent cannot fake.

### Palimpsest
Shared notebook that **forgets**. Agent text fades (~30s) unless you pin.  
Tools: `write`, `rewrite`, `ask_to_pin` · Human-only: `pin` / `unpin`.  
**Remember Friday:** page going blank while the agent begs to save one line.

### Rumor Block
4×4 neighborhood map. Ungated rumors **bleed** to adjacent lots each tick.  
Agent: `plant_rumor`, `tick` · Human-only: `stamp_out` (+ optional corroborate).  
**Remember Friday:** block goes black because nobody stamped the first lie.

### Mise
Kitchen **counter** is the recipe (no recipe text). Agent places objects; you drag off-board to sabotage; agent adapts or fails with repair hint.  
Tools: `place`, `advance_step`, `set_timer`.  
**Remember Friday:** ChatGPT restages dinner while you throw the onion away.

---

## From [creative](f0c65d0f-de80-462f-907a-8a6afa3b531e) — done

### Phosphor
Live **neon sign shop**. You drag glass; agent holds copy/gas/physics.  
Tools: `set_legend`, `set_gas`, `bend_tube` (fails &lt;4cm radius), `set_transformer` (VA overload), `night_preview`, `lock_sign` (human gate).  
**Demo money:** failed bend → repair; don’t only “AI wrote OPEN LATE.”  
MVP: SVG glow, 8-letter max, 3 gases — no WebGL.

### Rehearsal
Paper-cutout **animatic** + 8s timeline. Agent poses/beats; you scrub and hand-key.  
Tools: `cast_puppet`, `set_pose`, `add_beat`, `set_camera`, `play`, `picture_lock` (human gate).  
**Novel vs Fieldwork/Cubecade:** picture-lock on **time**, not audio grid or puzzle.  
MVP: 4 puppets × 4 joints, 8s @ 8fps, flipbook if CSS jank. Timeline UI is the schedule risk.

Lane note: pick **one** of Phosphor / Rehearsal — not both.

---

## From [ops](91cf45f0-bc63-4270-9d3c-2b2910679464) — done

Stage → authorize → gated commit (same beat as Countersign, different object).

### Holdfire
Incident board: agent stages rollback/page; **`execute_action` gated**.  
Tools: `get_incident`, `list_signals`, `simulate_change`, `stage_action`, `request_authorize`, `execute_action`.  
Buildability ~8 with fixtures. **Kill if** real Datadog/PagerDuty wiring starts.

### Tombstone
Erasure map: agent finds copies of a synthetic person; **`commit_erasure` irreversible + gated**.  
Legal-hold as structured blocker. Buildability ~7. **Kill if** real PII/connectors.

Lane note: Holdfire = safer Execution; Tombstone = more visceral. Not both.

---

## From [devtools](cea525f9-c66e-42ff-8af7-f06efb9dbd64) — done

Aimed at Chrome / MCP-B / OpenAI browser / Next judges.

### Legend
Co-author a **capability map** on a live fixture UI → Play tools → gated export of `registerTool` stubs (+ secure-tools hints).  
Tools: `get_page_map`, `propose_region`, `bind_capability`, `set_side_effect`, `run_play`, `export_tools` (gated).  
**Do not claim:** infers tools from arbitrary production sites.

### Swatch
Component tree **locked**; agent may only change **design tokens**. Contrast is **computed** (not LLM-judged); `apply_token` refuses on fail; publish gated.  
Optional small codegen blob = UI→code beat without a full Specimen studio.  
**Do not claim:** Figma/axe replacement.

---

## Still cooking

| Lane | Agent |
|---|---|
| Social / local / education | [social](8fbc5b19-cc4d-443c-a080-7852f4ba4abf) |

Plus earlier seeds: Specimen · Countersign · A11y Pair · Brainstorm board.

---

## Not locked yet

Do not change `SCOPE.md` until a full merge + your pick.
