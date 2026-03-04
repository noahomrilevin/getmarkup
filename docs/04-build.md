# Markup — Build Log

## Sprint History

| Sprint | Description |
|---|---|
| 1–2 | Core loop shipped: toggle → select → note → storage |
| 3–4 | Undo/redo, edit mode, type picker, empty state |
| 5 | Content script fixes: cursor override, hover ring modes |
| 6 | Brief panel, general notes, auto-focus, storage by tabId |
| 7a | Brief renamed, back-to-notes, smarter hints, clear selector, clear all, download .md, session title + URL |
| 7b | Critical stability pass: 9 bugs fixed. Storage keys moved from tabId to normalizeUrl(url). file:// support. Auto-reactivate on sidebar reopen (window.__markupActive). Edit-in-place duplicate fix. Selector row hidden at startup. noteInput preserved through deactivation (deactivateReset). General note label scoped to General type only. URL-keyed session title. writeBackup() safety net before clear all. |
| 8 (v0.8.0) | Power Features: brief history (collapsible), chrome badge count, Alt+M shortcut, storage quota warning, human-readable element labels, in-page annotation markers, relative timestamps, hover-to-highlight, error boundary (safeGet/safeSet), settings panel, mode selector (later removed). |
| 8.1 (v0.8.1) | Global Brief Archive (max 50, all URLs, rename, open in reader), brief sort pill toggle (moved from settings), mode selector removed (hard-coded Self Review), Ctrl+Shift+M shortcut, window globals namespaced for extension isolation, escapeHtml single-quote fix. |

---

## Backlog

| Feature | Description | Target |
|---|---|---|
| Brief history | Users can browse and restore previously generated briefs. Briefs saved to chrome.storage with timestamps. UI shows list of past briefs per tab. | Sprint 8 |
| Resizable panels | Drag handle between notes feed and form area to resize. CSS resize or custom drag implementation. | Sprint 8 |
| Health/error detection | Self-monitoring system that detects when content script fails to inject, when storage is full, when messages fail silently. Shows ambient status indicator in header. | Sprint 8 |
| Design excellence pass | Full visual and interaction review asking: what would make this feel world-class? Micro-animations, transitions, spacing refinement, type scale audit. | Sprint 9 |
| Screenshot on note | Capture a screenshot of the selected element when saving a note. Attaches as base64 image reference in the brief. Uses chrome.tabs.captureVisibleTab cropped to element bounds. | Sprint 8 |
| Full page capture | Capture the entire page including below the fold by stitching multiple viewport screenshots. Useful for layout reviews. Could use a library like html2canvas injected via content script. | Sprint 9 |
| Animation/interaction capture | Record a short screen capture (5-10 seconds) of an interaction and convert to GIF or WebM. Attach to note for animating bugs, hover states, transitions. Could use MediaRecorder API on the tab's stream via chrome.tabCapture. Brief would include the file reference or base64 embed. | V2 |
| Remote review mode | Tester uses Markup on a staging URL, session syncs back to builder. Requires backend or sync layer. | V3 |
| Self-host Google Fonts | Self-host DM Sans, DM Mono, and Playfair Display as .woff2 files in dist/. Remove CDN `<link>` tags from sidebar.html. Eliminates external network dependency, works offline and on restricted pages. | Sprint 10 |
