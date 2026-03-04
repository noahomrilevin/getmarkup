# Markup — Changelog & Roadmap

> Built in public. Every sprint, every fix, every decision.
> This is the full record of what shipped, what's next, and why.

---

## What is Markup?

Markup is a Chrome extension for annotating web pages. Toggle it on, click any element, speak or type your note, generate a structured brief — and paste it directly into Claude, Cursor, Linear, or a client email. No screenshots with arrows. No Loom recordings nobody watches. No Notion docs that lose context.

**Full loop:** Toggle ON → hover to preview element → click to select → speak via Whisper Flow or type → save → generate Brief → copy or download.

Built by Noah Levin. Voice-first workflow. Designed to move fast.

---

## Shipped

### Sprint 1–2 — Foundation
*The core loop, end to end.*

- Toggle ON/OFF — injects content script into the active page
- Hover ring on elements — preview before committing
- Click to select element — locks CSS selector via `css-selector-generator`
- Type a note and save — persisted to `chrome.storage.local`
- Storage keyed by tab (later migrated to URL in Sprint 7b)

---

### Sprint 3–4 — Editing & Types
*Notes you can fix. Notes with meaning.*

- Undo / redo — full history stack
- Edit mode — reopen any saved note and update it
- Note type picker — Bug · Design · Copy · ? · General
- Empty state CTA — guides new users to start annotating

---

### Sprint 5 — Content Script Stability
*Make selection actually work.*

- Cursor override — crosshair on hover, no browser interference
- Two-mode hover ring — dashed preview, solid locked
- CSS selector generation — accurate, stable selectors via `css-selector-generator`

---

### Sprint 6 — Brief + General Notes
*The output that makes everything worth doing.*

- Brief panel — generates structured markdown from all notes
- General notes — annotate the page without selecting an element
- Auto-focus on note input
- Session title — name your review session
- Download `.md` — export the brief as a markdown file

---

### Sprint 7a — Brief Polish + UX Cleanup
*The brief is called Brief. Not AI Brief. Never AI Brief.*

- Brief renamed throughout (not "AI Brief")
- Back to Notes from brief panel
- Activation hints — tells users what to do when Markup is ON
- Clear selector — deselect current element without cancelling note
- Clear all — wipe notes for a session
- Session title + URL in brief header

---

### Sprint 7b — Critical Stability Pass
*9 bugs. All fixed.*

- **Notes lost on tab switch** — storage migrated from tab-keyed to URL-keyed. Notes follow the URL forever.
- **file:// pages blocked** — local files now fully supported
- **Activation lost on sidebar reopen** — sidebar auto-syncs to ON state when content script was already active
- **Duplicate note on edit + clear selector** — `currentNoteId` preserved through clear flow
- **Selector row visible at startup** — hidden until Markup is ON
- **Note cleared on deactivation** — `deactivateReset()` preserves textarea text
- **"General note" label on wrong types** — only shown when type is General AND no selector
- **Session title lost on tab switch** — title storage migrated to URL-keyed
- **Safety net backup** — last 3 snapshots per URL before any destructive clear

---

### Sprint 9 — Full Design System Pass
*The product looks like a product.*

- Logotype — Playfair Display italic, gold, in the header
- Full design token system — `--ink`, `--paper`, `--gold`, `--deep-blue`, `--mid-blue`, `--slate`, `--warm-white`
- Severity system — Critical · High · Medium · Low on every note
- Severity picker — 4 buttons, color-coded, below type picker
- Severity badge on note cards
- Brief sorted by severity — Critical → High → Medium → Low
- Severity summary in brief header — `N Critical · N High · N Medium · N Low`
- Filter tabs — All · Critical · High · Medium · Low
- Settings panel — Developer Mode / Simple Mode toggle
- Simple Mode — hides selectors, type picker, severity picker
- Edit mode redesign — clear editing state on card
- Archive panel — brief history UI
- Bottom bar — SELECT ELEMENT and GENERATE BRIEF side by side
- Export buttons — Copy to Clipboard, Export MD+Images, Export as HTML
- ESC pill — visible escape hint on page
- Abbreviated filter tabs for narrow widths

---

### Sprint 10 — Feature Polish + Export Architecture
*The product works the way a real review tool should.*

**Floating in-page note input**
When an element is selected, a floating textarea appears on the page — anchored near the element. Whisper Flow or keyboard types directly into it. Submit sends the note to the sidebar. Focus works because the input lives on the page, not in the side panel. This is how Loom, Fabric, and similar tools solve the Chrome focus boundary problem.

