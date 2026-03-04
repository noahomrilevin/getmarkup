# Markup — Claude Context

## Project

Chrome extension for annotating web pages. Side panel UI, content script selection, Whisper Flow voice notes, brief generation.

**Current Sprint:** Sprint 10

---

## Stack

- Vanilla JS, no frameworks
- Chrome Extensions Manifest V3 (Side Panel API)
- esbuild for bundling content script only (`build.js`)
- `css-selector-generator` npm package
- DM Sans / DM Mono / Playfair Display (Google Fonts)

## Key Files

| File | Purpose |
|---|---|
| `src/content/content.js` | Injected into pages. Hover ring, click selection, activate/deactivate. Exposes `window.__markupReady` and `window.__markupActive`. |
| `src/sidebar/sidebar.js` | Side panel UI logic. Notes state, storage, brief generation, undo/redo. |
| `src/sidebar/sidebar.html` | Side panel markup. |
| `src/sidebar/sidebar.css` | Side panel styles. Brand tokens, all components. |
| `src/background.js` | Service worker. Registers side panel. No tab-close cleanup (notes are URL-keyed). |
| `build.js` | esbuild script. Bundles content.js, copies sidebar/* as-is. |
| `dist/` | Build output. Load unpacked from here. |

## Build

```
npm run build
```

Output goes to `dist/`. Load unpacked from `dist/` in Chrome.

---

## Design Tokens

Defined in `:root` of `sidebar.css`. Key vars: `--ink`, `--paper`, `--gold`, `--deep-blue`, `--mid-blue`, `--slate`, `--warm-white`. Font vars: `--font-body` (DM Sans), `--font-mono` (DM Mono), `--font-display` (Playfair Display).

## Note Data Model

```js
{
  id:          string,           // generateId() — Date.now().toString(36) + random
  selector:    string | null,    // CSS selector from css-selector-generator
  elementName: string | null,    // "General note" when no selector
  type:        "general" | "bug" | "design" | "copy" | "question",
  severity:    "critical" | "high" | "medium" | "low",  // default: "medium"
  text:        string,
  createdAt:   number,           // Date.now()
}
```

Stored in `chrome.storage.local` under key `markup_notes_${normalizeUrl(url)}`.
Backups: `markup_backup_${normalizeUrl(url)}` — last 3 snapshots per URL (written before any destructive clear).

## Severity System (shipped Sprint 9 prep)

Four levels: Critical / High / Medium (default) / Low.
- Severity picker in note form (4 buttons, color-coded, below type picker)
- Severity badge on every note card (alongside type tag)
- Brief sorts by severity first (Critical → High → Medium → Low), then by type within each group
- Filter tabs above notes list: All / Critical / High / Medium / Low
- Brief header includes severity summary: `N Critical · N High · N Medium · N Low`

---

## Sprint History

| Sprint | What shipped |
|---|---|
| 1–2 | Core loop: toggle → select element → type note → save → storage by tabId |
| 3–4 | Undo/redo, edit mode, type picker (Bug/Design/Copy/?/General), empty state CTA |
| 5 | Content script fixes: cursor override, two-mode hover ring (dashed/solid), selector generation |
| 6 | Brief panel, general notes (no element required), auto-focus, session title, download .md |
| 7a | Brief renamed (not "AI Brief"), back-to-notes, activation hints, clear selector, clear all, session title + URL in brief |
| 7b | Critical stability pass — 9 bugs fixed (see below) |
| 9 | Full design system pass — logotype, filter tabs, note cards, severity system, brief output, settings, Simple Mode, edit mode, archive panel, bottom bar, export buttons, ESC pill, abbreviated filter tabs, side-by-side bottom buttons, Simple-first onboarding spec |

---

## Sprint 7b — Bugs Fixed (March 2026)

All fixes shipped. Build clean.

**Bug 1 — Notes lost on tab switch (CRITICAL)**
Storage key changed from `markup_notes_${tabId}` to `markup_notes_${normalizeUrl(url)}`.
`normalizeUrl` strips `#hash` and trailing slash. Notes now follow the URL, not the ephemeral tab. `background.js` no longer deletes notes on tab close — they persist permanently by URL.

**Bug 2 — file:// pages blocked**
Removed `file://` from `isRestricted` list in `sendToggle()`. Added `file://` to `isNormalPage` check. Injection path now works for local files. Manifest already had `file_urls` permission.

**Bug 3 — Activation lost on sidebar reopen**
Content script now exposes `window.__markupActive` (true when active, false when not). `init()` runs `executeScript` to check this on load. If true, calls `setToggleState(true)` without requiring a toggle click. Sidebar auto-syncs to ON when content script was already active.

**Bug 4 — Duplicate note on edit + clear selector**
`clearSelectorBtn` handler no longer clears `currentNoteId`. In edit mode, `currentNoteId` stays set so `flushSave()` updates in place. Also: `flushSave()` now updates `selector` and `elementName` on the note in the edit path, so clearing an element during edit is properly reflected.

**Bug 5 — Selector row visible at startup (OFF state)**
`selectorRow.hidden = true` on script load. Row only shown on `setToggleState(true)`, on `enterEditMode()`, and on hover/select messages. Hidden on `deactivateReset()`.

**Bug 6 — Note cleared when Markup deactivates**
New `deactivateReset()` function: like `resetForm()` but leaves `noteInput.value` untouched. `setToggleState(false)` now calls `deactivateReset()` instead of `resetForm()`. Secondary fix: `ELEMENT_DESELECTED` `.then()` callback only clears `noteInput` if `markupActive` is still true — prevents the async callback from wiping text after `deactivateReset()` has preserved it.

**Bug 7 — "General note" label on wrong types**
`createNoteCard()` only renders the `general-note-label` span when `note.type === "general"` AND no selector. Bug/Design/Copy/? notes with no element show nothing in the location area.

**Bug 8 — Session title lost on tab switch**
Session title storage key changed from `markup_session_title_${tabId}` to `markup_session_${normalizeUrl(url)}`. Same URL → same title across any tab.

**Bug 9 — Safety net backup**
`writeBackup()` persists `{ timestamp, notes }` to `markup_backup_${normalizeUrl(url)}` before any destructive clear. Keeps last 3 snapshots per URL. Both `get()` and `set()` are properly awaited. Logged to console. Called from "Clear all" confirm handler before `notes = []`.

---

## Key Architectural Decisions

- **Storage keys are URL-based, not tab-based.** All `chrome.storage.local` keys use `normalizeUrl(url)` — strips `#hash` and trailing slash. Notes and session titles persist across tab closes and reopens.
- **`window.__markupActive`** is the contract between content script and sidebar for reopen detection. Set true in `activate()`, false in `deactivate()`.
- **`deactivateReset()` vs `resetForm()`**: `deactivateReset()` preserves `noteInput.value`. `resetForm()` clears everything. Only use `resetForm()` after explicit user actions (save/cancel).
- **`file://` is a first-class supported scheme.** Not restricted. Treated same as http/https for injection.
- **No tab-close cleanup in background.js.** Notes live forever per URL. Backups are the safety net.
- **Brief is called "Brief" not "AI Brief".** Never use "AI" in UI copy.

---

## Product Context

- **Product:** Markup — getmarkup.dev
- **Repo:** github.com/noachlevin/getmarkup
- **Builder:** Noah Levin, CPO. One working hand, voice-first workflow via Whisper Flow.
- **Workflow:** Move fast, stay minimal, ship session by session.
- **Full loop (working):** Toggle ON → hover to preview → click to select element → voice note via Whisper Flow → type or edit → save → generate Brief → copy or download .md.

---

## Sprint 8 Backlog (from docs/04-build.md)

| Feature | Description |
|---|---|
| Brief history | Browse and restore previously generated briefs. Saved to storage with timestamps. List per URL. |
| Resizable panels | Drag handle between notes feed and form. CSS resize or custom drag. |
| Health/error detection | Detect when content script fails, storage full, messages fail silently. Ambient status indicator in header. |
| Screenshot on note | Capture selected element on save using `chrome.tabs.captureVisibleTab` cropped to element bounds. Attach as base64 in brief. |
| Design excellence pass | Micro-animations, transitions, spacing, type scale audit. Sprint 9. |
| Full page capture | Stitch multiple viewport screenshots for full-page layout review. Sprint 9. |
| Animation/interaction capture | Record 5-10s clip as GIF/WebM via MediaRecorder. Attach to note. V2. |
| Remote review mode | Sync session to builder via backend or sync layer. V3. |

---

## Sprint 10 Backlog — Feature Polish + Export Architecture

### Screenshot Storage
| Detail | Spec |
|---|---|
| Folder picker | File System Access API — user chooses local folder once ("Markup Screenshots folder") |
| Persistence | Folder handle persisted in `chrome.storage.local` as `markup_screenshot_dir` |
| Capture trigger | On note save: if element selected, capture via `chrome.tabs.captureVisibleTab`, crop to element bounds, save as PNG |
| Filename format | `markup-[domain]-[timestamp]-[noteIndex].png` |
| Note model change | Each note gains optional `screenshotPath` field |
| Fallback | If no folder chosen, screenshot capture skipped silently — never blocks note saving |

### Export Options (replacing single Download .md)

**OPTION 1 — Copy to Clipboard** (shipped Sprint 10, was pre-existing)
- Plain text, no images
- Serves: P1 Builder, P4 QA Engineer
- For pasting into Claude, Cursor, Linear

**OPTION 2 — Download .zip** (stub shipped Sprint 10; full impl pending JSZip)
- Contents: `brief.md` + `/images/` folder with all screenshots
- Markdown image refs use relative paths: `![screenshot](images/markup-001.png)`
- If no screenshots exist, `.zip` contains only `brief.md`
- Filename: `markup-brief-[domain]-[YYYY-MM-DD].zip`
- Stub falls back to `.md` download with console warning until JSZip added
- Serves: P2 Product Designer, P3 Freelancer
- For developer handoff and client audits

**OPTION 3 — Download .html report** (shipped Sprint 10)
- Single self-contained HTML file; screenshots base64-embedded as inline images (when available)
- Styled with Markup design system: `--deep-blue #1A2744`, `--gold #C9A84C`, `--paper #F5F0E8`, `--warm-white #FAF8F3`, `--ink #0D0D0D`, `--slate #6B7A99`
- Font stack: DM Sans for UI, Georgia/Lora for body, DM Mono for selectors
- Structure: header (title + URL + date + mode), severity summary chips, notes grouped by severity, each note shows selector (Dev Mode only), type chip, note text, screenshot if exists
- Opens in any browser, no renderer needed
- Filename: `markup-report-[domain]-[YYYY-MM-DD].html`
- Serves: P3 Freelancer, P5 Content Reviewer
- For sending to clients and non-technical stakeholders

### (5d) Simple-First Onboarding

- Default mode flipped to **Simple** for all new installs (existing users with a mode already set in storage are unaffected)
- `firstInstall` flag written to `chrome.storage.local` on first open; never shown again once dismissed
- On first open: one-time inline welcome card at top of sidebar (not a modal):
  - Copy: *"You're in Simple Mode. For element selection, severity tagging, and structured briefs — enable Dev Mode in settings."*
  - CTA button: `OPEN SETTINGS →` — navigates to settings panel and permanently dismisses the card
- DEV / SIMPLE chip in the header is made clickable — tapping it jumps directly to the mode toggle in the settings panel
- Storage key: `markup_onboarding_dismissed` (boolean) — set `true` on dismiss; card never re-appears

### Additional Sprint 10 Items

- **Fix auto-save on SELECT ELEMENT click** — clicking SELECT ELEMENT while textarea has unsaved text should NOT trigger a save. Text should be preserved in the textarea.

- **Multi-page URL group headers** — when notes exist across multiple URLs on the same domain, show URL group headers in the notes list. Current page gets a gold left border.

- **Self-host fonts** — bundle DM Sans, DM Mono, Lora, and Playfair Display locally instead of loading from Google Fonts. Eliminates external dependency and works offline.

- **HTML report polish** — add Markup logotype to the report header in the exported HTML file.

---

## Launch Track (runs parallel to Sprint 10–11)

- [ ] Extension icon — 128×128 PNG + 16/32/48px set, gold/blue M, matches brand tokens
- [ ] Chrome Web Store submission — 5 screenshots at 1280×800, store listing copy, category, keywords
- [ ] Privacy policy page — required by Google, host at getmarkup.dev/privacy
- [ ] Demo video — 60 seconds, screen recording of full loop
- [ ] getmarkup.dev landing page — domain live, site not built
- [ ] README GIF demo + license badge
- [ ] CONTRIBUTING.md
- [ ] Product Hunt prep

---

## Sprint 11 Backlog

- [ ] Think Aloud mode — real-time voice capture, notes auto-created with element context at time of utterance
- [ ] VS Code Extension — port core annotation logic to VS Code side panel
- [ ] Remote Review groundwork — architecture planning only, no implementation
- [ ] Brief export formats — JSON, CSV, plain text in addition to existing .md and .html
- [ ] Multi-device sync research spike — evaluate minimal backend requirements, document tradeoffs
- [ ] Image paste on note — Cmd+V while note focused, stored via File System Access API, shown as thumbnail, included in ZIP and HTML export
- [ ] Simple Mode "Where on the page?" field — optional plain-text location context below textarea
- [ ] Selector improvement — replace :nth-child() chains with meaningful CSS selectors (ID, class, semantic tag)
- [ ] Cross-domain brief aggregation — single brief across multiple URLs on same domain

---

## Sprint 12 Backlog — AI Brief

### AI-Generated Brief (user API key)

The current brief is template-based — it formats notes into structured markdown. Sprint 12 replaces this with a real AI-generated analysis using the user's own API key. No backend, no Markup account required.

| Detail | Spec |
|---|---|
| Settings | API key input field (OpenAI or Anthropic) + model selector (gpt-4o, claude-sonnet) stored in `chrome.storage.local` as `markup_ai_key` and `markup_ai_model` |
| Trigger | "Generate Brief" button — if API key is set, calls AI. If not, falls back to current template brief with a prompt to add a key in settings |
| Input | All domain-scoped notes (selector, type, severity, text) formatted as structured context, passed as a system prompt |
| Output | Streaming response rendered into the brief panel. Sections: **Summary**, **Critical Issues**, **Root Cause Analysis**, **Recommendations**, **Code Fixes** (where applicable) |
| Streaming | Response streams token by token into the brief panel — same "BUILDING BRIEF…" loading state, then content appears progressively |
| Fallback | If API call fails (bad key, rate limit, offline), show error inline and offer to generate template brief instead |
| Subscription path (V2) | Future: Markup proxies the API call via a backend, user pays a Markup subscription instead of managing their own key |
| Privacy note | Notes are sent to the chosen AI provider. Display a one-time disclosure in settings when the user first adds a key. |

---

## Backlog — No Sprint Assigned

- Brief editability before export
- Single-issue quick-fix copy mode
- Undo / recover from mistakes
- XPath fallback for SPA resilience
- Note reorder (drag)
- Resizable panels
- Health/error ambient indicator in header
- Full page capture (stitch multiple viewport screenshots)
- Animation/interaction capture (GIF/WebM via MediaRecorder)
- Remote review mode (V3, requires backend)
