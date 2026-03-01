# Changelog

All notable changes to Markup are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### In Progress
- Sprint 5 — Persistence

---

## [0.0.4] — 2026-03-01

### Added
- Sprint 4 — Note Form + Auto-Save complete
- `src/sidebar/sidebar.js` — Full note lifecycle: init loads existing notes from `chrome.storage.local` on sidebar open; `ELEMENT_SELECTED` flushes any pending save then sets up new element (selector chip, textarea focus, type picker reset); `ELEMENT_DESELECTED` flushes and resets form; debounced save (500ms) writes to storage then resets form; `flushSave()` upserts note in memory array and persists; `deleteNote()` removes from array and storage; `renderNotesList()` renders NoteCard list, updates note count, manages empty state and generate button disabled state
- NoteCard rendering: type tag with emoji + label, selector chip, note text, delete button
- Form auto-resets after save with type picker restored to Bug default

---

## [0.0.3] — 2026-03-01

### Added
- Sprint 3 — Element Selection complete
- `package.json` + `build.js` — esbuild build system; `npm run build` outputs to `dist/`; load Chrome unpacked from `dist/`
- `.gitignore` — excludes `node_modules/` and `dist/`
- `src/content/content.js` — Full element selection: `css-selector-generator` bundled (IIFE, no CDN); hover highlight ring (2px solid #FF8400, position:fixed); click interception (`preventDefault` + `stopImmediatePropagation`); selector sent via `chrome.runtime.sendMessage`; scroll repositioning; Escape clears selection
- `src/sidebar/sidebar.js` — `chrome.runtime.onMessage` listener; selector chip updates on `ELEMENT_SELECTED`; textarea auto-focuses (Wispr Flow compatible); resets on `ELEMENT_DESELECTED`

---

## [0.0.2] — 2026-03-01

### Added
- Sprint 2 — Sidebar Shell complete
- `src/sidebar/sidebar.css` — Full design token system (all tokens from `review-ui.md`; no hardcoded colors); light and dark mode via `prefers-color-scheme`
- `src/sidebar/sidebar.html` — Full layout: header (title, note count, close button), notes list, note form (selector chip, type picker, textarea), generate button
- `src/sidebar/sidebar.js` — Close button (`window.close()`), type picker active state, `aria-pressed` toggling
- Empty state: "Click any element to annotate." shown when notes list is empty
- "Generate AI Brief" button disabled state until notes exist

---

## [0.0.1] — 2026-03-01

### Added
- Sprint 1 — Scaffold complete
- `src/manifest.json` — Manifest V3, all permissions declared (`storage`, `activeTab`, `scripting`, `sidePanel`, `host_permissions: <all_urls>`)
- `src/background.js` — Service worker; logs "Markup loaded"; registers side panel via `sidePanel.setOptions` and `setPanelBehavior`
- `src/sidebar/sidebar.html` — Side panel HTML; renders "Markup" heading
- `src/sidebar/sidebar.css` — Base styles scaffold
- `src/sidebar/sidebar.js` — Sidebar script scaffold
- `src/content/content.js` — Content script placeholder (Sprint 3)

---

## [0.1.0] — TBD
### Added
- Initial project setup
- Project plan and discovery documents
