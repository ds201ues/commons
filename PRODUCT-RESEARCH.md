# PRODUCT-RESEARCH — 4 products, daily-repeat first (31 Aug 2026)

Independent research pass per `BRIEF.md` §5. No vetoed ideas revived (checked each candidate
against §6). No code. Every frequency claim carries a source or is marked **unsourced** /
**unknown**. Fetched 31 Aug 2026.

**Tags present:** A = Trade Floor · B = Parley · A+B = Problem Set, Matchfit. Requirement met.

**Day-one flag (all four):** every demo uses **two ChatGPT sessions on one origin** (two tabs,
two seat URLs). That is the contest's own direction ("any WebMCP agent is a client"), but say it
on camera so it reads as intent, not luck.

**Cross-cutting evidence worth knowing before reading:** OpenAI published *Learning Never Stops*
(26 Aug 2026): **460M+ classwork/homework messages per week in the US** at school-year peak
(180M+ even in summer), **70M self-testing conversations/week** globally, Sunday-evening peak.
That is the single strongest "they are already in ChatGPT for this job" artifact available, and
it is first-party from the contest sponsor. (via claypier/insideai.news summaries of the OpenAI
report — numbers as reported there.)

---

## 1. Problem Set — *the nightly homework room* — **A+B** — **PRIMARY**

**One sentence.** A shared page holding tonight's problem set, the student's visible attempts and
stuck flags, and a mastery strip — worked live by the student, their own ChatGPT agent, and a
tutor whose agent sees a different tool surface.

**Target user.** 16–24 student in a problem-solving course (algebra → physics → stats → intro
coding) who already takes homework to ChatGPT nightly. Second seat: a paid tutor, TA, older
sibling, or parent. (Deliberately not a minor-data product: college/adult framing, synthetic
demo content.)

**Repeat/day: 1–3 sessions on school nights (inference; per-user sessions not published).**
Basis: OpenAI's own report shows homework volume is a *nightly* behavior at population scale
(460M+ msgs/week US, Sunday-evening peak). Closest apps with published usage: **Duolingo 58.7M
DAU** (Q2 FY26 shareholder letter, SEC) at ~1.85 sessions/user/day *(secondary: udonis)*; **Khan
Academy ~14 min/day** and **IXL ~34 min/day** among US children, Quizlet ~10 min/day, 60M MAU
(Statista 2024 via electroiq; technotrenz — secondary). The category clears the daily bar;
the per-user session count for ChatGPT-homework specifically is **unknown** — say so.

**Why they are already in ChatGPT.** 66% of students name ChatGPT as their AI tool (Digital
Education Council / HEPI 2025, via programs.com); OpenAI shipped Study Mode and teen homework
guardrails precisely because this traffic exists. The paste-a-problem / photograph-the-worksheet
workflow is the incumbent.

**Why the other person opens the link.** The tutor is paid (or owes a sibling a favor), and the
link answers the only question they have — *where exactly is she stuck* — without a screenshot
exchange. Stuck flags and attempts are visible on the page; the tutor's agent can act on them
immediately. This is not a Split-style "please enter data into my app" ask: the state already
exists because the student generated it for their own loop.

**What they do today.** Photo of worksheet → ChatGPT (answer, no record the tutor ever sees);
"I don't get #4" over text; tutor reconstructs context from scratch each session. State lives in
chat scrollback nobody reopens.

**Why WebMCP is necessary.**
- *vs shared HTML:* no per-seat authority. The entire product is that the student's agent has
  `submit_attempt`, `request_hint`, `flag_stuck` and the tutor's agent has `assign_problem`,
  `write_hint_on_flag`, `unlock_next_set` — and **neither** has `reveal_solution`, which is a
  human button, not a tool. Without `registerTool`-per-seat this is a wiki.
- *vs remote MCP:* a server-side tutor agent acts on state neither human is looking at — hidden
  memory, forbidden by our own rule. The page is the only memory: attempts, flags, mastery, all
  visible, reload-safe.
- *vs Study Mode alone:* Study Mode is one student, one agent, no second seat, no durable shared
  state across days. We are the surface Study Mode conversations deserve.

