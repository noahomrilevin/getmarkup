# Changelog

All notable changes to Markup are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### In Progress
- Sprint 3 — Element Selection

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
