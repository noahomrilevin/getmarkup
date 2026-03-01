# 01 — Discovery

> Framework: The Mom Test · Problem Hypothesis · Competitive Analysis
> Goal: Validate the gap before writing a single line of code

---

## Problem Hypothesis

**We believe** that solo developers, vibe coders, and product teams building web apps
**experience frustration** when reviewing their own builds or running lightweight usability tests
because they have no structured way to capture what's wrong — or what users say —
in a format that translates cleanly into AI fix instructions.

**We'll know this is true when** we find 5+ people describing this exact friction
without us prompting the problem.

---

## Ideal Customer Profile (ICP)

### Mode 1 ICP — Self Review (Solo Developer / Vibe Coder)

**Primary**
- Solo developers / indie hackers building with AI (Claude, Cursor, Copilot)
- "Vibe coders" — people who direct AI rather than write every line themselves
- People who review their own work (no designer, no QA team)
- Open their app in Chrome to review — may or may not use VS Code

**Secondary**
- Freelancers reviewing client deliverables before handoff
- Developer-designers who move between Figma and code
- Accessibility auditors doing quick reviews

**Explicitly Not (for MVP)**
- Large engineering teams with existing review tools (Jira, Linear)
- Pure designers who don't touch code
- Enterprise QA workflows

### Mode 2 ICP — Think Aloud Session (Product / UX)

**Primary**
- Product managers and UX researchers running lightweight usability tests
- Designers watching users interact with their product
- Solo founders who want real user feedback without paying for UserTesting.com
- Small teams with no budget for dedicated usability testing platforms

**Pain**: They run "hallway tests" or Zoom calls, type notes furiously, lose context, and have no structured output. The insight exists in the session — it just never survives translation into something actionable.

**Secondary**
- UX students learning think-aloud methodology
- Consultants doing rapid heuristic reviews for clients

**Explicitly Not (for Mode 2 MVP)**
- Enterprise UX research teams (they have Dovetail, UserTesting, Lookback)
- Teams needing video recording and replay (use Loom for that)

> **Voice assumption:** Markup does not build voice transcription. Mode 2 assumes the tester is running Wispr Flow or any voice-to-text tool that types into active fields. The only engineering required to support Mode 2 is auto-focusing the note text field when a user clicks an element — the voice tool handles transcription automatically.

---

## The Mom Test — Research Questions

> The Mom Test rule: Never ask if they like your idea.
> Ask about their life, their problems, their current behavior.

### Question Set A — Mode 1 (Self Review) Behavior Mapping

1. "Walk me through what happens after you finish a coding session — how do you know when something is ready to test?"
2. "When you notice something is wrong with your UI, what's the first thing you do?"
3. "How do you currently keep track of things you want to fix in a project but haven't gotten to yet?"
4. "How do you hand off a list of fixes to an AI tool like Claude or Cursor — what does that look like?"
5. "Have you ever lost track of a bug or design issue you spotted and then forgot to fix?"

### Question Set B — Mode 1 Pain Excavation

6. "What's the most annoying part of reviewing your own work?"
7. "Have you ever opened a tool and thought 'this is almost what I need but...'?"
8. "When you're using Claude or Cursor for fixes, what makes the difference between a response that nails it vs. one that misses?"
9. "If you could change one thing about how you move from 'I see a problem' to 'AI fixes the problem' — what would it be?"

### Question Set C — Mode 2 (Think Aloud / Usability Testing) Behavior Mapping

10. "Have you ever watched someone use your product and thought 'I wish I could capture that reaction'?"
11. "When you run a usability session — even informal, even with a colleague — how do you take notes while the user is talking?"
12. "What happens to your notes after a user session? Where do they go and who acts on them?"
13. "What's the gap between 'a user said something insightful' and 'the team knows what to fix'?"
14. "Have you ever lost a great insight from a user session because you couldn't write fast enough, or because you forgot to write it down at all?"
15. "If you had a tool that transcribed what a tester said and attached it to the exact element they were talking about — would that change how often you run user tests?"

### Validation Signals

Listen for these without asking directly.

**Mode 1 green flags:**
- ✅ They describe a workaround they've built themselves (sticky notes, Notion page, screenshot folders)
- ✅ They mention losing context between spotting and fixing
- ✅ They say AI fixes are hit-or-miss because "it doesn't know what I mean"

**Mode 2 green flags:**
- ✅ They say they run informal tests "but never know what to do with the notes"
- ✅ They mention typing notes while a user talks and feeling like they're missing things
- ✅ They say they'd do more usability testing "if it weren't so much work to set up"
- ✅ They reference paying for UserTesting or Lookback but finding it overkill

**Red flags (either mode):**
- 🔴 "I just fix it immediately, I don't need to track it"
- 🔴 "We have a PM who handles all that"
- 🔴 "We use UserTesting and it covers everything we need"

### Where to Run These Conversations