**90-second demo.**
1. Student opens room URL: tonight's 5 problems, mastery strip, yesterday's attempts visible.
2. *"Walk me through #2, don't solve it."* Student's ChatGPT agent calls `request_hint` → hint
   materializes on card #2, attributed.
3. `submit_attempt` → wrong, red on the page. Student hits **flag stuck**.
4. Cut to second tab: tutor seat URL. Tool list visibly different (no `submit_attempt`). Tutor:
   *"nudge her on #2, no answers"* → tutor's agent writes a hint onto the flag; patch appears
   live on the student's screen, attributed to the tutor's agent.
5. Student solves #2. Their agent tries `reveal_solution` for #3 → **tool not registered**;
   student clicks the button herself. Mastery strip moves.
6. Tutor's agent calls `assign_problem` ×3 for tomorrow. Close on the page: everything that
   happened is what is shown.

**2.5-day cut list.** One fixture course (~15 hand-written algebra word problems); deterministic
answer checking (no LLM judge); no accounts — role in URL (`/seat/student`, `/seat/tutor`); SSE
or poll; paste text only (no image upload); mastery = visible per-problem state, no algorithm
claims. **Risk: 2/5.** Main risk is "Study Mode does this" — rebutted on camera by the second
seat + durable page, or this dies.

**Kill criteria.** (a) Tutor seat never gets opened in rehearsal — then it's a B-only flashcard
clone. (b) The hint/answer loop is the whole product — that is Study Mode, we added nothing.
(c) Needs a classroom of 30 to look real — it must work for one student + one tutor.

---

## 2. Matchfit — *the coach–athlete training room* — **A+B**

**One sentence.** One page holding this week's training plan, the athlete's morning readiness
check and live session log — where the athlete's agent and the coach's agent have structurally
different powers, and publishing the week is the coach's human click.

**Target user.** Coached amateur endurance/strength athlete (marathon, HYROX, powerlifting)
paying $100–300/month for remote coaching *(market-rate claim **unsourced** — directionally
consistent with TrainingPeaks pricing below)*. Second seat: the coach, who runs 10–30 of these
rooms.

**Repeat/day: athlete 1–3 on training days, 5–6 days/week (inference).** Morning 60-second
readiness, in-session logging, post-session note. Basis: **Strava ~4B activities in 2025 ≈ 11M
uploads/day, 51M/week** (Business of Apps; Strava Year in Sport); **Hevy claims 16M+ athletes**
logging set-by-set (hevyapp.com, first-party marketing); median logged workout 53 min (SQMagazine
summary of Strava data — secondary). Coach-side daily review habit: **unknown** — but coaches
already pay for two-seat infrastructure: TrainingPeaks coach plans **$21.99–54.99/mo + ~$9 per
athlete/month** (TrainingPeaks help center, first-party). Online coaching market **$3.8B (2025)**
per Dataintelo — *secondary market research, do not quote as fact in the video.*

**Why they are already in ChatGPT.** Athletes paste workouts, splits, and "my calf is tight,
adjust my week" into chat today *(behavioral claim, **unsourced** — but Strava's own Runna and
Breakaway acquisitions in 2025 (Sacra) show the training-plan-plus-AI layer is where the money
is moving)*. Chat has no plan object; the advice evaporates.

**Why the other person opens the link.** It is literally the coach's job, and the room replaces
the current mess: TrainingPeaks has **no real-time messaging** (Coachbox 2026 review), so
coaching happens across WhatsApp voice notes + spreadsheet plans + app comments. The link *is*
the athlete's current state — amber readiness strip, yesterday's logged sets — not a request for
the coach to enter anything.

**What they do today.** TrainingPeaks/Final Surge for the plan; WhatsApp for "how are you
feeling"; the two never reconcile.

**Why WebMCP is necessary.**
- Per-seat tools are the product: athlete's agent gets `log_readiness`, `log_set`, `report_pain`;
  coach's agent gets `swap_exercise`, `adjust_load`, `annotate`. The coach's agent **cannot** log
  readiness for the athlete; the athlete's agent cannot rewrite the plan. `publish_week` is a
  human button on the coach's seat, not a tool.
- Two agents, one origin, **attributed patches**: "coach's agent cut Thursday to 6×800" is a
  visible, signed edit — the audit trail a paid coach needs.
