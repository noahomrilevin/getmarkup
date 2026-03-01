# 01 — Discovery

> Framework: The Mom Test · Problem Hypothesis · Competitive Analysis  
> Goal: Validate the gap before writing a single line of code

---

## Problem Hypothesis

**We believe** that solo developers and vibe coders building with AI tools  
**experience frustration** when reviewing their own local HTML/app builds  
because they have no structured way to capture what's wrong  
in a format that translates cleanly into AI fix instructions.

**We'll know this is true when** we find 5+ people describing this exact friction  
without us prompting the problem.

---

## Ideal Customer Profile (ICP)

### Primary
- Solo developers / indie hackers building with AI (Claude, Cursor, Copilot)
- "Vibe coders" — people who direct AI rather than write every line themselves
- People who review their own work (no designer, no QA team)
- Work primarily in VS Code

### Secondary
- Freelancers reviewing client work before delivery
- Developer-designers who move between Figma and code
- Accessibility auditors doing quick reviews

### Explicitly Not (for MVP)
- Large engineering teams with existing review tools (Jira, Linear)
- Pure designers who don't touch code
- Enterprise QA workflows

---

## The Mom Test — Research Questions

> The Mom Test rule: Never ask if they like your idea.  
> Ask about their life, their problems, their current behavior.

### Question Set A — Behavior Mapping
These reveal the current workflow without leading.

1. "Walk me through what happens after you finish a coding session — how do you know when something is ready to test?"
2. "When you notice something is wrong with your UI, what's the first thing you do?"
3. "How do you currently keep track of things you want to fix in a project but haven't gotten to yet?"
4. "How do you hand off a list of fixes to an AI tool like Claude or Cursor — what does that look like?"
5. "Have you ever lost track of a bug or design issue you spotted and then forgot to fix?"

### Question Set B — Pain Excavation
Dig into the friction.

6. "What's the most annoying part of reviewing your own work?"
7. "Have you ever opened a tool and thought 'this is almost what I need but...'?"
8. "When you're using Claude or Cursor for fixes, what makes the difference between a response that nails it vs. one that misses?"
9. "If you could change one thing about how you move from 'I see a problem' to 'AI fixes the problem' — what would it be?"

### Question Set C — Validation Signals
Listen for these without asking directly.

- ✅ **Green flag:** They describe a workaround they've built themselves (sticky notes, Notion page, screenshot folders)
- ✅ **Green flag:** They mention losing context between spotting and fixing
- ✅ **Green flag:** They say AI fixes are hit-or-miss because "it doesn't know what I mean"
- 🔴 **Red flag:** "I just fix it immediately, I don't need to track it"
- 🔴 **Red flag:** "We have a PM who handles all that"

### Where to Run These Conversations
- r/webdev, r/SideProject, r/ChatGPTCoding
- Twitter/X — post a question, DM people who respond
- Discord servers: Cursor, Buildspace, Indie Hackers
- Your own network — other solo devs you know personally

### Target: 15 conversations minimum before drawing conclusions

---

## Competitive Analysis

### Direct Competitors (do exactly this)
| Tool | What it does | Gap |
|---|---|---|
| None found | — | The specific combo doesn't exist |

### Adjacent Competitors (solve part of the problem)

| Tool | What it solves | What it misses |
|---|---|---|
| **Jam.dev** | Bug reporting with screenshot | Browser-only, not local, no AI output |
| **BugHerd** | Visual website feedback | Requires deployed site, no AI brief |
| **Marker.io** | Client feedback on live sites | Same limitation as BugHerd |
| **VS Code Todo Tree** | In-code TODO comments | Not visual, not element-attached |
| **Responsively App** | Multi-device local preview | Zero annotation or note features |
| **Loom** | Video screen recording | Async, not structured, no AI output |
| **Figma Comments** | Design annotation | Design tool only, no code context |
| **Linear / Jira** | Issue tracking | Heavy, not visual, not local-file-aware |

### Key Insight from Competitive Map
Every existing tool is either:
- **Too heavy** (Jira, Linear) — built for teams not solo devs
- **Requires deployment** (BugHerd, Marker.io) — can't use on local files
- **No AI handoff** (all of them) — none output structured AI prompts

The gap is specifically: **local + lightweight + AI-output**.

### Chrome Extension Landscape

| Extension | Purpose | Gap |
|---|---|---|
| **Awesome Screenshot** | Screenshot + annotate | No note persistence, no AI output |
| **GoFullPage** | Full page capture | Capture only |
| **Loom** | Screen recording | Not structured |
| **Hypothesis** | Web annotation | Academic focus, no AI output |

---

## Assumptions to Test

Rank by risk: **High** = if wrong, kills the product. **Low** = easy to adjust.

| # | Assumption | Risk | How to Test |
|---|---|---|---|
| 1 | Vibe coders review their own work without a QA person | High | Mom Test conversations |
| 2 | The gap between spotting and fixing causes real lost time | High | Look for workarounds in conversations |
| 3 | AI fix output is the differentiating value, not just the preview | High | Ask which part they'd pay for |
| 4 | People want this in VS Code (not standalone app) | Medium | Ask where they spend most time |
| 5 | Notes saved as MD files is the right format | Low | Easy to change, ask preference |
| 6 | Chrome extension has enough demand alongside VS Code | Medium | Separate ICP research needed |

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

**Pivot if:**
- Chrome extension resonates more than VS Code in conversations
- The AI brief isn't the compelling part — something else is

**Kill if:**
- Fewer than 5 people recognize the problem
- Existing tools keep coming up as "good enough"
