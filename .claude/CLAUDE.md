# Markup — Claude Context

## Project

Chrome extension for annotating web pages. Side panel UI, content script selection, Wispr Flow voice notes, brief generation, screenshot capture.

**Current Sprint:** Sprint 11 Complete (Pass 23 done) — Pre-launch

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
| 11 ✅ | Brief archive (last 20 per domain), brief sort toggle (severity/chronological), JSON + CSV export, location field (both modes), selector improvement (ID→class→semantic→fallback, skip Tailwind/framework attrs), note context enrichment (parentContext, elementRole, fullText), image paste + folder picker (File System Access API), note thumbnails + lightbox, ZIP with images, screenshot drag-to-select overlay, Wispr Flow settings section, voice notes link, panel mutual exclusion, clear-all confirmation, bottom bar flex-wrap fix, SELECT ELEMENT hidden in Simple Mode, mode chip → direct toggle with one-time Dev Mode toast, PDF export (replaces HTML) |

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
- **Repo:** github.com/noahomrilevin/getmarkup
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

## Versioning

SemVer: `MAJOR.MINOR.PATCH`

| Version | Milestone |
|---|---|
| `0.9.1` | Current — Sprint 11 complete + pre-launch bug fixes |
| `0.9.0` | Sprint 11 shipped |
| `1.0.0` | Chrome Web Store launch |
| `1.1.0` | Post-launch: single-issue quick-copy, V2 polish based on user feedback |
| `2.0.0` | Think Aloud (built-in mic, real-time voice notes) |
| `3.0.0` | Remote Review (requires backend) |

---

## Customer ICPs

**Primary — Non-developer vibe coder**
Cannot read CSS/HTML. Relies entirely on Claude/Cursor to fix visual issues. Reviews output in Chrome, not VS Code. Highest acute pain — building without any QA safety net. Examples: PMs building internal tools, designers who vibe code, non-technical indie founders. Only reachable via Chrome extension.

**Secondary — Solo developer who vibe codes for speed**
Can read code but uses AI as a partner. Needs batch-fix briefs. Already has CLAUDE.md workflow — Markup fits naturally. Comfortable with VS Code. Reachable via Chrome extension first, VS Code extension later.

**Tertiary**
Freelancers reviewing deliverables before client handoff. Accessibility auditors doing quick passes.

**Not in scope**
Large teams with PM-driven issue tracking (they have Jira/Linear). Non-web developers.

---

## Competitive Position

The gap nobody has filled: Chrome extension that works on localhost, captures element-attached notes, and outputs structured AI briefs.

| Tool | Works on localhost? | Visual annotation? | AI output? |
|---|---|---|---|
| Jam.dev | ❌ | ✅ | ❌ |
| BugHerd | ❌ | ✅ | ❌ |
| Loom | ✅ | ❌ (video) | ❌ |
| **Markup** | **✅** | **✅** | **✅** |

---

## Launch Track

### Pre-Launch Checklist

**Extension**
- [ ] Extension icon — 128×128 PNG + 16/32/48px set, gold/blue M, matches brand tokens
- [ ] No console errors on clean load
- [ ] Tested on localhost, file://, and live https://
- [ ] Node version pinned in `.nvmrc`

**Repository**
- [ ] README: what it is, load-unpacked install instructions, GIF demo, MIT license
- [ ] LICENSE file present (MIT)
- [ ] CHANGELOG.md has v1.0.0 entry
- [ ] CONTRIBUTING.md exists
- [ ] GitHub repo is public

**Chrome Web Store**
- [ ] Short description (132 chars): `Annotate any page on localhost or live. Generate an AI fix brief. Paste into Claude, Cursor, or Copilot.`
- [ ] Long description (~500 words)
- [ ] 5 screenshots at 1280×800: (1) sidebar with notes, (2) brief generated, (3) brief pasted into Claude, (4) element selection ring on real page, (5) settings/archive panel
- [ ] Privacy policy live at getmarkup.dev/privacy
- [ ] Category: Productivity. Keywords: annotation, review, AI, developer, feedback
- [ ] Publisher account verified

**Site (getmarkup.dev)**
- [ ] Landing page live — see `reviewbrief/05-ship/landing-page-plan.md` for full spec
- [ ] `/privacy` page live (required for store submission)
- [ ] Open Graph image (1200×630)
- [ ] "Add to Chrome" CTA links to live store listing

**Demo + Distribution**
- [ ] Demo GIF — 60 seconds: open sidebar → select element → voice note → generate brief → copy. This is the critical path blocker for the landing page hero.
- [ ] Twitter thread written
- [ ] LinkedIn post written
- [ ] Hacker News "Show HN" post drafted
- [ ] Product Hunt listing prepared (midnight PT submission)
- [ ] Substack launch article written (personal story angle: built with one arm + Wispr Flow)

### Launch Day Runbook

