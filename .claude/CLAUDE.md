# Markup — Claude Context

## Project

Chrome extension for annotating web pages. Side panel UI, content script selection, Wispr Flow voice notes, brief generation, screenshot capture.

**Current Sprint:** Sprint 11 (Pass 18 in progress)

---

## Stack

- Vanilla JS, no frameworks
- Chrome Extensions Manifest V3 (Side Panel API)
- esbuild for bundling content script only (`build.js`)
- `css-selector-generator` npm package
- `jszip` npm package (ZIP export)
- DM Sans / DM Mono / Lora / Playfair Display — **self-hosted** in `dist/fonts/`, not Google Fonts

## Key Files

| File | Purpose |
|---|---|
| `src/content/content.js` | Injected into pages. Hover ring, click selection, activate/deactivate, screenshot overlay, floating in-page note input. |
| `src/sidebar/sidebar.js` | Side panel UI logic. Notes state, storage, brief generation, exports, image handling, brief archive. |
| `src/sidebar/sidebar.html` | Side panel markup. |
| `src/sidebar/sidebar.css` | Side panel styles. Brand tokens, all components. |
| `src/background.js` | Service worker. Registers side panel. Handles `CAPTURE_SCREENSHOT` via `chrome.tabs.captureVisibleTab`. |
| `build.js` | esbuild script. Bundles content.js, copies sidebar/* and fonts/ as-is. |
| `dist/` | Build output. Load unpacked from here. |
| `docs/CHANGELOG.md` | Full sprint history for website/docs use. |

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
  id:             string,           // generateId() — Date.now().toString(36) + random
  url:            string,           // full URL where note was created
  selector:       string | null,    // CSS selector (Dev Mode; prioritizes ID → class → semantic → fallback)
  elementLabel:   string | null,    // human-readable label (aria-label → alt → innerText → tag+class)
  elementRole:    string | null,    // computed role (role attr → inferred from tag)
  parentContext:  string | null,    // one level up label; suppressed if mirrors child or is body/html/main
  elementName:    string | null,    // "General note" when no selector
  type:           "general" | "bug" | "design" | "copy" | "question",
  severity:       "critical" | "high" | "medium" | "low",  // default: "medium"
  text:           string,
  location:       string | null,    // user-set location field (both modes; pre-filled by selector/label in Dev)
  imagePath:      string | null,    // relative filename of saved image in the chosen folder
  imageThumbnail: string | null,    // base64 data URL (display only — stripped from JSON/CSV exports)
  createdAt:      number,           // Date.now()
}
```

Stored in `chrome.storage.local` under key `markup_notes_${normalizeUrl(url)}`.
Backups: `markup_backup_${normalizeUrl(url)}` — last 3 snapshots per URL (written before any destructive clear).

## Storage Keys

| Key | Value |
|---|---|
| `markup_notes_${normalizeUrl(url)}` | Note array per URL |
| `markup_backup_${normalizeUrl(url)}` | Last 3 backups per URL `{ timestamp, notes }[]` |
| `markup_session_${normalizeUrl(url)}` | Session title string per URL |
| `markup_dev_mode` | boolean — false = Simple Mode (default for new installs) |
| `markup_brief_sort` | `"severity"` or `"chronological"` |
| `markup_image_dir` | File System Access API folder handle for image storage |
| `markup_onboarding_dismissed` | boolean — onboarding welcome card dismissed |
| `markup_dev_intro_shown` | boolean — first Dev Mode activation toast shown |
| `markup_briefs_${hostname}` | Brief archive, last 20, newest first |
| `markup_ai_key` | (Sprint 12) user API key |
| `markup_ai_model` | (Sprint 12) `"gpt-4o"` or `"claude-sonnet"` |

---

## Severity System

Four levels: Critical / High / Medium (default) / Low.
- Severity picker in note form (Dev Mode only — 4 buttons, color-coded)
- Severity badge on every note card (Dev Mode only)
- Brief sorts by severity first (Critical → High → Medium → Low), then by type within each group
- Filter tabs above notes list: All / Critical / High / Medium / Low (Dev Mode only)
- Brief header includes severity summary

---

## Sprint History

| Sprint | What shipped |
|---|---|
| 1–2 | Core loop: toggle → select element → type note → save → storage by tabId |
| 3–4 | Undo/redo, edit mode, type picker (Bug/Design/Copy/?/General), empty state CTA |
| 5 | Content script fixes: cursor override, two-mode hover ring (dashed/solid), selector generation |
| 6 | Brief panel, general notes (no element required), auto-focus, session title, download .md |
| 7a | Brief renamed, back-to-notes, activation hints, clear selector, clear all, session title + URL in brief |
| 7b | Critical stability pass — 9 bugs fixed (URL-keyed storage, file:// support, activation sync, edit dedup, selector row visibility, deactivate reset, note label, session title persistence, backup safety net) |
| 9 | Full design system pass — logotype, filter tabs, note cards, severity system, brief output, settings, Simple Mode, edit mode, archive panel, bottom bar, export buttons, ESC pill, abbreviated filter tabs |
| 10 | Auto-save bug fix (ignoreNextDeselect), severity/type reset fix, Simple-first onboarding (default Simple, welcome card), self-hosted fonts, floating in-page note input (Chrome focus boundary fix), multi-page URL group headers, domain-scoped brief, domain-wide clear + individual delete, save-before-switch prompt, settings footer, HTML report logotype |
| 11 | Brief archive (last 20 per domain), brief sort toggle (severity/chronological), JSON + CSV export, location field (both modes), selector improvement (ID→class→semantic→fallback, skip Tailwind/framework attrs), note context enrichment (parentContext, elementRole, fullText), image paste + folder picker (File System Access API), note thumbnails + lightbox, ZIP with images, screenshot drag-to-select overlay, Wispr Flow settings section, voice notes link, panel mutual exclusion, clear-all confirmation, bottom bar flex-wrap fix, SELECT ELEMENT hidden in Simple Mode, mode chip → direct toggle with one-time Dev Mode toast, PDF export (replaces HTML) |

---

## Key Architectural Decisions

- **Storage keys are URL-based, not tab-based.** All `chrome.storage.local` keys use `normalizeUrl(url)` — strips `#hash` and trailing slash. Notes persist across tab closes and reopens.
- **Domain-scoped operations.** Notes list, brief generation, domain-wide clear, and empty state all operate at the hostname level — scanning all `markup_notes_` keys matching the same hostname.
- **Floating in-page note input.** Chrome's side panel is a separate browsing context — `focus()` from the sidebar cannot target the page. The textarea is injected into the page by the content script, which lives in the page context and can receive Wispr Flow input.
- **`window.__markupActive`** is the contract between content script and sidebar for reopen detection. Set true in `activate()`, false in `deactivate()`.
- **`deactivateReset()` vs `resetForm()`**: `deactivateReset()` preserves `noteInput.value`. `resetForm()` clears everything. Only use `resetForm()` after explicit user actions (save/cancel).
- **`ignoreNextDeselect` flag.** `deactivate()` in content.js always fires `ELEMENT_DESELECTED`. This flag is set before sending `MARKUP_DEACTIVATE` and caught at the top of the handler to prevent `flushSave()` being called on deactivation.
- **`file://` is a first-class supported scheme.** Not restricted. Treated same as http/https for injection.
- **No tab-close cleanup in background.js.** Notes live forever per URL. Backups are the safety net.
- **Brief is called "Brief" not "AI Brief".** Never use "AI" in UI copy.
- **SELECT ELEMENT is Dev Mode only.** Hidden via `applyDevMode()`. Screenshot is universal — always enabled in both modes.
- **Screenshot is injection-first and standalone.** The screenshot click handler checks if the content script is injected (same guard as SELECT ELEMENT toggle) and injects it if not. Screenshot mode is fully independent of element selection state.
- **Mode chip toggles directly.** Clicking DEV MODE / SIMPLE MODE chip in the header toggles mode without going to Settings. First switch to Dev Mode shows a one-time toast (stored in `markup_dev_intro_shown`). Mode is still accessible in Settings.
- **Selector quality layers:** ID → meaningful class (non-utility) → semantic tag+class → semantic tag → css-selector-generator fallback. Skip lists: Tailwind utility classes (`peer-*`, `group-*`, `has-*`, `aria-*`, `hover:`, `focus:`, etc.), framework-generated attributes (`data-w-id`, `data-reactid`, `data-v-*`, UUID/hash patterns).
- **Image storage via File System Access API.** User picks a folder once; handle persisted as `markup_image_dir`. All images written there as PNG. Thumbnails stored as base64 in the note only for in-extension display — stripped from JSON/CSV exports.
- **PDF export** uses the existing HTML report template opened in a new Chrome tab with an auto-print script injected before `</head>`. Browser's print-to-PDF handles rendering including embedded images. No jsPDF dependency.
- **JSZip** for ZIP export (brief.md + images/ folder).

---

## Product Context

- **Product:** Markup — getmarkup.dev
- **Repo:** github.com/noachlevin/getmarkup
- **Builder:** Noah Levin, CPO. One working hand, voice-first workflow via Wispr Flow.
- **Workflow:** Move fast, stay minimal, ship session by session.
- **Full loop (working):** Open sidebar → note-taking view → (Dev Mode: hover to preview → click to select element) → voice note via Wispr Flow into floating input OR type in sidebar → save → (optional: screenshot with drag-to-select) → generate Brief → copy or download PDF/ZIP.

---

## Export Options (current)

| Option | Format | What's included | Use case |
|---|---|---|---|
| Copy to clipboard | Plain text | Brief text, no images | Paste into Claude, Cursor, Linear |
| Download .md | Markdown | Brief text, no images | Dev handoff via text |
| Download .zip | ZIP (brief.md + images/) | All notes + screenshots | Full handoff package |
| Download PDF | PDF via print dialog | Full styled report + embedded images | Client sharing, AI upload |
| Export JSON | JSON | All domain notes (no imageThumbnail) | Programmatic use |
| Export CSV | CSV | id, url, type, severity, selector, elementLabel, location, parentContext, text, createdAt | Spreadsheet review |

---

## Launch Track

- [ ] Extension icon — 128×128 PNG + 16/32/48px set, gold/blue M, matches brand tokens
- [ ] Chrome Web Store submission — 5 screenshots at 1280×800, store listing copy, category, keywords
- [ ] Privacy policy page — required by Google, host at getmarkup.dev/privacy
- [ ] Demo video — 60 seconds, screen recording of full loop
- [ ] getmarkup.dev landing page — domain live, site not built
- [ ] README GIF demo + license badge
- [ ] CONTRIBUTING.md
- [ ] Product Hunt prep

---

## Sprint 12 Backlog — AI Brief

| Detail | Spec |
|---|---|
| Settings | API key input (OpenAI or Anthropic) + model selector stored as `markup_ai_key` and `markup_ai_model` |
| Trigger | "Generate Brief" — if key set, calls AI. If not, falls back to template brief with prompt to add key |
| Input | All domain-scoped notes formatted as structured context, passed as system prompt |
| Output | Streaming response. Sections: Summary, Critical Issues, Root Cause Analysis, Recommendations, Code Fixes |
| Streaming | Token by token into brief panel — same "BUILDING BRIEF…" loading state |
| Fallback | API failure → inline error + offer template brief |
| Privacy note | One-time disclosure in settings when user first adds a key |

---

## Sprint 12 — Note Context (capture-time additions)

- `viewportSize` — `window.innerWidth x window.innerHeight` at capture time
- `aboveFold` — boolean: `element.getBoundingClientRect().top < window.innerHeight`
- `boundingRect` — `{ x, y, width, height }` at capture time (enables cropped element screenshot)

## Sprint 13 — Element Screenshot

- Capture via `chrome.tabs.captureVisibleTab` cropped to `boundingRect`. Visual context beats all text.

---

## Backlog — No Sprint Assigned

- Think Aloud mode — real-time voice capture, notes auto-created at time of utterance
- VS Code Extension — port core annotation logic to VS Code side panel
- Remote Review groundwork — architecture planning
- Multi-device sync research spike
- Resizable panels
- Health/error ambient indicator in header
- Full page capture (stitch multiple viewport screenshots)
- Animation/interaction capture (GIF/WebM via MediaRecorder)
- Remote review mode (V3, requires backend)
- Brief editability before export
- Single-issue quick-fix copy mode
- XPath fallback for SPA resilience
- Note reorder (drag)
