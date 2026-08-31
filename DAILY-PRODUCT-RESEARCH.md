# Four daily WebMCP products — independent research pass

**Date:** 31 Aug 2026  
**Mandate:** exactly four products; no implementation; veto list respected.

## Bottom line

The strongest opportunity is not “another shared board.” It is a small, visible
**coordination boundary between people whose agents are already producing work faster than
humans can align on it**. Atlassian's 2026 survey says 87% of knowledge workers lack time or
capacity to coordinate, and explicitly names reviews, sign-offs, and alignment decisions as
the lagging work. That is unusually direct evidence for the brief's page-as-shared-memory
thesis.

There is no credible public sessions-per-user-per-day figure for any of the exact jobs below.
That absence matters. Ticket volume, message volume, and DAU are not sessions. Every frequency
estimate below is therefore marked **unknown** unless a source actually reports sessions.

## Rank

1. **Decision Window (A+B)** — best contest bet: strongest evidence, clean two-agent demo,
   daily solo utility, and a human-only decision gate.
2. **Mastery Map (B)** — best backup: ChatGPT demand is proven and the artifact can be useful
   without a second person, but WebMCP is less exclusive.
3. **Exception Desk (A)** — a real frequent workflow with excellent role asymmetry, but
   Intercom now validates and occupies much of the same problem.
4. **Today Relay (A+B)** — household coordination is real; repeated use and link adoption are
   not proven. Do not build without a five-household smoke test.

**Primary:** Decision Window (**A+B**).  
**Backup:** Mastery Map (**B**, deliberately a different tag).

---

## 1. Decision Window

**One sentence.** A live queue where a maker and a decider turn agent-produced options into
explicit, human-owned decisions without losing the current question, evidence, dissent, or
owner.

**Tag:** **A+B**

**Target user.** A product/operations lead and one manager or cross-functional counterpart in
a small AI-heavy team. This is not a company project tracker; it holds only decisions blocking
today's work.

**Repeat/day:** **unknown.** No first-party source found for decisions or decision-room sessions
per worker per day. Adjacent evidence is strong but not a frequency measure:

- Atlassian's 2026 State of Teams survey (12,035 knowledge workers, 173 Fortune 1000 executives)
  says **87%** lack time or capacity to coordinate and specifically says reviews, sign-offs, and
  alignment decisions cannot keep up with AI-produced work.
- Microsoft reports the top 20% of Microsoft 365 users by ping volume receive **275** meetings,
  emails, or chats per 24-hour day, with a ping every two minutes during an eight-hour workday.
  This proves interruption volume, **not decision sessions**.
- Slack reports **700M messages daily** (FY25 internal data), again not per-user sessions.

**Why they are already in ChatGPT.** OpenAI says writing and communication remain the most
common enterprise uses. Its 2025 enterprise report says structured workflows grew 19×
year-to-date and workers report saving 40–60 minutes daily. STADLER reports more than 85% daily
active usage with employees engaging multiple times daily for drafting, research, structured
thinking, and decision support. These are vendor case-study claims, but they directly fit the
target user's behavior.

**Why the other person opens the link.** A named decision is blocking work and only that person
can decide it. The link opens directly to a bounded question with options, evidence, unresolved
objections, and a human **Choose** control. It does not ask them to adopt a project-management
system or reconstruct a Slack thread.

**What they do today.** Slack/Teams thread → ad hoc call → document → thread again. Atlassian
found 71% of surveyed knowledge workers said a meeting was the only way to get colleagues to
make group decisions, while 24% said meetings were not the most effective way to do it. In a
separate page-led-meeting study, 77% frequently attended meetings that ended by scheduling a
follow-up and 54% frequently left without clear next steps or ownership.

**Why WebMCP is necessary.**

- Maker seat tools: `propose_option`, `attach_evidence`, `state_recommendation`, `revise_option`.
- Decider seat tools: `challenge_assumption`, `request_evidence`, `compare_options`,
  `record_constraint`. The maker's browser never registers those tools.
- **Choose / defer / reopen is a human page control, not a tool.**
- Shared HTML alone makes humans type and agents scrape. A remote MCP server duplicates auth and
  state outside the page and hides the exact state the human is approving. Here the visible card
  is both memory and authority; every agent patch appears on it with seat attribution.

