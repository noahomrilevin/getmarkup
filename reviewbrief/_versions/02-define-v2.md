# 02 — Define

> Framework: Jobs To Be Done · User Story Mapping · MoSCoW Prioritization
> Goal: Draw the exact boundary of what we're building and what we're not
> Platform: Chrome Extension (Manifest V3) — MVP

---

## Jobs To Be Done (JTBD)

> "When I _____, I want to _____, so I can _____."

### Primary Job
**When I** finish a build session and open my app in Chrome to review it,
**I want to** capture exactly what's wrong, attached to the element I'm looking at,
**so I can** give Claude one clean brief and get the right fixes back first time.

### Supporting Jobs

| When I... | I want to... | So I can... |
|---|---|---|
| Spot a visual issue while scrolling | Click it and leave a note instantly | Not break my flow or lose the context |
| Want to speak my note out loud | Dictate into the note field via Wispr Flow | Review hands-free without typing |
| Finish annotating a review session | Generate a structured AI prompt | Paste it and get fixes without re-explaining |
| Only have one issue to fix right now | Copy just that note as a quick brief | Not wait until I've reviewed everything |
| Come back to a project after a break | See my saved notes for that URL | Remember exactly what needed fixing |
| Review on localhost, staging, or a live URL | Have the tool work on any tab | Not need to set anything up per project |

---

## User Story Map

### Epic 1 — Activate
> User can turn ReviewBrief on for any tab

| Story | Points | Priority |
|---|---|---|
| As a user, I can click the ReviewBrief icon in the Chrome toolbar to open the sidebar | 2 | Must |
| As a user, the sidebar opens without reloading the page | 2 | Must |
| As a user, the sidebar works on localhost URLs (e.g. `localhost:3000`) | 3 | Must |
| As a user, the sidebar works on `file://` URLs (local HTML files opened in Chrome) | 2 | Must |
| As a user, the sidebar works on any live URL | 1 | Must |
| As a user, I can close the sidebar without losing my notes | 1 | Must |

### Epic 2 — Annotate
> User can attach notes to specific elements

| Story | Points | Priority |
|---|---|---|
| As a user, I can click any element on the page to open a note input | 5 | Must |
| As a user, my note shows the element's CSS selector automatically | 3 | Must |
| As a user, I can label a note as Bug / Design / Copy / Question | 2 | Should |
| As a user, I can type or dictate my note (Wispr Flow works in the input field) | 1 | Must |
| As a user, I can see all my notes listed in the sidebar | 3 | Must |
| As a user, each note in the sidebar shows the element name and issue type | 2 | Should |
| As a user, I can delete or edit an existing note | 2 | Must |
| As a user, clicking a note in the sidebar highlights the annotated element on the page | 3 | Should |

### Epic 3 — Persist
> Notes survive tab refresh and browser restart

| Story | Points | Priority |
|---|---|---|
| As a user, notes auto-save as I type — no save button | 2 | Must |
| As a user, my notes are still there after I refresh the page | 3 | Must |
| As a user, my notes are still there after I close and reopen Chrome | 3 | Must |
| As a user, notes are scoped to the URL (different URLs have separate note sets) | 3 | Must |
| As a user, I can clear all notes for the current URL | 1 | Must |

### Epic 4 — Generate Brief
> User can generate structured fix instructions for AI

| Story | Points | Priority |
|---|---|---|
| As a user, I can click "Generate AI Brief" to compile all notes into one brief | 5 | Must |
| As a user, the brief outputs in the exact format ready to paste into Claude | 3 | Must |
| As a user, I can copy the full brief to clipboard in one click | 1 | Must |
| As a user, I can copy a single note as a quick brief for one-at-a-time fixing | 2 | Should |
| As a user, the brief includes element selectors, issue type, and my description | 3 | Must |
| As a user, the brief shows the page URL and timestamp | 1 | Must |

### Epic 5 — VS Code Extension (Phase 2)
> Same workflow inside VS Code for developers who prefer the editor

| Story | Points | Priority |
|---|---|---|
| As a developer, I can open a webview panel showing a local file or localhost URL | 5 | Phase 2 |
| As a developer, my notes sync between Chrome extension and VS Code | 8 | Phase 2 |
| As a developer, the AI brief generates in the same format as the Chrome version | 3 | Phase 2 |

### Epic 6 — Voice (V2)
> Built-in mic so users can speak notes without a third-party tool

| Story | Points | Priority |
|---|---|---|
| As a user, I can click a mic button in the note input to dictate my note | 5 | V2 |
| As a user, my spoken note is transcribed and auto-filled into the note field | 5 | V2 |
| As a user, ReviewBrief infers the issue type from my spoken note and pre-fills the label | 8 | V3 |

---

## MoSCoW Prioritization — Chrome Extension MVP

### Must Have (ship nothing without these)
- Extension activates on any Chrome tab (localhost, `file://`, any URL)
- Click-to-annotate on any element
- Note auto-captures element CSS selector
- Note input works with Wispr Flow and any dictation tool
- Notes auto-save to `chrome.storage.local`
- Notes persist across tab refresh and Chrome restart
- Notes scoped per URL
- Generate AI Brief → matches exact format below
- One-click copy to clipboard
- No login, no account, no telemetry

