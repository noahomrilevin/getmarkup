# 04 — Build

> Framework: Session-Based Sprints · Acceptance Criteria First · Ship/Don't Ship
> Goal: Build the Chrome extension MVP in sequential focused sessions. Done means done.

---

## Sprint Philosophy

**One sprint = one focused AI-assisted session.**
No fixed schedule. When a sprint ships, start the next one immediately.
Each sprint has a single clear goal and a binary ship/don't ship test.

**Workflow per sprint:**
1. Read `CLAUDE.md` + the relevant sprint section below
2. Build until all acceptance criteria pass
3. Run the regression checklist
4. Commit
5. Start the next sprint

**Starting point:** Zero code. No `src/` folder. Start fresh from Sprint 1.

---

## Sprint Brief Template

> Fill this out at the start of each session. Updates `CLAUDE.md` current sprint line.

```markdown
# Sprint [N] — [Name]
**Session Goal:** [One sentence. What does done look like?]

## Stories
| Story | Acceptance Criteria | Done? |
|---|---|---|
| [story] | [what makes it done] | [ ] |

## Out of Scope This Session
- [explicit exclusions]

## Definition of Done
- [ ] All acceptance criteria pass
- [ ] Regression checklist clean (from Sprint 3 onward)
- [ ] No console errors in happy path
- [ ] Code committed
- [ ] CHANGELOG.md updated
```

---

## Sprint Plan — Chrome Extension MVP

### Sprint 1 — Scaffold
**Goal:** Extension loads in Chrome, Side Panel opens on icon click, no errors.

**Key decisions baked in:**
- Manifest V3 (`"manifest_version": 3`)
- Chrome Side Panel API (`chrome.sidePanel`) — native, Chrome 114+
- `"file_urls": true` permission requested at install — no prompting later
- Permissions: `"storage"`, `"activeTab"`, `"scripting"`, `"sidePanel"`, `"host_permissions": ["<all_urls>"]`

| Story | Acceptance Criteria | Done? |
|---|---|---|
| Create manifest.json | Manifest loads without errors; all required permissions declared | [x] |
| Background service worker | Service worker registers without errors; logs "Markup loaded" | [x] |
| Register Side Panel | `chrome.sidePanel.setOptions` sets `sidebar.html` as the panel path | [x] |
| Open panel on icon click | Clicking the extension icon opens the Side Panel | [x] |
| sidebar.html renders | Panel shows "Markup" heading — not blank, not an error page | [x] |
| GitHub repo set up | Public repo, README with load-unpacked instructions | [ ] |

**File structure after this sprint:**
```
src/
├── manifest.json
├── background.js          ← service worker
├── sidebar/
│   ├── sidebar.html
│   ├── sidebar.css
│   └── sidebar.js
└── content/
    └── content.js         ← empty placeholder
```

**Ship / Don't Ship:** Ship if panel opens and shows content. Don't ship if panel is blank or Chrome shows manifest errors.

---

### Sprint 2 — Sidebar Shell
**Goal:** Sidebar renders the full UI structure with correct design tokens. Empty state looks right.

| Story | Acceptance Criteria | Done? |
|---|---|---|
| Design tokens in sidebar.css | All tokens from `skills/review-ui.md` applied; no hardcoded colors | [x] |
| Sidebar layout renders | Header, notes list, form area, and generate button all visible | [x] |
| Empty state | When no notes exist, sidebar shows "Click any element to annotate" | [x] |
| Note count in header | Header shows "0 notes" when empty | [x] |
| Close button | X button in header closes the Side Panel | [x] |
| Light/dark mode | Sidebar respects `prefers-color-scheme` | [x] |

**Ship / Don't Ship:** Ship if sidebar renders correctly in both light and dark mode. Don't ship if layout is broken or tokens are hardcoded.

---

### Sprint 3 — Element Selection
**Goal:** User can click any element on the page and see its selector appear in the sidebar.

**Library:** Use `css-selector-generator` (npm) for CSS selector generation. Bundle it into the content script — do not CDN-load it (CSP issues).

| Story | Acceptance Criteria | Done? |
|---|---|---|
| Content script injects | `content.js` runs on every page; logs "Markup content script ready" | [x] |
| Click interception | Clicking any element does NOT navigate or fire default — Markup intercepts | [x] |
| CSS selector generated | `css-selector-generator` returns a unique selector for any clicked element | [x] |
| Selector sent to sidebar | Content script posts selector to sidebar via `chrome.runtime.sendMessage` | [x] |
| Selector appears in sidebar | Note form shows the selector of the last-clicked element | [x] |
| Highlight ring on hover | Orange ring (`2px solid #FF8400`) appears on element under cursor | [x] |
| Highlight ring on click | Ring stays on clicked element while note form is active | [x] |
| Escape removes highlight | Pressing Escape removes highlight ring and clears the selected element | [x] |