- r/webdev, r/SideProject, r/ChatGPTCoding, r/userexperience
- Twitter/X — post a question, DM people who respond
- Discord servers: Cursor, Buildspace, Indie Hackers
- Product Hunt community, UX Coffee Hours
- Your own network — other solo devs, PMs, and designers you know personally

### Target: 15 conversations minimum before drawing conclusions

---

## Competitive Analysis

### Mode 1 — Self Review: Direct Competitors

| Tool | What it does | Gap |
|---|---|---|
| None found | — | The specific combo (local + visual + AI output) doesn't exist |

### Mode 1 — Adjacent Competitors

| Tool | What it solves | What it misses |
|---|---|---|
| **Jam.dev** | Bug reporting with screenshot | No localhost, no AI output |
| **BugHerd** | Visual website feedback | Requires deployed site, no AI brief |
| **Marker.io** | Client feedback on live sites | Same limitation as BugHerd |
| **VS Code Todo Tree** | In-code TODO comments | Not visual, not element-attached |
| **Responsively App** | Multi-device local preview | Zero annotation or note features |
| **Loom** | Video screen recording | Async, not structured, no AI output |
| **Figma Comments** | Design annotation | Design tool only, no code context |
| **Linear / Jira** | Issue tracking | Heavy, not visual, not local-file-aware |

### Mode 2 — Think Aloud: Adjacent Competitors

| Tool | What it solves | What it misses |
|---|---|---|
| **UserTesting.com** | Recruits testers + records sessions | Expensive ($30k+/yr), no element-level notes, no AI brief |
| **Lookback.io** | Screen recording + think aloud | No element annotation, no AI output, setup overhead |
| **Maze** | Prototype usability testing | Prototype only, not live apps, no AI brief |
| **Hotjar** | Heatmaps + session recordings | Not structured notes, no AI output, no think-aloud capture |
| **Dovetail** | Research synthesis | Requires importing recordings, heavy, team-focused |
| **Otter.ai** | Voice transcription | No element context, no AI brief format |

### Key Insight from Competitive Map

**Mode 1 gap:** Every existing visual tool requires a deployed site and outputs bug reports for humans, not AI.

**Mode 2 gap:** Every usability testing tool is either expensive/complex (UserTesting, Lookback) or captures the wrong layer (Hotjar = heatmaps, Otter = raw transcript). None attach transcribed speech to the specific element the tester was interacting with. None output structured AI briefs.

**Markup's unique position:** Any URL × click-to-annotate × voice-to-element × AI brief output.

---

## Assumptions to Test

| # | Assumption | Risk | Mode | How to Test |
|---|---|---|---|---|
| 1 | Vibe coders review their own work without a QA person | High | 1 | Mom Test Q1-5 |
| 2 | The gap between spotting and fixing causes real lost time | High | 1 | Look for workarounds |
| 3 | AI brief output is the differentiating value, not just annotation | High | 1+2 | Ask which part they'd pay for |
| 4 | People want this in Chrome (not a standalone app) | Medium | 1 | Ask where they spend most time |
| 5 | Notes saved as MD files is the right format | Low | 1 | Easy to change, ask preference |
| 6 | PMs/designers run informal usability tests but have no lightweight capture tool | High | 2 | Mom Test Q10-15 |
| 7 | Voice-to-element transcription is compelling enough for Mode 2 users | High | 2 | Ask if they'd use it vs. note-taking |
| 8 | Mode 2 users are reachable without a separate ICP strategy | Medium | 2 | Check overlap in communities |

---

## Research Deliverable

After 15 conversations, produce:

### gap-analysis.md
```
## What We Heard
[Summary of patterns across conversations]

## Confirmed Pain Points
[Pains mentioned by 3+ people unprompted]

## Invalidated Assumptions
[What we thought was true that isn't]

## Refined ICP
[Who actually has this problem vs. who we thought]

## Go / No-Go Recommendation
[Proceed to Define / Pivot / Kill]
```

---

## Discovery Timeline

| Week | Activity |
|---|---|
| Week 1 | Post research questions in 5 communities, collect responses |
| Week 2 | Run 10 async conversations (DMs, forum threads) |
| Week 3 | Run 5 live conversations (calls or voice notes) |
| Week 4 | Synthesize findings, write gap-analysis.md, make Go/No-Go call |

---

## Go / No-Go Criteria

**Proceed to Define if:**
- 8+ of 15 people describe the "spotting → losing context → bad AI prompt" loop
- At least 3 people show us a workaround they built themselves
- Nobody points us to an existing tool that already solves this

**Expand to Mode 2 if:**
- 5+ people describe losing insights during user sessions
- At least 2 people say they'd use a lightweight think-aloud tool if it existed
- UserTesting/Lookback come up as "too expensive" or "too much setup"

**Pivot if:**
- The AI brief isn't the compelling part — something else is
- Mode 2 resonates far more than Mode 1 (resequence build order)

**Kill if:**
- Fewer than 5 people recognize the problem
- Existing tools keep coming up as "good enough"