### Should Have (V1.1 — ship soon after)
- Note type labels: Bug / Design / Copy / Question
- Highlighted element when note is clicked in sidebar
- Single-note quick copy ("Fix just this")
- Note count badge on the extension icon
- Clear-all notes confirmation dialog

### Could Have (V2)
- Built-in mic / voice transcription
- Screenshot attached to note
- Note priorities (High / Medium / Low)
- Export brief as `.md` file download
- Dark mode sidebar

### Won't Have (explicitly out of scope — never suggest these)
- Real-time collaboration
- Cloud sync or remote note storage
- Jira / Linear / GitHub Issues integration
- AI that auto-generates fixes (we output the brief, not the fix)
- Support for non-web projects
- VS Code extension features in the Chrome MVP sprint
- Auto-screenshot or DOM snapshot

---

## AI Brief Output Format

This is what the tool produces. This format is the entire point. It is non-negotiable.

```markdown
# ReviewBrief — Fix Instructions
**Project:** [tab title or URL]
**Reviewed:** [date] at [time]
**Total Issues:** [n]

---

## 🐛 Bug — High Priority
**Element:** `.hero-section .cta-button`
**Selector:** button.cta-button
**Issue:** Button overflows its container on mobile (< 375px)
**Expected:** Button should be full-width with 16px horizontal padding

---

## 🎨 Design
**Element:** `nav .logo`
**Selector:** header nav img.logo
**Issue:** Logo appears pixelated — probably not using @2x asset
**Expected:** Crisp on retina displays

---

## ✍️ Copy
**Element:** `.pricing-section h2`
**Selector:** section.pricing h2
**Issue:** Headline says "Our Plans" — too generic
**Expected:** Something that speaks to the value, e.g. "Pick what fits"

---

## ❓ Question
**Element:** `.footer`
**Selector:** footer
**Issue:** Should the footer appear on the /dashboard route?
**Decision needed:** Yes / No
```

### Format Rules
- Each issue is a level-2 heading with emoji + type
- Emoji key: 🐛 Bug · 🎨 Design · ✍️ Copy · ❓ Question
- Element is the human-readable name (derive from selector if needed)
- Selector is the actual CSS selector captured on click
- Issue describes what's wrong — user's exact words preferred
- Expected describes the desired state; for Questions, use "Decision needed"
- Issues output in priority order: Bug → Design → Copy → Question

---

## Acceptance Criteria — Chrome Extension MVP

The MVP ships when ALL of the following are true:

- [ ] Extension installs from Chrome Web Store (or unpacked for dev)
- [ ] Clicking the extension icon opens a sidebar on the active tab
- [ ] Sidebar opens on `localhost:3000` (and any localhost port)
- [ ] Sidebar opens on `file://` URLs (local HTML files)
- [ ] Sidebar opens on any live URL
- [ ] Clicking any element on the page opens a note input in the sidebar
- [ ] Note input is pre-filled with the element's CSS selector
- [ ] Wispr Flow (and any dictation tool) works inside the note input
- [ ] Notes auto-save — no data loss on refresh
- [ ] Notes persist after closing and reopening Chrome
- [ ] Each URL has its own note set (notes don't bleed across tabs)
- [ ] "Generate AI Brief" produces the exact format above
- [ ] Brief copies to clipboard on one click
- [ ] Tool works without internet connection
- [ ] No login, no account, no telemetry without opt-in

---

## Technical Constraints — Chrome Extension

These shape the implementation decisions in Build:

| Constraint | Decision |
|---|---|
| Manifest V3 required (MV2 deprecated) | Use `chrome.scripting` for content scripts, service worker for background |
| `chrome.storage.local` has 5MB limit | Trim old sessions if approaching limit; warn user |
| Content Security Policy blocks inline scripts on some sites | Inject notes UI via isolated shadow DOM |
| Element selectors break if the page re-renders (SPAs) | Generate both CSS selector and XPath; use whichever survives |
| Cross-origin iframes can't be accessed | Annotate top-level frame only in MVP; flag iframes clearly |
| `file://` URLs need `"file_urls"` permission | Request this permission explicitly in manifest |

---

## Wispr Flow Integration — MVP Approach

ReviewBrief does not build voice in V1. Instead:

1. **In-sidebar prompt:** "Tip — use Wispr Flow or any dictation app. Click the note field and speak."
2. **No special integration required** — Wispr Flow types into any focused `<input>` or `<textarea>`. The note field just needs to be a standard element.
3. **Mentioned in README and reviewbrief.dev** as the recommended companion tool.

This delivers 90% of the voice value with 0% implementation cost in V1.

---

## Out of Scope — Formal Statement

To keep scope honest, these are explicitly not in the Chrome MVP:

- We do not fix anything — we only brief
- We do not sync notes to any cloud
- We do not connect to Jira, Linear, or any PM tool
- We do not record screens or generate screenshots automatically
- We do not require Node.js, Python, or any backend to run
- We do not build a VS Code extension in this sprint
- We do not build voice transcription in this sprint (Wispr Flow covers it)