**Domain-scoped brief and notes list**
Notes are stored per URL but displayed and briefed across the entire domain. Navigate to `/pricing`, see notes from `/`, `/docs`, and `/dashboard` too — grouped by URL path with section headers. The brief covers the full site session, not just the current page.

**Simple-first onboarding**
New installs default to Simple Mode. First open shows a one-time inline welcome card. DEV/SIMPLE chip in the header is clickable — jumps directly to the mode toggle in settings.

**Self-hosted fonts**
DM Sans, DM Mono, Lora, and Playfair Display bundled locally. No Google Fonts dependency. Works offline.

**Save note before switching**
Unsaved text in the textarea when a new element is clicked? A prompt strip appears: *Save note before switching?* with Save and Discard. Nothing is lost silently.

**Individual note delete**
Delete button in edit mode with inline confirmation. No modal, no drama.

**Domain-wide clear**
Clear all notes clears the entire domain session — not just the current page. Confirmation shows the domain name so there's no ambiguity.

**Filter tab counts**
Filter tabs show live counts: `All (4)` · `MED (3)`.

**Settings footer**
Storage used (KB) + version number at the bottom of the settings panel.

**HTML report logotype**
Markup logotype in the header of every exported HTML report.

**Multi-page URL group headers**
Notes list groups notes by URL path. Current page gets a gold left border.

**Brief URL path headers**
Every URL group in the brief output has a path header (`/docs`, `/pricing`, `Home`) — always, even when there's only one URL.

---

## Up Next

### Sprint 11 — Interactions + Visual Polish

| Item | Description |
|---|---|
| Orange hover/lock ring | Hover ring goes orange dashed; locked ring goes orange solid. Matches original design spec. |
| Extension icon badge count | Note count badge on the toolbar icon via `chrome.action.setBadgeText` |
| Brief Archive | Browse and restore previously generated briefs by domain and date |
| Brief Sort toggle | Severity-grouped vs Chronological in settings |
| Download JSON / CSV | Export notes as structured data from settings |
| Keyboard shortcut | Cmd+Shift+M to open and activate |
| Think Aloud mode | Real-time voice capture — notes auto-created with element context at utterance time |
| Selector improvement | Replace `:nth-child()` chains with meaningful CSS selectors (ID, class, semantic tag) |
| Image paste on note | Cmd+V while note focused — screenshot stored, shown as thumbnail, included in export |

---

### Sprint 12 — AI Brief

The current brief is a template compiler — it formats your notes into structured markdown. Sprint 12 adds a real AI-generated analysis.

**How it works:** User adds their own OpenAI or Anthropic API key in settings once. Generate Brief calls the API with all domain-scoped notes as context. Response streams token by token into the brief panel. No backend, no Markup account, no subscription required.

**Output sections:** Summary · Critical Issues · Root Cause Analysis · Recommendations · Code Fixes

**Fallback:** If no API key is set, the template brief runs as normal — with a nudge to add a key in settings.

**V2:** Markup proxies the API call via a backend. Users pay a Markup subscription instead of managing their own key.

---

### Future Backlog

- Brief editability before export
- Region select — drag a bounding box on the page to target an annotation
- Full page capture — stitch viewport screenshots into a single image
- VS Code extension — port core annotation logic to VS Code side panel
- Remote review mode — sync sessions to a builder via a backend
- Multi-device sync
- Cross-domain brief aggregation
- Note reorder (drag)
- Resizable panels
- Animation/interaction capture (GIF/WebM)

---

## Design Principles

**Voice-first.** Every interaction is designed around the assumption that the user's hands may be occupied. Whisper Flow types into whatever has focus. The floating in-page input exists because of this constraint.

**Brief is the product.** Notes are inputs. The Brief is the output. Every sprint decision filters through: does this make the Brief more useful?

**One surface.** No popup + side panel hybrid. The side panel is the entire UI. The in-page floating input is a focused exception — it solves the Chrome focus boundary problem and immediately hands back to the panel.

**Never lose work.** Three-snapshot backup before any destructive clear. Save-before-switching prompt. URL-keyed storage that survives tab closes and browser restarts.

**Simple Mode is not a reduced product.** It's a different product — for content reviewers, researchers, and non-technical users who don't need selectors or severity labels. The blank state says *Capture what you see*, not *This is a dev tool with training wheels.*

---

*Markup · getmarkup.dev · Built by Noah Levin*
