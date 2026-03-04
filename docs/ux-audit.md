# Markup — UX Audit
> Updated after Sprint 6. Two personas. Full walkthrough.

---

## Personas

**Persona A — Solo Vibe Coder**
Building their own app with AI. Reviewing their own work, capturing what's broken, generating a brief to paste into Claude or Cursor. May use Wispr Flow for voice input. Working fast, probably alone.

**Persona B — User Interview Facilitator**
Sitting with a tester on a page. Capturing everything the tester says — both element-specific and general reactions — in real time. Needs it organized and ready to hand to AI afterward.

---

## Flow Walkthroughs

### First open — is it clear what to do?

**A + B:** Opens side panel from Chrome toolbar. Sees: header (Markup, 0 notes, toggle OFF) and empty state: "Ready to annotate? / Turn Markup on to start selecting elements." with a gold "Turn Markup On" button. **Clear.** No ambiguity.

---

### Turning Markup on — does it work reliably?

**A + B:** Clicks "Turn Markup On" (empty state) or header toggle. Toggle pings `window.__markupReady` via `chrome.scripting.executeScript`. Content script confirms with `MARKUP_ACTIVATED`. Button state is confirmation-driven — correct.

**Latent desync:** `markupActive` always starts `false` in sidebar (fresh on each open). If Markup was left active and user closes/reopens the panel, toggle shows OFF. Content script is still active. Requires double-toggle to resync. Not critical but discoverable.

**chrome:// pages:** Now handled correctly — shows "Markup can't run on this page." Fixed in Sprint 6.

---

### Hovering and selecting elements

**A + B:** Hovering shows dashed orange ring + live selector preview in chip. Click locks ring to solid orange, textarea focused, save enabled.

**Edge cases still present:**
- Clicking the same element twice deselects it — toggle behavior. Intuitive for A, accidental for B in fast capture.
- SPAs with key-based re-renders: `selectedEl` can become a detached DOM node. Ring jumps to (0,0) on scroll.
- Dynamic sticky headers: capture-phase click intercepts everything; elements behind sticky nav get captured even if user intended scroll.

---

### Voice notes via Wispr Flow

**A + B:** After `softReset()`, textarea now auto-focuses (fixed in Sprint 6). Wispr Flow dictation continues without manual re-focus after each save. **Voice flow is unblocked.**

General notes (Markup ON, no element selected): textarea has no auto-focus on activation. B must manually click into field before first voice note. Minor friction.

---

### General notes with no element selected

**A + B:** Works. Save button enabled with Markup ON, any text. Note saves with `selector: null, elementName: "General note"`. NoteCard now shows italic "General note" label (fixed Sprint 6) so the card is visually distinct from element-anchored notes.

---

### Saving a note

**A:** Cmd+Enter discovered after a few saves. Voice flow is now unblocked (auto-focus). **Good.**

**B:** Fast capture: type → Cmd+Enter → speak next note → Cmd+Enter. Flow is now smooth. "Cmd+Enter to save" hint visible.

---

### Reviewing saved notes

**A + B:** Notes as cards — type tag, selector chip or "General note" label, text. Delete one click. Edit one click (fills form, Update Note button).

**Remaining issues:**
- No timestamps shown.
- Selector chips show raw CSS — no human-readable name.
- No filtering or grouping by type.
- Hovering a NoteCard doesn't re-highlight the element on page.

---

### Generating the brief

**A + B:** Clicking "Generate Brief" (enabled when notes > 0) opens the brief panel in the sidebar. Brief panel fills the middle column with:
- Gold toolbar: "← Back to Notes" link, "Copy to Clipboard" button, "Download .md" button
- Scrollable `<pre>` block in deep-blue with warm-white DM Mono text

Brief format:
```
# Markup — Fix Instructions

**Project:** [tab title]
**Reviewed:** [day, date] at [time]
**Mode:** Self Review
**Total Issues:** [n]

---

## 🐛 Bug
**Element:** [selector or "General note"]
**Selector:** [selector]  ← omitted for general notes
**Issue:** [note text]

---
```

Sections ordered: Bug → Design → Copy → Question → General. Only sections with notes are included.

"Copy to Clipboard" button shows "Copied!" feedback for 2 seconds. Returns to normal view via "← Back to Notes". **Core brief flow is shipped.**

---

## Summary

### What Works Well — Preserve

- Confirmation-driven toggle (no race condition)
- Hover ring: dashed = hover intent, solid = selected
- Cursor override injection for `cursor: none` sites
- General notes (null selector) — pure voice capture works
- Auto-focus after save via `softReset()` — voice flow unblocked
- Soft reset keeps element highlighted for rapid sequential notes
- Empty state as activation prompt
- Brief: structured output, prioritized by type, session title + URL as project metadata
- tabId-based storage: per-tab isolation, SPA-safe, auto-cleaned on tab close
- Undo/redo (edit + delete) with toast feedback
- Edit inline (Update Note flow)

---

### Friction Points

1. **Mode label hardcoded "Self Review"** — Persona B needs a "User Interview" option.
2. **No visual indicator on annotated elements on page** — can't see at a glance what's already been annotated.
3. **Brief shows cryptic CSS selectors as Element names** — no human-readable fallback.
4. **Sidebar/content state desync on reopen** — toggle shows OFF even if content script is active; double-toggle to fix.
5. **No timestamp on notes** — hard to reconstruct session sequence for Persona B.
6. **No URL-change listener** — if user navigates within same tab (SPA), notes from new URL never load automatically.

---

### Broken States (Post Sprint 6)

| State | Status |
|---|---|
| chrome:// page toggle | Fixed — "Markup can't run on this page." |
| General note card missing label | Fixed — italic "General note" label shown |
| Auto-focus after save | Fixed — `noteInput.focus()` in `softReset()` |
| Generate Brief has no handler | Fixed — brief panel ships |
| Storage leaks on tab close | Fixed — `chrome.tabs.onRemoved` cleanup |
| Storage scoped by URL | Fixed — now scoped by tabId |
| Stale `selectedEl` on SPA re-render | Still present — Sprint 7 candidate |
| State desync on panel reopen | Still present — Sprint 7 candidate |

---

### Sprint 7 Candidates

| Priority | Issue |
|---|---|
| High | State sync on panel reopen (store markupActive in chrome.storage.session) |
| Medium | Human-readable element name in note and brief (from tagName + text content or aria-label) |
| Medium | In-page annotation markers (numbered badges on annotated elements, update on scroll) |
| Medium | Mode selector in brief toolbar (Self Review / User Interview) |
| Low | Refresh brief when notes change while panel open |
| Low | Filter/group notes by type in the notes list |
| Low | Export brief as .md file download — shipped Sprint 7 |
| Low | Timestamp on note cards |
