# 03 — Design

> Approach: Lightweight. Minimal. Easy to use. Design details can evolve — get the structure right first.
> Design system: `markup.pen` (Pencil file at `/markup/markup.pen`)

## Design Philosophy

Markup's design is intentionally lightweight and minimal. The priority is ease of use, not visual polish. Ship functional and clean first — refined design comes later. No decorative elements, no animations, no complexity that doesn't serve a direct user need.

---

## Core Layout — Chrome Extension Sidebar

Markup injects a sidebar into the right side of the active tab. The page content shifts left. No popup, no new tab — always in context.

```
┌──────────────────────────────────────┬─────────────────────┐
│                                      │  MARKUP             │
│   USER'S PAGE                        │  ─────────────────  │
│   (shifts left when sidebar opens)   │  🐛 .hero h1        │
│                                      │  Font too large     │
│   ← highlighted element ring        │                     │
│      appears on click                │  🎨 nav .logo       │
│                                      │  Pixelated retina   │
│                                      │  ─────────────────  │
│                                      │  [note input]       │
│                                      │  [Bug][Design][Copy]│
│                                      │  ─────────────────  │
│                                      │  [Generate Brief ↗] │
└──────────────────────────────────────┴─────────────────────┘
```

**Sidebar width:** 320px fixed
**Sidebar position:** Right edge of viewport, full height
**Page interaction:** User clicks elements on the page normally — Markup intercepts the click

---

## Design Tokens — From markup.pen

Use these variables from the design system. Do not invent new colors.

### Typography
```
--font-primary: JetBrains Mono    ← selectors, code, brief output
--font-secondary: Geist           ← UI labels, note text, everything else
```

### Core Colors
```
--background:          #F2F3F0  (light) / #111111  (dark)
--foreground:          #111111  (light) / #FFFFFF   (dark)
--card:                #FFFFFF  (light) / #1A1A1A   (dark)
--muted:               #F2F3F0  (light) / #2E2E2E   (dark)
--muted-foreground:    #666666  (light) / #B8B9B6   (dark)
--border:              #CBCCC9  (light) / #2E2E2E   (dark)
--primary:             #FF8400  (both)              ← orange, primary CTA
--primary-foreground:  #111111  (both)
--sidebar:             #E7E8E5  (light) / #18181B   (dark)
--sidebar-border:      #CBCCC9  (light) / #FFFFFF1A (dark)
```

### Semantic / State Colors
```
--color-error:            #E5DCDA  bg  /  #8C1C00 fg   (light)
--color-success:          #DFE6E1  bg  /  #004D1A fg   (light)
--color-warning:          #E9E3D8  bg  /  #804200 fg   (light)
--color-info:             #DFDFE6  bg  /  #000066 fg   (light)
--destructive:            #D93C15
```

### Brand Palette (ap- tokens — use sparingly, website/marketing)
```
--ap-ink:         #0D0D0D    ← deep heading text
--ap-paper:       #F5F0E8    ← warm page background
--ap-gold:        #C9A84C    ← brand accent
--ap-deep-blue:   #1A2744
--ap-mid-blue:    #2D4A8A
--ap-slate:       #6B7A99    ← secondary text
```

### Shape
```
--radius-m:    16px
--radius-pill: 999px
```

---

## Note Type Colors

Map Markup's issue types to semantic colors from the design system:

| Type | Emoji | Color token | Usage |
|---|---|---|---|
| Bug | 🐛 | `--color-error` | Red-tinted background, error foreground |
| Design | 🎨 | `--color-info` | Blue-tinted background, info foreground |
| Copy | ✍️ | `--color-warning` | Amber-tinted background, warning foreground |
| Question | ❓ | `--muted` | Neutral muted background |
| Think Aloud | 🗣️ | `--color-success` | Green-tinted background (V2) |

---

## Component Map — What Exists vs. What Needs Building

### Available in markup.pen (use directly)

| Need | Use from design system |
|---|---|
| Primary action button ("Generate Brief") | `Button / Primary` |
| Secondary action ("Clear notes") | `Button / Secondary` |
| Destructive action ("Delete note") | `Button / Ghost` + `--destructive` color |
| Icon-only buttons (copy, edit, delete) | `Icon Button / Ghost` |
| Note text input | `Textarea` |
| Status/state labels | `Badge / Lane`, `Badge / Success`, etc. |
| Alerts and error states | `Alert / Error`, `Alert / Info` |
| Confirm clear-all dialog | `Confirm Dialog` |
| Sidebar container background | `--sidebar` token |

### Markup-Specific Components — Need to Build

These don't exist in the design system and need to be designed and built:

| Component | Description | Priority |
|---|---|---|
| `<NoteTypeTag>` | Colored pill with emoji + label (Bug / Design / Copy / Question) | MVP |
| `<SelectorChip>` | JetBrains Mono display of CSS selector, small, truncated | MVP |
| `<NoteCard>` | NoteTypeTag + SelectorChip + note text + edit/delete actions | MVP |
| `<NoteForm>` | Textarea + NoteTypeTag picker + auto-save indicator | MVP |
| `<BriefPanel>` | Generated markdown in monospace, full-width, with copy button | MVP |
| `<ElementHighlight>` | Injected CSS ring on the hovered/clicked page element | MVP |
| `<RecordingButton>` | Mic icon with idle / recording / processing states (V2) | V2 |
| `<ThinkAloudCard>` | Variant of NoteCard for 🗣️ Think Aloud observations (V2) | V2 |

These will be designed in markup.pen when we reach the Build phase. Keep them simple — the existing tokens handle color, font, and shape.

---

## Accessibility — WCAG 2.1 AA

The tool must be fully usable with one hand and keyboard only. This isn't just a goal — it's a personal requirement.

### Keyboard Navigation
- [ ] All interactive elements reachable by Tab
- [ ] Note form submittable with Enter
- [ ] Type selector navigable with arrow keys
- [ ] Copy brief triggerable with keyboard shortcut (Cmd/Ctrl+Shift+C)
- [ ] Sidebar closable with Escape

### Visual
- [ ] Color is never the only indicator — icons + labels always accompany color
- [ ] Minimum contrast 4.5:1 for all text (check against sidebar and page backgrounds)
- [ ] Focus rings visible on all interactive elements
- [ ] Note type tags have aria-labels

### Motion
- [ ] No animations that can't be disabled
- [ ] Respects `prefers-reduced-motion`

### Screen Reader
- [ ] Note cards have descriptive aria-labels
- [ ] "Generate Brief" button announces result after copy
- [ ] Error states announced

---

## Website — markup.dev

### Pages
1. **Homepage** — Hero with product demo GIF, value prop, install button
2. **Docs** — Getting started, note format spec, AI brief format
3. **Changelog** — Every version, honest about what changed
4. **/blog** — Noah's build-in-public posts, product decisions, learnings

### Design Direction
- Warm minimal — use `--ap-paper` (#F5F0E8) as the page background, `--ap-gold` as accent
- No stock photos — only real product screenshots and demos
- Personal byline on every page: "Built by Noah Levin"
- Open source badge + GitHub star count prominent in nav

### Stack
- Next.js
- Tailwind
- Deployed on Vercel
- Docs in MDX