**90-second demo.**

1. **0–15s:** Maker pastes one blocking question: “Ship onboarding with manual review Friday, or
   delay one week for automation?” The room visibly has no hidden context.
2. **15–35s:** ChatGPT in the maker tab calls maker tools, adding two options, recommendation,
   evidence, and one explicit assumption.
3. **35–55s:** Open the decider URL in a second ChatGPT session. Its tool list is visibly
   different; it cannot rewrite the maker's recommendation. It adds a constraint and challenges
   the assumption.
4. **55–72s:** Maker agent revises one option on the shared page; both seats see the attributed
   patch after polling.
5. **72–85s:** Decider's agent tries to choose and cannot: no such tool exists. Human clicks
   **Choose option B**.
6. **85–90s:** Reopen the URL: the full visible rationale and dissent persist.

**2.5-day cut list.**

- One room type, one active decision, maximum three options.
- Fixed role URLs; no accounts, OAuth, organizations, comments, notifications, or integrations.
- Polling, not WebSockets/CRDT.
- Plain text evidence with optional URL; no file ingest or hidden retrieval.
- Six tools total; human-only choose/defer/reopen.
- Seeded demo room plus an empty room.

**Risk:** **3/5.** Technically small; product risk is that the natural home remains Slack plus a
doc, and the demo must make two independent agents—not the card UI—the undeniable advantage.

**Kill criteria.**

- In five interviews with AI-heavy two-person work pairs, fewer than three can name **two or more
  blocking decisions from the previous workday**.
- A linked decision gets handled in the original chat thread rather than opened by the decider
  in more than two of five tests.
- A single ChatGPT-generated memo plus a human reply captures the same value; if so, WebMCP is
  ornamental.

---

## 2. Mastery Map

**One sentence.** A visible concept map that a learner and their ChatGPT update across study
bursts, separating “seen,” “can explain,” and “can solve cold,” with an optional tutor review
link.

**Tag:** **B**

**Target user.** An adult learner or college student preparing for one exam or certification.
No minors, classroom records, grades, or institutional data.

**Repeat/day:** **unknown.** OpenAI reports that learning/upskilling is **20% of US ChatGPT
messages**; for US users aged 18–24, just over one-quarter of messages concern learning,
tutoring, or schoolwork. Duolingo reported **52.7M DAU** in Q4 2025, but neither source reports
sessions per active user per day. Quizlet says one million users use Learn each day, also without
sessions/user. A third-party app benchmark places Education & Knowledge at 2.76 median daily
sessions per active user, but it is not an incumbent-specific first-party figure and should not
appear in submission copy.

**Why they are already in ChatGPT.** This is the best-evidenced candidate on that question:
OpenAI says learning is its largest US message category, and more than one-third of US
college-aged adults use ChatGPT. Learners already ask for explanations, practice questions,
summaries, and feedback.

**Why another person opens the link.** Not required for daily value. In the demo, a tutor or
study partner opens it because the learner asks, “Which two amber concepts should we spend our
30 minutes on?” The page shows the learner's self-assessment and evidence, not their private chat.

**What they do today.** Repeated ChatGPT threads, flashcards, notes, and a syllabus. ChatGPT knows
the current conversation; Quizlet knows cards; neither is a small, vendor-neutral, visible claim
about what the learner can do **today**. This differentiation is a hypothesis, not measured
demand.

**Why WebMCP is necessary.**

- Learner tools: `add_concept`, `link_prerequisite`, `record_attempt`, `attach_explanation`,
  `flag_confusion`.
- Reviewer tools on the share URL: `challenge_mastery`, `add_probe`, `suggest_next_concept`;
  the reviewer cannot mark mastery or remove attempts.
- **Mark “can solve cold” is a human control** after an on-page attempt; the teaching agent cannot
  award its own success.
- Shared HTML has no reliable structured write path for ChatGPT. Remote MCP can store a graph,
  but then the human cannot see the exact state being updated and approved. The page gives the
  learner, tutor, and any WebMCP agent the same inspectable memory.