**Ship / Don't Ship:** Ship if clicking any element shows its selector in the sidebar with a visible highlight. Don't ship if selector is wrong, missing, or crashes on SPAs.

---

### Sprint 4 — Note Form + Auto-Save
**Goal:** User can write and save a note attached to a selected element.

| Story | Acceptance Criteria | Done? |
|---|---|---|
| Note textarea auto-focuses | When element is selected, textarea in sidebar focuses immediately (Wispr Flow-compatible) | [x] |
| Type picker renders | Bug / Design / Copy / Question buttons visible; Bug selected by default | [x] |
| Type picker works | Clicking a type button makes it active; only one active at a time | [x] |
| Note saves on input | Note saves to `chrome.storage.local` as user types (debounced 500ms) | [x] |
| Note appears in list | Saved note renders as a NoteCard in the notes list above the form | [x] |
| NoteCard shows type tag | Tag with emoji + label (e.g. "🐛 Bug") appears on the card | [x] |
| NoteCard shows selector | SelectorChip shows the element selector on the card | [x] |
| Delete note | Delete button on NoteCard removes note from storage and UI | [x] |
| Form resets after save | After note saves, form clears and shows "Click an element to select it" | [x] |

**Ship / Don't Ship:** Ship if a note can be created, saved, and deleted. Don't ship if notes don't appear in list or storage write fails.

---

### Sprint 5 — Persistence
**Goal:** Notes survive tab refresh, Chrome restart, and are scoped per URL.

| Story | Acceptance Criteria | Done? |
|---|---|---|
| Notes scoped to URL | Notes for `localhost:3000/` don't appear on `localhost:3000/settings` | [ ] |
| Notes persist on refresh | Reload the tab → notes still in sidebar | [ ] |
| Notes persist on Chrome restart | Close Chrome entirely, reopen → notes still in sidebar | [ ] |
| Works on localhost | Extension works on `localhost:3000` (and any port) | [ ] |
| Works on `file://` URLs | Extension works on local HTML files opened in Chrome | [ ] |
| Works on any live URL | Extension works on `https://example.com` | [ ] |
| URL normalization | `https://example.com/page` and `https://example.com/page?ref=x` use the same note set | [ ] |
| Storage approaching limit | If `chrome.storage.local` usage > 4MB, show a warning in sidebar | [ ] |

**Ship / Don't Ship:** Ship if notes survive a full Chrome restart and are correctly scoped to the URL. Don't ship if notes bleed across URLs or vanish on refresh.

---

### Sprint 6 — AI Brief
**Goal:** One click generates a formatted brief and copies it to clipboard.

| Story | Acceptance Criteria | Done? |
|---|---|---|
| "Generate AI Brief" button | Button in sidebar footer; disabled when 0 notes | [ ] |
| Brief compiles all notes | All notes included, sorted: Bug → Design → Copy → Question | [ ] |
| Brief matches Mode 1 format exactly | Output matches spec in `02-define/define.md` and `skills/brief-format.md` | [ ] |
| Brief displays in sidebar | Brief text renders in a monospace panel within the sidebar | [ ] |
| One-click copy | "Copy" button copies full brief text to clipboard | [ ] |
| Copy confirmation | Button label changes to "Copied!" for 2 seconds after copy | [ ] |
| "Back to notes" | User can return from brief view to note list | [ ] |
| Clear all notes | "Clear all" button with confirmation dialog deletes all notes for this URL | [ ] |

**Ship / Don't Ship:** Ship if brief generates, displays, and copies correctly. Don't ship if format doesn't match spec exactly or copy fails.

---

### Sprint 7 — Edge Cases + Accessibility
**Goal:** No crashes, no lost notes, keyboard-accessible, works everywhere.

| Story | Acceptance Criteria | Done? |
|---|---|---|
| SPA resilience | Selectors work after React/Vue re-renders; XPath fallback if CSS selector breaks | [ ] |
| Shadow DOM injection | Sidebar CSS doesn't leak into host page; host page styles don't affect sidebar | [ ] |
| CSP-hostile sites | Extension works on sites with strict Content Security Policy | [ ] |
| iframe annotation | Iframes clearly flagged as "cannot annotate" — no crash | [ ] |
| Keyboard: Tab navigation | All interactive elements reachable by Tab | [ ] |
| Keyboard: Escape | Escape closes note input / removes highlight | [ ] |
| Keyboard: Copy brief | Cmd/Ctrl+Shift+C copies brief | [ ] |
| Focus rings | All interactive elements show visible focus ring | [ ] |
| Reduced motion | No animations that can't be disabled; respects `prefers-reduced-motion` | [ ] |
| aria-labels | All icon-only buttons have descriptive `aria-label` | [ ] |
| Error states | Storage write failure, permission denied, and script injection failure all show friendly errors | [ ] |

