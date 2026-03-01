# 02 — Define

> Framework: Jobs To Be Done · User Story Mapping · MoSCoW Prioritization  
> Goal: Draw the exact boundary of what we're building and what we're not

---

## Jobs To Be Done (JTBD)

> "When I _____, I want to _____, so I can _____."

### Primary Job
**When I** finish a build session and review my local HTML or running app,  
**I want to** capture exactly what's wrong, attached to the element I'm looking at,  
**so I can** give Claude one clean brief and get the right fixes back first time.

### Supporting Jobs

| When I... | I want to... | So I can... |
|---|---|---|
| Spot a visual issue while scrolling | Click it and leave a note instantly | Not break my flow or lose the context |
| Finish annotating a review session | Generate a structured AI prompt | Paste it and get fixes without re-explaining |
| Come back to a project after a break | Read my saved review notes | Remember exactly what needed fixing |
| Share my work-in-progress with myself | Have a lightweight local preview | Not need to deploy just to review |

---

## User Story Map

### Epic 1 — Preview
> User can view their local file or localhost app inside the tool

| Story | Points | Priority |
|---|---|---|
| As a user, I can open a local .html file in the preview panel | 3 | Must |
| As a user, I can enter a localhost URL and see it render | 2 | Must |
| As a user, the preview refreshes when I save the file | 3 | Should |
| As a user, I can toggle between mobile and desktop viewport sizes | 2 | Could |

### Epic 2 — Annotate
> User can attach notes to specific elements

| Story | Points | Priority |
|---|---|---|
| As a user, I can click any element in the preview to open a note input | 5 | Must |
| As a user, my note shows the element's CSS selector automatically | 3 | Must |
| As a user, I can label a note as Bug / Design / Copy / Question | 2 | Should |
| As a user, I can see all my notes as pins overlaid on the preview | 3 | Should |
| As a user, I can delete or edit an existing note | 2 | Must |

### Epic 3 — Save
> Notes persist and sync to markdown files

| Story | Points | Priority |
|---|---|---|
| As a user, notes auto-save to a `.review-notes/` folder in my project | 5 | Must |
| As a user, each review session is saved as a dated .md file | 3 | Must |
| As a user, I can see a list of past review sessions | 2 | Could |
| As a user, notes survive VS Code restarts and reopens | 3 | Must |

### Epic 4 — AI Brief
> User can generate structured fix instructions for AI

| Story | Points | Priority |
|---|---|---|
| As a user, I can click "Generate AI Brief" to compile all notes | 5 | Must |
| As a user, the brief outputs in a format ready to paste into Claude | 3 | Must |
| As a user, I can copy the brief to clipboard in one click | 1 | Must |
| As a user, I can choose between "full brief" and "priority only" output | 2 | Could |
| As a user, the brief includes element selectors, issue type, and description | 3 | Must |

### Epic 5 — Chrome Extension (Phase 2)
> Same workflow in the browser for any live or local URL

| Story | Points | Priority |
|---|---|---|
| As a user, I can activate ReviewBrief on any browser tab | 5 | Phase 2 |
| As a user, my notes sync to a local folder via native messaging | 8 | Phase 2 |
| As a user, the AI brief generates the same format as the VS Code version | 3 | Phase 2 |

---

## MoSCoW Prioritization — MVP

### Must Have (MVP blockers — ship nothing without these)
- Local HTML file preview in VS Code webview
- Click-to-annotate on any element
- Note saves element selector + user text
- Auto-save to `.review-notes/[date].md`
- Generate AI Brief button → copy to clipboard
- Notes persist between sessions

### Should Have (V1.1 — ship soon after)
- Localhost URL preview
- Note type labels (Bug / Design / Copy)
- Visual pin overlay on preview
- Mobile/desktop viewport toggle
- Past sessions list

### Could Have (V2 — if users ask for it)
- Chrome extension
- Screenshot attached to note
- Note priorities
- Dark/light theme toggle for preview
- Export brief as file

### Won't Have (explicitly out of scope forever or until major pivot)
- Real-time collaboration
- Cloud sync
- Jira/Linear integration
- AI that auto-generates fixes (we output the brief, not the fix)
- Support for non-web projects

---

## AI Brief Output Format (the product's core artifact)

This is what the tool produces. This format is the entire point.

```markdown
# ReviewBrief — Fix Instructions
**Project:** my-landing-page  
**Reviewed:** 2025-03-01 at 14:32  
**Total Issues:** 4

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

---

## Acceptance Criteria — MVP

The MVP ships when all of the following are true:

- [ ] User can open a local .html file and see it render in VS Code panel
- [ ] Clicking an element opens a note input pre-filled with its selector
- [ ] Notes save automatically — no manual save step
- [ ] Closing and reopening VS Code shows existing notes
- [ ] "Generate AI Brief" produces the exact format above
- [ ] Brief copies to clipboard on one click
- [ ] Notes are stored as readable .md files in the project folder
- [ ] Tool works without internet connection
- [ ] No login, no account, no telemetry without opt-in

---

## Out of Scope — Formal Statement

To keep scope honest, these are explicitly not in V1:

- We do not fix anything — we only brief
- We do not require a deployed site
- We do not sync to any cloud
- We do not connect to Jira, Linear, or any PM tool
- We do not record screens or generate screenshots automatically
- We do not require Node.js, Python, or any backend to run