**90-second demo.**

1. **0–15s:** Open a persisted three-concept map for an adult statistics exam.
2. **15–35s:** Ask ChatGPT to teach from the visible weak spots. It reads the map and adds one
   prerequisite plus a probe, not a generic lesson.
3. **35–55s:** Learner answers on the page; agent records the attempt and flags the precise
   misconception. The prior attempt remains visible.
4. **55–70s:** Open reviewer URL in a second ChatGPT session. Reviewer can add a harder probe but
   cannot mark mastery.
5. **70–83s:** Learner solves it; human clicks **Can solve cold**.
6. **83–90s:** Reload shows the updated map as the complete memory—no transcript or hidden RAG.

**2.5-day cut list.**

- One map, maximum twelve concepts, simple columns/edges rather than a freeform canvas.
- Text-only attempts; no uploads, gradebook, LMS, spaced-repetition scheduler, or chat history.
- Fixed learner/reviewer URLs; polling only.
- Five learner tools, three reviewer tools, one human mastery gate.
- One seeded statistics fixture.

**Risk:** **3/5.** Easy to ship and demonstrate; higher strategic risk because ChatGPT study mode,
Quizlet, and flashcard apps already own learning. The visible cross-session mastery model must be
the product, not “AI tutor with a diagram.”

**Kill criteria.**

- Three of five active ChatGPT learners prefer one continuing ChatGPT project/thread to reopening
  the map.
- Learners do not revisit it at least twice on a study day in a one-week diary test.
- The tutor link is never opened, or tutor edits do not alter the next learner session.
- Removing WebMCP and using a form plus generated lesson produces the same experience.

---

## 3. Exception Desk

**One sentence.** A two-seat desk where a frontline support worker's agent prepares a policy
exception and an owner/manager's agent checks it, while only the human can approve the actual
refund, closure, or goodwill decision.

**Tag:** **A**

**Target user.** A small-business customer-support rep and owner/manager handling refunds,
account changes, data deletion, or goodwill exceptions without an enterprise support suite.
Customer text is manually pasted; there is no inbox or chat ingest.

**Repeat/day:** **unknown for sessions.** The closest first-party workload evidence is old:
Zendesk reported **384–457 tickets per active retail agent per month** in Nov–Dec 2013
(approximately 17–21 per workday if divided by 22 days, a derived historical estimate, not
current sessions). Current evidence validates the shape rather than frequency: Intercom now
documents explicit human approval for refunds, account closures, data deletion, high-value
escalations, and goodwill gestures. It does not publish sessions per approver per day.

**Why they are already in ChatGPT.** OpenAI says writing/communication is 18% of US ChatGPT
messages and explicitly names answering customer questions as a language-heavy use. Its small
business Academy publishes a “customer comms copilot” template for refund questions,
complaints, reschedules, and service replies, with a human check before sending.

**Why the other person opens the link.** The rep cannot grant an exception, the customer is
waiting, and the owner receives a bounded request: customer ask, relevant policy excerpt,
proposed remedy, risk, and draft reply. Approval authority—not curiosity—drives the second seat.

**What they do today.** Paste the complaint into ChatGPT, then forward/screenshot the draft to an
owner in chat; the owner asks for missing context; the rep rewrites and manually sends. Larger
teams already do this inside Intercom/Zendesk, which is both demand validation and a major
competitive warning.

**Why WebMCP is necessary.**

- Rep tools: `capture_request`, `quote_policy`, `propose_exception`, `draft_reply`.
- Approver tools: `request_fact`, `add_constraint`, `amend_offer`, `record_rationale`.
- The rep's session never registers approver tools. **Approve / decline / send externally are
  not tools.**
- Attributed page patches preserve which seat supplied each fact. A remote support agent can
  orchestrate the workflow, but then the approval is mediated by the agent. WebMCP lets the live
  origin expose only the role's allowed operations while the human sees the exact payload.

**90-second demo.**

1. **0–15s:** Rep pastes a fictional customer request and a short policy; synthetic data only.
2. **15–35s:** Rep's ChatGPT structures the ask, quotes policy, and proposes a $40 exception.
3. **35–55s:** Owner URL opens in a second ChatGPT session. Its agent spots a missing order fact
   and adds a narrower $20 option; it cannot approve.