```
Before launch day:
  → Chrome Web Store review approved (submit 3+ days early — review can take 1–7 days)
  → getmarkup.dev deployed and tested
  → All posts drafted and saved

Launch day (Tuesday or Wednesday for best PH performance):
08:00 — Confirm Chrome Web Store listing is live
08:30 — Publish getmarkup.dev
09:00 — Post Twitter thread
09:30 — Post LinkedIn
10:00 — Submit "Show HN" to Hacker News (best time: 9–11am US Eastern)
12:01am PT (night before) — Submit Product Hunt listing
All day — Respond to every comment and reply
EOD    — Note install count, top questions, first bug reports
```

**Product Hunt timing:** Launch on PH within 2–4 weeks of Chrome Store go-live. After 6 weeks the "new" energy fades. If more time passes, frame it as a significant update instead.

---

## AI Brief — Evaluate Post-Launch (Not Scheduled)

**Decision deferred.** The brief output is already structured for AI consumption (severity, selector, element context, location, parent context). Users who paste it into Claude or ChatGPT get better analysis than any in-extension AI layer could produce. Adding an in-extension AI Brief adds: API key friction, cost per brief, complexity, and a narrower output than a user's own AI conversation.

**Revisit after launch** with real user data. If users consistently report that they want a one-click AI analysis without leaving the extension, and the brief-to-AI handoff is genuinely friction-heavy, then spec it then. The only scenario that earns it is a future backend integration enabling "fix this in Cursor" workflows — which is a much larger product bet.

**If you're reading this in a future session:** do not build the AI Brief unless Noah has explicitly greenlit it based on post-launch feedback. Check with Noah first.

---

## Sprint 12 — Note Context (capture-time additions)

- `viewportSize` — `window.innerWidth x window.innerHeight` at capture time
- `aboveFold` — boolean: `element.getBoundingClientRect().top < window.innerHeight`
- `boundingRect` — `{ x, y, width, height }` at capture time (enables cropped element screenshot)

## Sprint 13 — Element Screenshot

- Capture via `chrome.tabs.captureVisibleTab` cropped to `boundingRect`. Visual context beats all text.

---

## Known Code Issues — Pending Fix

All Sprint 11 known bugs resolved in Pass 23. No confirmed open bugs as of v0.9.1.

| # | File | Issue | Impact | Status |
|---|---|---|---|---|
| 1 | `sidebar.js` | PDF Google Fonts @import | Medium | ✅ Fixed Pass 22 |
| 2 | `sidebar.js` | `persistAllNotes()` orphaned key | Low | ✅ Fixed Pass 23 |
| 3 | `sidebar.js` | `isMultiUrl` dead declarations | Low | ✅ Fixed Pass 23 |
| 4 | `sidebar.js` | Settings clear-all page-only scope | Medium | ✅ Fixed Pass 23 |

---

## End of Sprint Protocol — Run Every Sprint Without Exception

Run every item below before calling a sprint done.

### 1. Git
- [ ] All src/ changes staged and committed: `feat: sprint [N] — [one line summary]`
- [ ] Pushed to origin main
- [ ] Clean working tree: `git status` shows nothing to commit

### 2. QA
- [ ] Core loop tested: note-taking → save → generate brief → export
- [ ] Tested in both Simple Mode and Dev Mode
- [ ] Tested on at least 2 URLs (one localhost or file://, one live https://)
- [ ] No console errors on clean load

### 3. Docs (do not skip)
- [ ] CHANGELOG.md updated
- [ ] CLAUDE.md **Current Sprint** line updated (top of file)
- [ ] CLAUDE.md **Sprint History table** updated with new row
- [ ] CLAUDE.md **Known Code Issues** updated — bugs fixed removed, new bugs added
- [ ] Any changed skill files in `.claude/skills/` updated to match new behavior
- [ ] Storage Keys table updated if any new keys were added
- [ ] Note Data Model updated if any fields changed

### 4. Self-Review
- [ ] Open Markup on a real site and use it to review something
- [ ] Generate a brief from that session
- [ ] Any bugs found go into Known Code Issues before closing

---

## SYNC PROTOCOL — How to Keep This File Current

**Why it fell out of sync:** CLAUDE.md was written once at Sprint 9 and never updated across 18+ passes because each Claude Code session ran a pass and moved on without a documentation step.

**The rule going forward:** At the end of every sprint (not every pass), Claude must update this file before the session closes. Specifically:

- **Sprint History table** — add the sprint row with a one-line summary of what shipped
- **Current Sprint** — update the sprint number and pass at the top
- **Note Data Model** — update if any fields were added, removed, or changed
- **Storage Keys** — update if any new keys were added
- **Key Architectural Decisions** — add a bullet if a new pattern was established
- **Known Code Issues** — add confirmed bugs, remove fixed ones
- **Skill files** (`.claude/skills/*.md`) — update the relevant skill file whenever the feature it documents changes significantly

**For future projects:** Apply this same structure from the start. Keep one CLAUDE.md per project. Never duplicate context between a parent folder file and a project file — the project file is the source of truth. The parent folder file (if any) should only say "this folder contains [project] at [path]" and nothing else.

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