**Ship / Don't Ship:** Ship if regression checklist passes on all URL types. Don't ship if keyboard navigation is broken or selectors crash on SPAs.

---

### Sprint 8 — Launch Prep
**Goal:** Extension is presentable and ready for load-unpacked distribution.

| Story | Acceptance Criteria | Done? |
|---|---|---|
| Extension icon | 16px, 32px, 48px, 128px PNG icons — orange Markup mark | [ ] |
| manifest.json metadata | Name, description, version, icons all correct | [ ] |
| README updated | README explains load-unpacked install + core workflow with screenshots | [ ] |
| CHANGELOG.md entry | `0.1.0` entry with what shipped | [ ] |
| Regression checklist passes | All items in checklist below are clean | [ ] |

**Ship / Don't Ship:** Ship if the extension can be loaded unpacked by someone who has never seen it before and they can complete the core loop without instruction.

---

## Regression Checklist

Run before every sprint commit from Sprint 3 onward:

- [ ] Load extension unpacked in Chrome — no manifest errors
- [ ] Open Side Panel on a live URL (`https://example.com`) — renders correctly
- [ ] Open Side Panel on `localhost:3000` — works
- [ ] Open Side Panel on a `file://` URL — works
- [ ] Click an element → selector appears in form, highlight ring shows
- [ ] Type a note → appears in notes list, NoteTypeTag correct
- [ ] Refresh the tab → note still in sidebar
- [ ] Close and reopen Chrome → note still in sidebar
- [ ] Navigate to a different URL → different (or empty) note set
- [ ] Generate AI Brief → format matches spec exactly
- [ ] Copy brief → clipboard contains correct text
- [ ] Delete a note → gone from list and storage
- [ ] Clear all → confirmation dialog appears, all notes removed

---

## TDD — Lightweight AI-Assisted Version

No formal TDD. Instead:
1. Write acceptance criteria first (done — they're in the sprints above)
2. Say to Claude: "Write Jest tests for these acceptance criteria before we implement"
3. Claude writes tests — all fail
4. Say: "Now write the implementation to pass these tests"
5. Tests pass — commit

### Test layers

| Layer | What to test | Tool |
|---|---|---|
| Unit | `generateBrief()`, selector extraction, URL normalization, storage read/write | Jest |
| Integration | Content script ↔ sidebar messaging, storage persistence | Chrome Extension testing with `jest-chrome` |
| Manual | Full loop on localhost, file://, live URL | Regression checklist above |

---

## Tech Debt Tracker

> Log tech debt honestly. Don't pretend it doesn't exist.

| Item | Where | Priority | Notes |
|---|---|---|---|
| XPath fallback not implemented | content.js | Medium | Add in Sprint 7 |
| `css-selector-generator` bundle size | content.js | Low | Check if it bloats the content script |
| No error boundary in sidebar | sidebar.js | Medium | Add for V1.1 |

---

## Ship / Don't Ship — Global

**Ship when:**
- All MVP acceptance criteria in `02-define/define.md` pass
- Regression checklist is clean
- No console errors in happy path
- CHANGELOG.md has an entry for this version

**Don't ship when:**
- Notes are lost or corrupted
- Core loop (click → annotate → brief) is broken on any supported URL type
- Extension crashes on install or causes the browser tab to break

---

## Backlog — Deferred Features

| Feature | Description | Sprint candidate |
|---|---|---|
| Viewport toggle | Let users preview page at common device widths (mobile 375px, tablet 768px, desktop 1280px) from inside the sidebar. Useful for responsive bug annotation. | Sprint 7 |
| Refresh / reinitialize button | A button in the sidebar that re-injects the content script without requiring a manual page refresh. Solves the intermittent activation issue for users who don't know to refresh. | Sprint 7 |
| Remote review mode | Tester uses Markup on a staging URL, session syncs back to the builder. Requires backend or sync layer. | V3 |
| Screenshot on note | Automatically capture a screenshot of the selected element when a note is saved. Attaches as context to the AI brief. | Sprint 8 |
| Mobile/desktop viewport simulator | Trigger Chrome's device emulation programmatically from the sidebar so users can annotate responsive issues without opening DevTools. | Sprint 8 |
