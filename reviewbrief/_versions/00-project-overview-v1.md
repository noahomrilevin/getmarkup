# ReviewBrief — Master Project Overview

> A Chrome extension (and VS Code extension) for annotating any URL and generating structured AI fix briefs.
> Built in public by **Noah Levin** — CPO, builder, rabbi-in-training.

---

## What We're Building

| Product | Format | Status |
|---|---|---|
| **ReviewBrief** | Chrome Extension | Primary build — MVP |
| **ReviewBrief** | VS Code Extension | Phase 2 |
| **reviewbrief.dev** | Marketing + Docs Site | Launch vehicle |

### The Core Loop
```
Open any tab in Chrome (localhost, staging, or live)
  → Click ReviewBrief icon → sidebar opens
    → Click any element → attach a note
      → Notes auto-save locally
        → "Generate AI Brief" outputs structured fix instructions
          → Paste directly into Claude / Cursor / Copilot
```

### The Differentiator
Nobody outputs notes in a format optimized for AI ingestion.
That's the product. Everything else is scaffolding around that moment.

### Why Chrome First, Not VS Code
Discovery revealed that the highest-pain users — non-developer vibe coders — don't use VS Code. They build in Claude.ai, Lovable, or Bolt, and they review output in a browser tab. A Chrome extension reaches everyone. VS Code reaches only developers.

---

## Personal Brand Angle

This project is built in public, narrated by Noah Levin.
Every phase — research, design decisions, code — gets documented and shared.

**Channels:**
- GitHub (open source, public commits)
- Twitter/X build log threads
- LinkedIn longer-form reflections
- reviewbrief.dev/blog (personal voice, not corporate)

**Positioning:** "I'm a one-handed CPO building the tool I wish existed.
Here's everything I learn."

That story is more powerful than any feature list.

---

## Phase Map

| # | Phase | Focus | Deliverable | Folder |
|---|---|---|---|---|
| 0 | Overview | Project north star | This file | root |
| 1 | Discovery | Is this a real gap? | `gap-analysis.md` | `01-discovery/` |
| 2 | Define | What exactly are we building? | PRD + User Stories | `02-define/` |
| 3 | Design | How does it look and feel? | Component System | `03-design/` |
| 4 | Build | Make it real | Shipped MVP | `04-build/` |
| 5 | Ship | Get it to users | Launch | `05-ship/` |
| 6 | Learn | Did it work? | Retro + V2 Backlog | `06-learn/` |

---

## File Structure

```
/reviewbrief
  00-project-overview.md      ← you are here
  CHANGELOG.md                ← version history
  README.md                   ← public-facing intro

  01-discovery/
    discovery.md              ← research questions, ICP, competitive analysis
    gap-analysis.md           ← findings, Go/No-Go decision, pivots

  02-define/
    define.md                 ← JTBD, user stories, MoSCoW, brief format spec

  03-design/
    design.md                 ← design tokens, components, layout, accessibility

  04-build/
    build.md                  ← sprint plan, story points, done criteria

  05-ship/
    ship.md                   ← launch checklist, staged rollout

  06-learn/
    learn.md                  ← HEART metrics, OKRs, retrospective template

  _versions/                  ← original copies of any rewritten file
    02-define-v1.md           ← original VS Code-first define doc

  .claude/
    CLAUDE.md                 ← paste at start of every session
    COWORK.md                 ← multi-tab collaboration instructions
    skills/                   ← reusable Claude skill prompts
```

---

## North Star Metric

**Weekly Active Annotators** — users who open the tool and attach at least one note per week.

This measures actual workflow adoption, not installs.
