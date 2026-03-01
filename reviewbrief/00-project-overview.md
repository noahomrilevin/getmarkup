# Markup — Master Project Overview

> A Chrome extension (and VS Code extension) for annotating any URL and generating structured AI fix briefs.
> Built in public by **Noah Levin** — CPO, builder, rabbi-in-training.

---

## What We're Building

| Product | Format | Status |
|---|---|---|
| **Markup** | Chrome Extension | Primary build — MVP |
| **Markup** | VS Code Extension | Phase 2 |
| **markup.dev** | Marketing + Docs Site | Launch vehicle |

---

## Three Modes

Markup is not just a solo annotation tool. It is a lightweight usability testing platform with AI output.

### Mode 1 — Self Review *(MVP)*
A solo developer or vibe coder scrolls through their own build, clicks elements, and leaves notes. At the end, they generate an AI brief and paste it into Claude.

```
Open any tab in Chrome (localhost, staging, or live)
  → Click Markup icon → sidebar opens
    → Click any element → type (or speak) a note
      → Notes auto-save locally
        → "Generate AI Brief" → structured fix instructions
          → Paste into Claude / Cursor / Copilot → fixes happen
```

### Mode 2 — Think Aloud Session *(V2)*
A product manager or designer runs a lightweight usability test. The tester uses the app naturally while speaking their thoughts aloud. Markup captures the voice stream, transcribes it into notes, and attaches each note to the element the tester was interacting with at that moment.

```
PM opens Markup → clicks "Start Think Aloud"
  → Tester uses the app and speaks freely
    → Voice is transcribed in real time
      → Each spoken note is attached to the active element
        → Session ends → PM reviews and edits notes
          → "Generate AI Brief" → AI-ready usability report
```

> **Voice assumption:** Markup does not build voice transcription. Mode 2 assumes the tester is running Wispr Flow or any voice-to-text tool that types into active fields. The only engineering required to support Mode 2 is auto-focusing the note text field when a user clicks an element — the voice tool handles transcription automatically.

### Mode 3 — Remote Review *(V3)*
A tester runs the Chrome extension on a staging URL. The session syncs back to the product team. Not specced yet — flagged for V3 planning.

---

## The Differentiator

Every existing tool forces you to choose between:
- **Visual annotation** (Jam.dev, BugHerd) — but requires deployed sites, no AI output
- **Usability testing** (UserTesting, Lookback) — expensive, no element-level data, no AI brief
- **AI context tools** (CLAUDE.md, .cursorrules) — project-level, not review-session-level

Markup sits in the empty cell: **any URL × element-attached notes × AI brief output**.

---

## Personal Brand Angle

Built in public, narrated by Noah Levin.
Every phase — research, design decisions, code — gets documented and shared.

**Channels:**
- GitHub (open source, public commits)
- Twitter/X build log threads
- LinkedIn longer-form reflections
- markup.dev/blog (personal voice, not corporate)

**Positioning:** "I'm a one-handed CPO building the tool I wish existed.
Here's everything I learn."

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

  .claude/
    CLAUDE.md                 ← paste at start of every session
    COWORK.md                 ← multi-tab collaboration instructions
    skills/                   ← reusable Claude skill prompts
```

---

## North Star Metric

**Weekly Active Annotators** — users who open the tool and attach at least one note per week.

This measures actual workflow adoption, not installs.
