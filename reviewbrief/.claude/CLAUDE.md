# CLAUDE.md — Markup Project Context

> Paste this at the start of EVERY Claude session.
> Update the Current Sprint section each week.

---

## What This Project Is

Markup is a Chrome extension (and later VS Code extension) with three modes:

- **Mode 1 — Self Review:** Solo developer or vibe coder annotates their own build and generates a structured AI fix brief
- **Mode 2 — Think Aloud:** Voice captures a tester's spoken feedback in real time, attaches each note to the active element, outputs a usability session brief for AI
- **Mode 3 — Remote Review:** Tester uses Markup on a staging URL; session syncs back to the team (V3, not specced)

The brief is structured markdown, ready to paste directly into Claude, Cursor, or Copilot.

**Three products being built:**
1. Chrome Extension — primary, build first (reaches all vibe coders, not just VS Code users)
2. VS Code Extension — Phase 2
3. getmarkup.dev — marketing site, build alongside Chrome extension

**Open source. Built in public by Noah Levin.**

---

## Current Sprint

> UPDATE THIS EVERY SPRINT — this is the most important line

**Phase:** Build
**Sprint:** 1 — Scaffold
**Sprint Goal:** Extension loads in Chrome, Side Panel opens on icon click, no errors
**Sprint file:** `04-build/build.md`

---

## Stack

- **Language:** TypeScript + JavaScript
- **Platform:** Chrome Extension (Manifest V3) — primary
- **Platform (Phase 2):** VS Code Extension API
- **Sidebar:** Chrome Side Panel API (`chrome.sidePanel`) — native Chrome UI, Chrome 114+ required
- **CSS selector generation:** `css-selector-generator` npm library — do not write selector logic from scratch
- **Permissions:** `storage`, `activeTab`, `scripting`, `sidePanel`, `host_permissions: <all_urls>`, `file_urls: true` — all declared in manifest at install, no runtime prompting
- **Storage:** `chrome.storage.local` — notes stored as JSON, scoped per URL
- **Voice (V2):** No voice built. Mode 2 assumes Wispr Flow (or any dictation tool) types into the auto-focused note field.
- **No backend. No cloud. No login. No telemetry (unless opted in).**

## Sprint Philosophy

- **One sprint = one focused AI-assisted session** — no fixed weekly schedule
- **Start next sprint immediately** when current one ships
- **Starting point:** Zero code — no `src/` folder exists yet
- Each sprint has a single goal and a binary ship/don't ship test
- Full sprint plan: `04-build/build.md`

---

## Key Files Claude Must Know

| File | What it contains |
|---|---|
| `01-discovery/discovery.md` | Research questions, competitive analysis, ICP (both Mode 1 and Mode 2) |
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
- **Chrome extension is the MVP** — never scope VS Code or Mode 2 features into the Chrome MVP sprint
- **Mode 2 is V2** — never spec Think Aloud / voice transcription for the current sprint

---

## The Core User Journeys

### Mode 1 — Self Review (MVP)
```
User opens any tab in Chrome (localhost, staging, or live site)
  → Clicks Markup extension icon → sidebar opens on the right
    → Clicks any element on the page → note input appears
      → Types (or speaks via Wispr Flow) their note
        → Picks type: Bug / Design / Copy / Question
          → Note saves automatically (chrome.storage.local)
            → Repeat for all issues across the page
              → Clicks "Generate AI Brief"
                → Brief appears in sidebar → one-click copy
                  → Pastes into Claude → fixes happen
```

### Mode 2 — Think Aloud Session (V2)
```
PM opens Markup → clicks "Start Think Aloud"
  → Tester uses the app naturally and speaks their thoughts
    → Markup auto-focuses the note field on each element click
      → Wispr Flow (or any dictation tool) types directly into the note
        → Session ends → PM reviews and edits transcribed notes
          → "Generate AI Brief" → structured usability session brief
            → Pastes into Claude → product improvements happen
```

> **Voice assumption:** Markup does not build voice transcription. Mode 2 assumes the tester is running Wispr Flow or any voice-to-text tool that types into active fields. The only engineering required is auto-focusing the note text field when a user clicks an element — the voice tool handles transcription automatically.

---

## AI Brief Output Format (non-negotiable)

### Mode 1 Brief
```markdown
# Markup — Fix Instructions
**Project:** [tab title or URL]
**Reviewed:** [date] at [time]
**Mode:** Self Review
**Total Issues:** [n]

---

## 🐛 Bug — High Priority
**Element:** [human readable name]
**Selector:** [css selector]
**Issue:** [what's wrong]
**Expected:** [what should happen]
```

### Mode 2 Brief
```markdown
# Markup — Usability Session Brief
**Project:** [tab title or URL]
**Session:** [date] at [time]
**Mode:** Think Aloud
**Total Observations:** [n]

---

## 🗣️ Think Aloud — Observation
**Element:** [human readable name]
**Selector:** [css selector]
**Said:** [exact transcription]
**Insight:** [what this reveals about the UX]
```

Full spec in `02-define/define.md` → AI Brief Output Format section.

---

## Current Acceptance Criteria — MVP (Chrome Extension, Mode 1)

The MVP is done when ALL of these pass:

- [ ] Extension activates on any Chrome tab including localhost
- [ ] Clicking any element opens a note input pre-filled with its selector
- [ ] Notes save automatically — no manual save step
- [ ] Notes persist when the tab is refreshed or Chrome is restarted
- [ ] "Generate AI Brief" produces the exact Mode 1 format above
- [ ] Brief copies to clipboard in one click
- [ ] Tool works without internet connection
- [ ] No login, no account, no telemetry without opt-in

---

## Workflow Context

- Developer: Noah Levin (one-handed, voice-first via Wispr Flow)
- Voice notes: Wispr Flow dictates directly into the Markup note input
- Multiple Claude tabs open in parallel (builder / checker / debugger)
- Commits happen via `Git: Commit All` task

---

## What's Explicitly Out of Scope (never suggest these)

- Real-time collaboration or session sharing (V3 territory)
- Cloud sync or remote storage
- Jira / Linear / GitHub Issues integration
- Auto-fix (we output the brief, not the fix)
- Support for non-web projects
- AI that reads the preview and generates notes automatically
- VS Code features in the Chrome MVP sprint
- Think Aloud / voice transcription in the Chrome MVP sprint (Mode 2 is V2)
