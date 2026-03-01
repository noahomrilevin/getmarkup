# CLAUDE.md — ReviewBrief Project Context

> Paste this at the start of EVERY Claude session.
> Update the Current Sprint section each week.

---

## What This Project Is

ReviewBrief is a Chrome extension (and later VS Code extension) that lets anyone annotate any local, localhost, or live URL and generate structured AI fix briefs. The brief is structured markdown, ready to paste directly into Claude, Cursor, or Copilot.

**Three products being built:**
1. Chrome Extension — primary, build first (reaches all vibe coders, not just VS Code users)
2. VS Code Extension — Phase 2
3. reviewbrief.dev — marketing site, build alongside Chrome extension

**Open source. Built in public by Noah Levin.**

---

## Current Sprint

> UPDATE THIS EVERY SPRINT — this is the most important line

**Phase:** Define
**Sprint:** —
**Sprint Goal:** Chrome extension MVP spec complete, acceptance criteria locked
**Sprint file:** `02-define/define.md`

---

## Stack

- **Language:** TypeScript + JavaScript
- **Platform:** Chrome Extension (Manifest V3) — primary
- **Platform (Phase 2):** VS Code Extension API
- **UI:** Injected sidebar overlay on the active tab
- **Storage:** `chrome.storage.local` — notes exported as `.md` on brief generation
- **No backend. No cloud. No login. No telemetry (unless opted in).**

---

## Key Files Claude Must Know

| File | What it contains |
|---|---|
| `01-discovery/discovery.md` | Research questions, competitive analysis, ICP |
| `01-discovery/gap-analysis.md` | Discovery findings, Go/No-Go decision, pivots |
| `02-define/define.md` | JTBD, user stories, MoSCoW, acceptance criteria, brief format spec |
| `03-design/design.md` | Design tokens, component names, layout spec |
| `04-build/build.md` | Current sprint, story points, done criteria |
| `_versions/` | Archived originals of any rewritten file |
| `CHANGELOG.md` | Version history — update before every release |

---

## Rules Claude Must Always Follow

- **Never** suggest adding cloud sync, a backend, or login
- **Never** add telemetry without explicit user request
- **Always** check acceptance criteria in `02-define/define.md` before saying something is done
- **Always** write TypeScript with explicit types — no `any`
- **Keep it simple** — this is a solo project, not enterprise software
- **When in doubt, do less and do it well**
- **One file per concern** — don't dump everything in one file
- **Chrome extension is the MVP** — never scope VS Code features into the Chrome sprint

---

## The Core User Journey

```
User opens any tab in Chrome (localhost, staging, or live site)
  → Clicks ReviewBrief extension icon → sidebar opens on the right
    → Clicks any element on the page → note input appears
      → Types (or speaks via Wispr Flow) their note
        → Picks type: Bug / Design / Copy / Question
          → Note saves automatically (chrome.storage.local)
            → Repeat for all issues across the page
              → Clicks "Generate AI Brief"
                → Brief appears in sidebar → one-click copy
                  → Pastes into Claude → fixes happen
```

---

## AI Brief Output Format (non-negotiable)

The brief generator must produce exactly this format:

```markdown
# ReviewBrief — Fix Instructions
**Project:** [tab title or URL]
**Reviewed:** [date] at [time]
**Total Issues:** [n]

---

## 🐛 Bug — High Priority
**Element:** [human readable name]
**Selector:** [css selector]
**Issue:** [what's wrong]
**Expected:** [what should happen]

---

## 🎨 Design
**Element:** [name]
**Selector:** [selector]
**Issue:** [description]
**Expected:** [description]
```

Full spec in `02-define/define.md` → AI Brief Output Format section.

---

## Current Acceptance Criteria — MVP (Chrome Extension)

The MVP is done when ALL of these pass:

- [ ] Extension activates on any Chrome tab including localhost
- [ ] Clicking any element opens a note input pre-filled with its selector
- [ ] Notes save automatically — no manual save step
- [ ] Notes persist when the tab is refreshed or Chrome is restarted
- [ ] "Generate AI Brief" produces the exact format above
- [ ] Brief copies to clipboard in one click
- [ ] Tool works without internet connection
- [ ] No login, no account, no telemetry without opt-in

---

## Workflow Context

- Developer: Noah Levin (one-handed, voice-first via Wispr Flow)
- Voice notes: Wispr Flow dictates directly into the ReviewBrief note input
- Multiple Claude tabs open in parallel (builder / checker / debugger)
- Commits happen via `Git: Commit All` task

---

## What's Explicitly Out of Scope (never suggest these)

- Real-time collaboration
- Cloud sync or remote storage
- Jira / Linear / GitHub Issues integration
- Auto-fix (we output the brief, not the fix)
- Support for non-web projects
- AI that reads the preview and generates notes automatically (V3 maybe, not now)
- VS Code features in the Chrome MVP sprint
