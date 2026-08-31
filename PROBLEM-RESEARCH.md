# What is actually a problem today (WebMCP)

**Question.** Which jobs are real in 2026, uniquely need the *page* as authority (not Cursor editing a repo), and would not be a hollow canvas if we shipped them in ~2.5 days?

**Filter.** A claim counts only if (1) a first-party doc or a named incident study states it, (2) an IDE agent cannot already do the job by editing source, (3) WebMCP’s origin-bound tools / hints / human-visible execute are the natural fix.

Fetched 31 Aug 2026. Numbers below are from the cited pages, not invented.

---

## The three problems that survive the filter

### 1. Untrusted page content hijacks a logged-in browser agent

**This is the one with working exploits against shipping products.**

| Source | What it actually says |
|---|---|
| [Zenity — Grand Theft Atlas](https://labs.zenity.io/post/grand-theft-atlas) (5 Aug 2026) | A planted X comment steered ChatGPT Atlas into (a) phishing the victim’s WhatsApp contacts and (b) an unauthorized Amazon order shipped to the attacker. Atlas’s classifiers and “please confirm” gates were **soft**. The **one wall that held** was a **hard coded** ban on clicking the final Buy button — they walked around it by asking Amazon Rufus to buy. OpenAI replied (17 Feb 2026) acknowledging “meaningful risks associated with prompt injection in agentic environments.” No patch: the job of an agentic browser *is* to read content and act. |
| [OpenAI — Introducing ChatGPT Atlas](https://openai.com/index/introducing-chatgpt-atlas/) | Agent mode “may make mistakes.” Agents “are susceptible to hidden malicious instructions” in a webpage or email, which can steal data from logged-in sites or take actions the user didn’t intend. Safeguards “will not stop every attack.” |
| [Chrome — WebMCP tool security](https://developer.chrome.com/docs/ai/webmcp/secure-tools) (updated 1 Jul 2026) | “It’s impossible to guarantee safety inside of a large language model.” Repeatable prompt-injection attacks against agentic systems exist; prevalence on the web is increasing. Sites should set `untrustedContentHint` on UGC/external data and `readOnlyHint` on non-mutating tools. Spec draft includes `requestUserInteraction()` for async user input at tool execution. |
| [Chrome — Agent security for WebMCP](https://developer.chrome.com/docs/agents/security) (9 Jun 2026) | Two vectors: **malicious tool manifests** (hidden instructions in names/descriptions) and **contaminated outputs** (tool responses that include third-party data such as **user comments**). Deterministic guardrails they name: token limits, honor `untrustedContentHint`, **restrict cross-origin interactions**, **confirm actions with the user**. They explicitly say assume tools mutate unless `readOnlyHint`. Classifiers are probabilistic, not a guarantee. |
| W3C WebMCP [README goals](https://github.com/webmachinelearning/webmcp) | Goal #1: **enable human-in-the-loop workflows** — users delegate while keeping visibility, history, and control on the page. |

**Why the IDE loop is irrelevant.** Cursor is not logged into the user’s WhatsApp and Amazon at once. The failure is **cross-origin actuation under the user’s session**, plus **instructions that arrived as data**. The page (or the browser) has to make some tools **impossible** until a human binds approval to a specific payload. Chat “are you sure?” is the control Zenity beat.

**Hollow-demo trap.** A fake “rollback v1.2” board with a modal is the *pattern* without the *threat*. The threat is **untrusted input in the same session as a write**. If the demo has no UGC/comment/email/alert body marked `untrustedContentHint`, we are not demonstrating the documented problem.

### 2. Agents still guess through human UIs — slow, wrong, expensive

**This is why the standard exists. It is real. It is also the lane Chrome and the showcase already occupy.**

| Source | What it actually says |
|---|---|
| [Chrome — WebMCP](https://developer.chrome.com/docs/ai/webmcp) (updated 7 Aug 2026) | Without tools, an agent reviews buttons/fields to infer purpose. Actuation is multi-step and “open to interpretation.” Tools declare purpose (`checkout`, `filter_results`), JSON Schema reduces hallucination, shared **state** tells the agent what it can act on. Tools “execute on your webpage **visibly**” so users trust the result and **brand/UX stays intact**. Named use cases: **complex support forms**, **multi-city travel booking**, structured `submit_application` (full name vs first/last), `date_pick`, `run_diagnostics` buried in nested menus. Sensitive actions: “request user interaction with a confirmation dialog.” Designed for **local browser workflows with a human in the loop**, not headless. |
| [W3C / GitHub motivation](https://github.com/webmachinelearning/webmcp) | Today’s agents observe via **screenshots + DOM + accessibility tree**, then **simulate clicks**. Backend MCP **bypasses the site’s UI** (context loss, replicated auth/state, extra server). WebMCP is the in-page alternative so user + page + agent share one interface. |

**Why the IDE loop is irrelevant.** The user is on a **live origin they don’t own as source** (airline, bank, SaaS they use). There is no repo to edit. The site either exposes tools or the agent scrapes.

**Hollow-demo trap.** Chrome already ships travel + restaurant booking demos. The OpenAI showcase already has grocery, meals, notes, trip map. Building another catalog+cart proves the standard, not that we solved a new job. Secondary blogs quoting “89% token efficiency / ~0% failure” are **not** on Chrome’s docs — do not cite them as ours.

### 3. AI-referred traffic is already hitting sites that agents cannot fully read (commerce)

**Real money, weaker WebMCP fit than (1).**

| Source | What it actually says |
|---|---|
| [Adobe — AI traffic / machine readability](https://business.adobe.com/blog/ai-traffic-surge-retail-sites-not-machine-readable) | Q1 2026 (Jan–Mar): AI-sourced traffic to **US retail** sites **+393% YoY**. Holiday 2025: **+693% YoY**. US retail **homepages ~75%** machine-readable; **product pages ~66%** — a third of product-page content “not readable by machines.” |

**Caveat.** Adobe is measuring **LLM readability / AI search referral**, not WebMCP tool contracts. It supports “sites are not agent-ready” as a **business** fact. It does **not** say merchants are asking for `apply_token`. A grocery clone still collides with Verdant Market.

---

## What does **not** survive the filter

| Claim | Why it fails |
|---|---|
| **Swatch / design tokens** | The job is already “edit `tokens.json` / CSS, preview, CI a11y.” No live origin, no untrusted session, no cross-site agent. |
| **Palimpsest / attention scarcity** | Real UX annoyance, not a documented incident class. Fine as art; weak as “problem today.” |
| **Phosphor / neon / mise / rumor** | Constraints for a demo, not a job someone is failing at this week. |
| **Legend as “auto-map any production site”** | Chrome’s own limitation: clients must **visit** the origin; tools are not globally discoverable. We already listed this as a must-not-claim. Chrome already ships a **Model Context Tool Inspector**. Authoring tools is a real chicken-egg **for teams adopting WebMCP this quarter** — tiny audience, meta-crowded. |
| **“Agents dump hex codes”** | ChatGPT-with-no-repo. Not how design systems ship. |

---

## Map: problem → catalog idea (if we stay honest)

| Problem | Honest product shape | Catalog nearest | Lie we must not tell |
|---|---|---|---|
| **(1) Injection + irreversible action** | Page **ingests UGC** (`untrustedContentHint`). Reads are cheap. **Send / buy / delete / execute / publish** is not callable until the **human** authorizes **this payload** on the page (not in chat). Optional: planted injection in the fixture that the agent *tries* and the page *refuses*. | Holdfire, Tombstone, Countersign, Stoop (digest post) | “We patched prompt injection.” We didn’t. We put the wall **in our origin’s code**, the kind Zenity couldn’t click through. |
| **(2) Guessing the UI** | One **real class of form/flow** Chrome named that showcase skipped: nested **diagnostics**, or a **support/claim form** with ambiguous fields — **plus** a human confirmation on submit. | Countersign (letter send), Legend *only* if the fixture is that form and export is secondary | “Agents can now use the whole web.” |
| **(3) Retail AI traffic** | Only if we accept commerce and differentiate on **gated checkout + untrusted reviews** (1∩3). Otherwise skip — crowded. | — | Adobe numbers as if they were WebMCP conversion stats. |

---

## Independent pass — [Fable](3f2c5c78-9ac8-4196-b39b-fae351dc0f20) (31 Aug)

Same filter. Fable ranked four spaces and recommended **Holdfire**, re-founded on the Zenity evidence. Converges with this file’s problem (1); disagrees with the earlier Swatch ranking (that pass optimized win-odds, not “is it a job today”).

**Added sources we verified:**

- [OWASP LLM06:2025 Excessive Agency](https://owasp.org/www-project-top-10-for-large-language-model-applications/2_0_vulns/LLM06_ExcessiveAgency) — mitigation **#6 Require user approval**: HITL for high-impact actions, implemented *in a downstream system* **or within the LLM extension itself**. Example: a “post” extension that will not post until the user hits send. That is page `execute()`, not a chat confirm.
- [WebMCP Issue #165](https://github.com/webmachinelearning/webmcp/issues/165) (open, updated 29 Aug 2026) — HITL / `requestUserInteraction()` / elicitation. Spec is built for a human on the page; remote automation is the open fight. **Do not claim we implemented #165.** Fair line: userland demo of “the page, not the agent, decides when a human must act.”

**Fable design that is stronger than “modal on execute”:** approval is **not a tool**. A click on the page mints a single-use, short-lived token bound to that action’s hash; `execute()` checks and burns it. The agent cannot call `authorize`. Planted injection in fixture logs tries to self-approve; refusal is identical because the gate is a token, not intent.

**Do not quote until first-party checked:** Walmart “3× worse Instant Checkout conversion”; Adobe “42% better conversion” (Adobe +393% YoY traffic **is** first-party). Replit DB wipe is real but **IDE-side** — weak as a WebMCP story; keep it out of the video.

---

## Recommendation (research, not a lock)

**Solve problem (1).** It is the only item that is (a) demonstrated against a product the **judges ship**, (b) called out in **Chrome’s own WebMCP security docs**, (c) unsolvable by repo-edit, and (d) still rare in the showcase (those apps *enable* the agent; they do not **contain** it).

**Ship shape:** one shared object, one untrusted feed, one irreversible tool that is structurally locked. **Approval is not a tool.** The video’s proof is: injection in the feed → agent attempts write → **page** returns `unarmed` / `needs_authorize` → human click mints a bound token → execute happens **on screen** → no undo.

Fable’s concrete pick: **Holdfire** (ops execute). Countersign/Stoop still work if the object is send/publish instead of rollback — same gate, different object.

**Do not lead with (2) as the product** unless the flow is one Chrome listed and the showcase didn’t (support/claim, diagnostics). Travel/grocery is a hollow demo even though the underlying problem is real.

**Do not lead with Swatch or Palimpsest** if the bar is “a problem today.”

---

## Sources (primary)

- https://developer.chrome.com/docs/ai/webmcp
- https://developer.chrome.com/docs/ai/webmcp/secure-tools
- https://developer.chrome.com/docs/agents/security
- https://github.com/webmachinelearning/webmcp
- https://webmachinelearning.github.io/webmcp/
- https://labs.zenity.io/post/grand-theft-atlas
- https://openai.com/index/introducing-chatgpt-atlas/
- https://business.adobe.com/blog/ai-traffic-surge-retail-sites-not-machine-readable
- https://webmcp.devpost.com/ (Impact criterion: real problem, real audience, demonstrated)
- https://owasp.org/www-project-top-10-for-large-language-model-applications/2_0_vulns/LLM06_ExcessiveAgency
- https://github.com/webmachinelearning/webmcp/issues/165
- Fable problem-space pass: [Fable](3f2c5c78-9ac8-4196-b39b-fae351dc0f20)