4. **55–68s:** Rep agent fills the fact and revises the customer-facing draft, visibly attributed.
5. **68–82s:** Owner agent tries `approve`; the tool does not exist. Human clicks **Approve $20**.
6. **82–90s:** The final draft unlocks for copy; **send remains external and human-only**.

**2.5-day cut list.**

- One synthetic request at a time; no inbox, CRM, payments, email, chat, customer identity, or
  external send.
- Fixed rep/owner URLs; no auth or policy uploads.
- One inline policy text area and three fixed outcomes.
- Polling, six tools, approval audit strip.

**Risk:** **4/5.** The demo is excellent WebMCP, but Intercom released almost this exact
human-in-the-loop pattern. Without integrations, the copy/paste overhead may erase the benefit;
with integrations, it cannot ship in 2.5 days.

**Kill criteria.**

- Fewer than three of five small support teams have **multiple manager exceptions on a normal
  workday**.
- Owners approve in existing chat without opening the structured link.
- Teams large enough to need it already use Intercom/Zendesk; teams small enough to paste cases
  do not have role separation.
- Removing the approver's agent does not materially change speed or error detection.

---

## 4. Today Relay

**One sentence.** A shared “today only” dependency board for two adults in one household, where
each person's agent can clarify and sequence commitments but cannot assign or accept work for the
other person.

**Tag:** **A+B**

**Target user.** Two adults coordinating a busy household. No children as users, minors' photos,
medical data, medication, purchases, money settlement, shared grocery list, or message ingest.

**Repeat/day:** **unknown.** Cozi publicly validates the category—shared schedules, reminders, and
to-dos available on mobile and desktop—but publishes no sessions-per-user-per-day. A third-party
app benchmark puts Productivity & Tools at 2.94 median sessions per active user per day; that is
category context, not evidence that two adults will reopen this product.

**Why they are already in ChatGPT.** **Unsourced product hypothesis:** adults already ask ChatGPT
to sequence errands, resolve schedule conflicts, and draft plans. OpenAI's published taxonomy does
not provide a household-coordination frequency figure, so this must be tested rather than stated
as market fact.

**Why the other person opens the link.** The board contains a direct dependency on them, and only
their seat can accept, decline, or change their own commitment. This is weaker than Decision
Window: a text reply may still be easier, and that is the central adoption risk.

**What they do today.** Text messages, shared calendar, paper/mental lists, or Cozi. The proposed
product must not claim it can read those channels. A person pastes or speaks the relevant facts
into their ChatGPT conversation, which writes only to the page.

**Why WebMCP is necessary.**

- Seat A tools can create/clarify A's commitments and propose a dependency to B; Seat B has the
  symmetric surface. Neither agent can assign or accept for the other seat.
- **Accept / decline a proposed dependency is a human control.**
- The visible board is the whole memory. The role boundary lives in tool registration on each
  seat URL, not in prompt instructions. Shared HTML cannot give ChatGPT structured, attributed
  edits; a remote MCP recreates household auth and hides the current agreement away from the
  page.

**90-second demo.**

1. **0–15s:** Seat A tells ChatGPT three facts about tonight; it adds A's commitments and proposes
   one dependency to B.
2. **15–30s:** The page labels the proposal “not accepted”; A's agent cannot assign it.
3. **30–50s:** Seat B opens the link and asks their own ChatGPT to fit it around B's two visible
   commitments. It proposes a time swap.
4. **50–68s:** A's agent updates A's side; the artifact shows both attributed patches.
5. **68–82s:** B's agent cannot accept. Human B clicks **Accept**.
6. **82–90s:** Reload both views; only the visible, mutually accepted plan persists.

**2.5-day cut list.**

- Today only: now / later / done, maximum eight commitments.
- No calendar sync, notifications, recurring chores, shopping, money, routes, photos, chat, or
  household profiles.
- Two fixed role URLs, polling, symmetric tools, human accept/decline.
- One seeded evening fixture.

