# 05 — Ship

> Framework: Launch Checklist · Staged Rollout
> Goal: Get to users without breaking things and with maximum signal

---

## Environments

### Chrome Extension
| Env | What it is | How |
|---|---|---|
| **Development** | Load unpacked in Chrome | `chrome://extensions` → Developer mode → Load unpacked → `src/` |
| **Staging** | ZIP shared with testers | Package `src/` as `.zip`, share directly |
| **Production** | Chrome Web Store | Submit for review, publish |

### Website (getmarkup.dev)
| Env | What it is | URL |
|---|---|---|
| **Development** | Local Next.js | `localhost:3000` |
| **Preview** | Vercel preview deploy | `getmarkup-git-[branch].vercel.app` |
| **Production** | Live site | `getmarkup.dev` |

---

## Versioning

Follow **Semantic Versioning (SemVer):** `MAJOR.MINOR.PATCH`

| Change type | Example | Version bump |
|---|---|---|
| Breaking change | Remove a feature users rely on | MAJOR (1.0.0 → 2.0.0) |
| New feature, backward compatible | Add note type labels | MINOR (1.0.0 → 1.1.0) |
| Bug fix | Fix selector extraction | PATCH (1.0.0 → 1.0.1) |

**V1 roadmap:**
- `0.1.0` — Internal build (load unpacked)
- `0.5.0` — Private alpha (.zip shared with testers)
- `1.0.0` — Chrome Web Store launch
- `1.1.0` — V1.1 Should Haves (note type labels, highlight on click, single-note copy)
- `2.0.0` — Think Aloud (Mode 2)

---

## Staged Rollout Plan

### Stage 0 — Private Alpha
**Who:** 3-5 people from Discovery conversations who said yes
**How:** Share `src/` folder as a `.zip` — install via load unpacked in Chrome
**Goal:** Does the core loop work for real humans?
**Feedback:** Async — DM, email, or voice note
**Exit criteria:** No showstopper bugs reported

### Stage 1 — Public Beta
**Who:** Anyone who finds it
**How:** GitHub release with `.zip` download + load-unpacked instructions in README
**Announce:** One Twitter thread: "I built this, here's what it does, download here"
**Goal:** Catch edge cases, collect real usage patterns
**Exit criteria:** 10+ active installs, no critical bugs in 48 hours

### Stage 2 — Chrome Web Store Launch
**Who:** Chrome Web Store — full discoverability
**How:** Submit for review (usually 1-3 business days), publish
**Announce:** Full launch — Twitter, LinkedIn, Hacker News "Show HN", Product Hunt
**Goal:** 100 installs in week 1

---

## Pre-Launch Checklist

### Before You Write a Line of Code
- [ ] **Create Chrome Web Store developer account** — one-time $5 registration fee at [chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)

### Code
- [ ] All MVP acceptance criteria in `02-define/define.md` pass
- [ ] Regression checklist in `04-build/build.md` is clean
- [ ] No `console.error` or unhandled promise rejections in happy path
- [ ] Extension loads cleanly via load unpacked (no manifest errors)
- [ ] Tested on macOS (required)
- [ ] Tested on `localhost`, `file://`, and a live `https://` URL
- [ ] Node version pinned in `.nvmrc`

### Repository
- [ ] Repo is public on GitHub
- [ ] README has: what it is, load-unpacked install instructions, GIF demo, license
- [ ] LICENSE file present (MIT)
- [ ] CHANGELOG.md exists with v1.0.0 entry
- [ ] Contributing guide exists (CONTRIBUTING.md)
- [ ] Issues templates configured (Bug Report, Feature Request)

### Chrome Web Store Listing
- [ ] Extension icon: 128x128 PNG (store listing) + 16/32/48/128 in manifest
- [ ] Store description ≤ 132 characters (short description)
- [ ] Long description with screenshots (at least 3, 1280x800 or 640x400)
- [ ] Privacy policy URL (required — can be a simple GitHub Pages page)
- [ ] Category: `Productivity`
- [ ] Tags / keywords: `annotation`, `review`, `AI`, `developer`, `feedback`
- [ ] Publisher account verified with Google

### Website (getmarkup.dev)
- [ ] Homepage live with Chrome Web Store install CTA
- [ ] Docs: getting started guide
- [ ] Changelog page matches CHANGELOG.md
- [ ] Open Graph image for social sharing
- [ ] GitHub link prominent
- [ ] Noah Levin byline + about page

### Personal Brand
- [ ] Twitter thread written and scheduled
- [ ] LinkedIn post written
- [ ] Hacker News "Show HN" post drafted
- [ ] Product Hunt submission prepared (launch day)

---

## Feature Flags

Chrome extensions don't have VS Code settings. For MVP, no feature flags needed — the extension is all-or-nothing. If needed in V1.1, use `chrome.storage.local` to store user preferences:

```typescript
// Simple preference toggle — no external flag system needed
const prefs = await chrome.storage.local.get('preferences');
const isEnabled = prefs.preferences?.betaFeatures ?? false;
```

---

## CHANGELOG.md Format

```markdown
# Changelog

All notable changes to Markup are documented here.

## [1.0.0] — YYYY-MM-DD
### Added
- Click-to-annotate on any element on any URL (localhost, file://, live)
- Note types: Bug 🐛, Design 🎨, Copy ✍️, Question ❓
- Notes auto-save to chrome.storage.local — no backend, no account
- Notes scoped per URL — each page has its own note set
- Generate AI Brief — one-click structured fix instructions (Mode 1 format)
- Copy brief to clipboard in one click
- Works offline — no internet required
- Chrome Side Panel — native sidebar, no page injection conflicts

## [0.5.0] — YYYY-MM-DD
### Added
- Private alpha release (load unpacked)
- Core annotate → persist → brief loop working
### Known Issues
- SPA selector resilience not yet complete
```

---

## Launch Day Runbook

```
Before launch day:
  → Chrome Web Store review approved (submit 3+ days early)
  → getmarkup.dev deployed and tested
  → Twitter thread drafted and saved
  → LinkedIn post drafted
  → "Show HN" post drafted
  → Product Hunt listing prepared (midnight PT submission)

Launch day:
08:00 — Confirm Chrome Web Store listing is live
08:30 — Publish getmarkup.dev
09:00 — Post Twitter thread
09:30 — Post LinkedIn
10:00 — Submit "Show HN" to Hacker News (best time: 9–11am US Eastern)
12:00 — Launch on Product Hunt (submitted midnight PT the night before)
All day — Respond to every comment and reply
EOD    — Note install count, top questions, first bug reports
```