- *vs remote MCP:* coach-side agent acting on server state the athlete can't see violates
  artifact-as-memory and is precisely how you get an athlete injured by a plan they never saw.

**90-second demo.**
1. Morning: athlete tells their ChatGPT *"slept 5 hours, right calf tight"* → `log_readiness`,
   readiness strip goes amber on the page.
2. Coach's tab (own agent, coach seat): roster card turned amber. *"Keep the stimulus, cut the
   impact."* Agent calls `swap_exercise` + `adjust_load`: Thursday intervals → easy 30 + strides.
   Patch lands live on the athlete's screen, attributed.
3. Evening: athlete logs sets through their agent mid-workout; coach's agent `annotate`s the top
   set. Both humans watch the same page change.
4. Friday: coach's agent attempts `publish_week` → **not a registered tool**. Coach clicks it.
   Week locks visibly.

**2.5-day cut list.** One fixture week, one athlete + one coach; no wearable sync (talk/paste
only — rule 3 compliant); **wellness data only** (sleep, soreness, RPE) with page copy stating
no medical use; no diagnosis, no medication anything (rule 11 boundary held explicitly).
**Risk: 3/5** — PHI-*adjacent perception* if the demo drifts toward injury-rehab language, and a
narrower judge-audience than education.

**Kill criteria.** (a) The 60-second morning check needs wearable auto-fill to survive — that is
Split's manual-entry killer wearing a Garmin. (b) It collapses to "chat next to a calendar" —
WhatsApp already owns that. (c) The demo needs injury/medical stakes to feel real — then it's
Care Relay's ghost, kill on sight.

---

## 3. Trade Floor — *the two-manager fantasy negotiation table* — **A** — **BACKUP**

**One sentence.** A live offer card two fantasy managers and their two agents negotiate on —
propose, counter, sweeten, all attributed patches — where **Accept is two human clicks and never
a tool**.

**Target user.** Season-long fantasy football manager in a 10–14 person league, 25–44, on
Sleeper/ESPN/Yahoo. Both seats are the same role; tools differ by *side*, not by permission tier.

**Repeat/day: league engagement daily; trade-object frequency unknown — be honest.** Published:
**Sleeper ~14 min/day per user** and 33% of fantasy-football MAU (Sensor Tower Aug 2025, via
sqmagazine); historically **2M DAU** (Expa founder interview); fantasy football MAU **+40%
2023→2025**. That is platform-level, not negotiation-level: trades cluster around bye weeks and
deadlines. **The room must also hold lineup/waiver state or it fails rule 1 in the off-weeks.**
Timing note: the 3 Sep deadline is **NFL kickoff week** — peak fantasy attention, ideal demo
resonance.

**Why they are already in ChatGPT.** This is the rare candidate with a *demand artifact*:
**League Loom** exists solely to pipe live Sleeper/ESPN/Fantrax rosters into ChatGPT/Claude via
MCP for trade grades and lineup checks; **FantasyPros Coach AI** sells the same job. People are
already paying to drag their roster into chat. What none of them have is the *shared* surface —
analysis is one-sided, the negotiation still happens in league chat.

**Why the other person opens the link.** Because the offer is *there* — live, current, with a
Counter affordance — instead of buried under 40 messages of league trash talk. "Send me the
offer in writing" is already the norm; this is the writing.

**What they do today.** Sleeper's native trade flow + league-chat DMs + screenshots + a trade
analyzer open in another tab. The state of the negotiation exists nowhere.

**Why WebMCP is necessary.**
- Two humans, two agents, one origin. Each side's agent gets `propose`, `counter`, `add_player`,
  `attach_note`; **neither** gets `accept` — Accept is one human click per seat. The negotiation
  tree on the page is attributed: you can see which patches came from the human and which from
  their agent.