**Risk:** **5/5.** Easy build, hard behavior change. It resembles products people already abandon,
and “please open another app” may be worse than one more text.

**Kill criteria.**

- In five two-adult household tests, the second person fails to open the link without a reminder
  in more than one case.
- Either person reverts to text for changes after the first plan.
- Median observed opens are below two per person on an active coordination day.
- The agents mostly paraphrase tasks rather than resolving dependencies.

---

## Comparative judgment

### Why Decision Window wins this set

It is the only candidate with 2026 first-party research that names the exact bottleneck:
AI-accelerated output overwhelming reviews, sign-offs, and alignment decisions. It also gives
the two browser sessions meaningfully different powers and reserves the decisive act for the
human. The 90-second story is legible without integrations.

Its weakness is frequency. “Many interruptions” is not “many decisions,” and “daily active
ChatGPT” is not “multiple Decision Window sessions.” The primary should be killed quickly if
real pairs cannot recall multiple daily blocking decisions or if deciders stay in Slack.

### Why Mastery Map is the backup

Learning demand inside ChatGPT is directly measured, it works as a solo all-day object, and the
optional reviewer seat still demonstrates sharing. It is also technically safer in 2.5 days.
Its lower rank reflects weaker WebMCP exclusivity: a well-designed ChatGPT Project or study app
could own much of the experience.

### Rejected hypotheses

- **Generic solo board:** rejected. Without a domain-specific state transition and a human gate,
  it is Notes/Todoist/Trello with a tool manifest.
- **Tutoring as required two-sided collaboration:** rejected. Published usage proves learners use
  ChatGPT, not that a tutor and learner meet multiple times daily. The second seat is optional in
  Mastery Map.
- **Addictive agent game:** rejected. Duolingo proves daily learning demand, not that WebMCP tools
  are necessary for a game. A game would optimize novelty over the contest's real-problem test.
- **Household Today as primary:** rejected pending direct link-open evidence. Category existence
  does not prove both adults will maintain another surface.

## Sources

Primary or first-party unless marked:

1. Atlassian, [The State of Teams 2026](https://www.atlassian.com/blog/state-of-teams-2026)
2. Atlassian, [Meeting overload is real](https://www.atlassian.com/blog/productivity/replace-meetings-asynchronous-collaboration)
3. Atlassian, [Better meetings start with a page](https://www.atlassian.com/blog/productivity/page-led-meetings)
4. Microsoft, [Breaking down the infinite workday](https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday)
5. Slack, [FY25 product usage figures](https://slack.com/)
6. OpenAI, [The state of enterprise AI 2025](https://openai.com/index/the-state-of-enterprise-ai-2025-report/)
7. OpenAI, [B2B Signals](https://openai.com/signals/b2b/)
8. OpenAI, [Productivity Note, July 2025](https://cdn.openai.com/global-affairs/be0fe9e0-eb97-43d1-9614-99f2bd948bcc/OpenAI_Productivity-Note_Jul-2025.pdf)
9. OpenAI, [College students and ChatGPT adoption](https://openai.com/global-affairs/college-students-and-chatgpt)
10. OpenAI, [STADLER customer story](https://openai.com/index/stadler/)
11. OpenAI Academy, [Small-business GPT templates](https://academy.openai.com/en/public/clubs/small-business-ipf4m/resources/four-gpt-templates-for-small-businesses-2026-03-05)
12. Duolingo, [Q4 FY2025 shareholder letter](https://investors.duolingo.com/static-files/961ce633-3cee-49d0-bd7a-2c63731d45fb)
13. Quizlet, [How Quizlet works](https://quizlet.com/ec/features/how-quizlet-works)
14. Intercom, [Human-in-the-loop approvals for Fin Procedures](https://www.intercom.com/help/en/articles/14468561-human-in-the-loop-approvals-for-fin-procedures)
15. Zendesk, [Q4 2013 Benchmark](http://cdn.zendesk.com/resources/whitepapers/benchmarking_report_q42013.pdf)
16. Cozi, [Family Organizer](https://www.cozi.com/)
17. MWM, [Session-frequency benchmark](https://mwm.ai/glossary/session-frequency) — **third-party;
    category context only**