- *vs League Loom-style remote MCP:* it gives each manager private analysis (we do not compete
  with that — the human pastes their agent's verdict), but there is no shared visible state
  between the two agents. That gap is the product.
- *vs shared HTML:* without seat-bound tools, anyone's agent can edit either side of the offer.
  Unusable.

**90-second demo.**
1. Two ChatGPT tabs, two seat URLs. Manager A: *"I need a WR — offer Higgins plus my second for
   Jefferson, don't embarrass me."* A's agent proposes on the page.
2. Manager B's tab: B's agent evaluates against B's pasted roster, `counter`s: Jefferson +
   Addison for Higgins + Pollard. Patch appears on both screens, attributed.
3. A asks their agent "is this fair?" (analysis in chat, not on the page), then edits the note
   by hand — humans type too.
4. Both agents attempt `accept` → **tool not registered**, both seats. Both humans click Accept.
   League log entry written visibly.

**2.5-day cut list.** Fixture player pool + static valuation table; **no real league API**
(paste rosters — rule 3); one room, two seats + optional spectator link; no money, no dynasty
pick math. **Risk: 4/5** — the daily-bar honesty above, plus toy-adjacency risk if the demo
leans on banter instead of the negotiation tree.

**Kill criteria.** (a) Trades per manager per season are ~2 — then this is a weekly object and
fails rule 1 unless lineup/waiver state carries daily opens; test with one real league's history
before locking. (b) "League Loom + chat already does it" survives an honest head-to-head — i.e.
demand is analysis-only, not negotiation-surface. (c) Judges read it as Crossword Desk 2 — if
WebMCP isn't visibly load-bearing in the first 30 seconds, it's a toy with extra steps.

---

## 4. Parley — *the language table you work daily with your agent* — **B**

**One sentence.** A page holding your visible mastery map, today's drill state, and your error
log — your ChatGPT agent runs spoken/typed drills through page tools all week, and a practice
partner can drop into a second seat with different tools.

**Target user.** Adult self-directed language learner, 18–35, the Duolingo-streak type who wants
conversation practice and already talks to ChatGPT voice.

**Repeat/day: 1–2 sessions, 10–20 min — best daily evidence of the four.** **Duolingo 58.7M DAU**
(Q2 FY26, SEC-filed shareholder letter), DAU/MAU ~35–42% rising (Q4 FY24 letter), **~1.85
sessions/user/day and ~9.6 min/session** *(secondary: udonis)*, 10M+ users with year-long
streaks. The daily language-practice habit is the most proven daily loop in consumer software.

**Why they are already in ChatGPT.** Voice-mode conversation practice is a known ChatGPT
behavior *(specific volume **unsourced**)*; OpenAI's report shows **70M self-testing
conversations/week**, 51% requesting more practice — the same loop.

**Why share (required for the B demo).** A friend, partner, or italki-style tutor joins the
second seat: their agent gets `prompt_duo` and `react`, never `score_attempt`. Optional in daily
life, real when it happens — language is social or it's flashcards.

**What they do today.** Duolingo (closed system, no BYO agent); ChatGPT voice (state evaporates
when the session ends — nothing persists to be tomorrow's memory); a tutor weekly.

**Why WebMCP is necessary.**
- The page is the only memory, and here that rule *bites*: mastery map, drill state, and error
  log are visible and reload-safe. A server-side SRS agent would be exactly the hidden-memory
  architecture we forbid ourselves.
- Tools: learner's agent gets `present_card`, `score_attempt`, `reschedule`; partner's agent
  gets `prompt_duo`, `react`. `retire_card` (mark mastered) is the human's button — the agent
  can drill you forever but can't declare you done.
- *vs plain shared HTML:* the drill is an interaction, not a document — without registered tools
  the agent is back to guessing at buttons, per Chrome's own motivation doc.

**90-second demo.**
1. Learner opens Parley: mastery map (past tense amber), today's queue, streak. *"Ten minutes,
   past tense, hard ones first."* Agent `present_card`s; learner types; `score_attempt` marks the
   page; the error log grows visibly.
2. Mid-session, partner opens the link: different tool list on camera. Their agent `prompt_duo`s
   a two-line exchange; both humans answer.
3. Learner clicks **Mastered** on a card — the agent tried a beat earlier and failed.
4. Tomorrow's queue reshuffles on the page. Close on the streak.

**2.5-day cut list.** One language pair, one tense fixture, ~40 hand-written cards; typed
attempts (no ASR); Leitner scheduling visible on the page (no algorithm mystique); synthetic
partner persona allowed. **Risk: 3/5** — the standing question is "why isn't this Duolingo plus
voice chat," and the answer (durable visible state + a real second seat + BYO agent) has to land
in the demo or it doesn't exist.

**Kill criteria.** (a) Remove the agent and the product is unchanged → it's a flashcard site.
(b) Users refuse typed target-language attempts (talk-only demand) → scope dies on Vercel Hobby.
(c) The second seat is never opened, even in rehearsal → B-only, and Duolingo owns B.

---

## Ranking (daily-repeat × real demand × WebMCP necessity × 2.5-day ship × not-a-clone)

| # | Product | Tag | Daily bar | Demand artifact | WebMCP necessity | Ship risk | Verdict |
|---|---|---|---|---|---|---|---|
| **1** | **Problem Set** | A+B | OpenAI's own 460M/week report — judge-proof source | 66% of students; Study Mode exists *because* of this traffic | Per-seat tools + human-only reveal + durable shared page | 2/5 | **Primary** |
| **2** | **Matchfit** | A+B | Strava 11M uploads/day; Hevy 16M loggers | Coaches already pay $/athlete for two-seat infra | Seat-split tools + attributed patches + publish gate | 3/5 | Strong, narrower resonance |
| **3** | **Trade Floor** | A | Platform daily (14 min/day); object bursty — **flagged** | League Loom / FantasyPros Coach AI prove the job | Two-agent negotiation can't exist without seat tools | 4/5 | Creativity peak; daily-bar caveat |
| **4** | **Parley** | B | Best-in-class: 58.7M DAU, ~1.85 sessions/day *(2°)* | Duolingo's whole business | Weakest: Duolingo works without WebMCP | 3/5 | Safest frequency, weakest wedge |

### Pick

- **Primary: Problem Set (A+B).** Only candidate whose frequency evidence is a *first-party
  OpenAI report published five days ago* — the judges' own employer documented the demand. Clean
  A+B shape: the student's nightly loop stands alone (B), the tutor seat is real and paid (A),
  and the demo fails with one tab *if you show the tutor beat*. Ship risk lowest of the four.
- **Backup: Trade Floor (A) — different tag, as required.** If Problem Set dies on "Study Mode
  already does this," Trade Floor is maximally far from that failure mode, its timing is NFL
  kickoff week, and League Loom is a standing existence proof of demand. Carry Parley (B) as the
  documented fallback if Trade Floor dies on the daily-bar question — its frequency evidence is
  the safest of the set.

### Claims to never quote as fact (unsourced / secondary)

- Online coaching market $3.8B (Dataintelo — secondary market research).
- Duolingo 1.85 sessions/day, 9.58 min/session (udonis — secondary; DAU itself is SEC-filed).
- "Athletes paste workouts into ChatGPT" / "learners practice via ChatGPT voice" — behavioral
  claims, plausible, **unsourced**.
- Trades-per-manager frequency — **unknown**, flagged in §3 kill criteria.
- Coach daily review habit — **unknown**.

## Sources (fetched 31 Aug 2026)

- OpenAI *Learning Never Stops* report (26 Aug 2026) via claypier.com and insideai.news summaries
- Duolingo Q2 FY26 shareholder letter (SEC) + Q3 FY25 / Q4 FY24 letters
- Business of Apps — Strava statistics 2026; Strava Year in Sport 2025; Sacra Strava profile
- SQMagazine fantasy sports 2026 (Sensor Tower Aug 2025: Sleeper 14 min/day, MAU shares)
- Expa founder spotlight — Sleeper 2M DAU; yespress.io Sleeper profile
- TrainingPeaks help center (coach pricing); Coachbox TrainingPeaks review 2026 (no real-time messaging)
- hevyapp.com (16M athletes claim)
- Statista/electroiq — US children's daily learning-app minutes (IXL 34, Khan 14, Quizlet 10)
- programs.com / demandsage — student AI usage (HEPI/DEC surveys)
- leagueloom.com; fantasypros.com Coach AI 2026 guide; leaguelogs.com
- Shiftboard State of the Hourly Worker (checked for a shift-swap candidate — rejected: swaps are
  ~10–15% of weekly *shifts* system-wide, far under 1/day per user. Fails rule 1.)
- Co-parenting apps (OurFamilyWizard/TalkingParents) checked for a household-coordination
  candidate — rejected: no published frequency data, court-ordered captive users, and
  minor-data adjacency against rule 11.
