# Skill — Markup UI: Design Tokens + Components

> Paste this when working on any sidebar HTML/CSS/JS.
> All UI must use these tokens. No hardcoded colors or sizes. No VS Code theme colors.

---

## Design Philosophy

Markup's design is intentionally lightweight and minimal. The priority is ease of use, not visual polish. Ship functional and clean first — refined design comes later. No decorative elements, no animations, no complexity that doesn't serve a direct user need.

---

## Design Tokens (CSS Variables)

These map directly to `markup.pen`. Light mode is default; dark mode via `prefers-color-scheme`.

```css
/* Injected into shadow DOM root — do not use :root at page level */
:host {
  /* Core surfaces */
  --background:           #F2F3F0;
  --foreground:           #111111;
  --card:                 #FFFFFF;
  --card-foreground:      #111111;
  --muted:                #F2F3F0;
  --muted-foreground:     #666666;
  --border:               #CBCCC9;
  --input:                #CBCCC9;

  /* Primary CTA — orange, both modes */
  --primary:              #FF8400;
  --primary-foreground:   #111111;

  /* Secondary */
  --secondary:            #E7E8E5;
  --secondary-foreground: #111111;

  /* Destructive */
  --destructive:          #D93C15;

  /* Sidebar layer */
  --sidebar:              #E7E8E5;
  --sidebar-border:       #CBCCC9;
  --sidebar-foreground:   #666666;

  /* Focus ring */
  --ring:                 #666666;

  /* Semantic state colors — backgrounds */
  --color-error:          #E5DCDA;
  --color-error-fg:       #8C1C00;
  --color-success:        #DFE6E1;
  --color-success-fg:     #004D1A;
  --color-warning:        #E9E3D8;
  --color-warning-fg:     #804200;
  --color-info:           #DFDFE6;
  --color-info-fg:        #000066;

  /* Typography — from markup.pen */
  --font-primary:   'JetBrains Mono', monospace;   /* selectors, code, brief output */
  --font-secondary: 'Geist', 'Inter', sans-serif;  /* UI labels, note text, everything else */
  --size-xs:  10px;
  --size-sm:  12px;
  --size-base: 14px;
  --size-lg:  16px;

  /* Shape — from markup.pen */
  --radius-m:    16px;
  --radius-pill: 999px;

  /* Spacing scale */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
}

@media (prefers-color-scheme: dark) {
  :host {
    --background:           #111111;
    --foreground:           #FFFFFF;
    --card:                 #1A1A1A;
    --card-foreground:      #FFFFFF;
    --muted:                #2E2E2E;
    --muted-foreground:     #B8B9B6;
    --border:               #2E2E2E;
    --input:                #2E2E2E;
    --primary:              #FF8400;
    --primary-foreground:   #111111;
    --secondary:            #2E2E2E;
    --secondary-foreground: #FFFFFF;
    --destructive:          #FF5C33;
    --sidebar:              #18181B;
    --sidebar-border:       #ffffff1a;
    --sidebar-foreground:   #fafafa;
    --color-error:          #24100B;
    --color-error-fg:       #FF5C33;
    --color-success:        #222924;
    --color-success-fg:     #B6FFCE;
    --color-warning:        #291C0F;
    --color-warning-fg:     #FF8400;
    --color-info:           #222229;
    --color-info-fg:        #B2B2FF;
  }
}
```

---

## Note Type → Color Mapping

| Type | Emoji | Background token | Text token |
|---|---|---|---|
| Bug | 🐛 | `--color-error` | `--color-error-fg` |
| Design | 🎨 | `--color-info` | `--color-info-fg` |
| Copy | ✍️ | `--color-warning` | `--color-warning-fg` |
| Question | ❓ | `--muted` | `--muted-foreground` |
| Think Aloud | 🗣️ | `--color-success` | `--color-success-fg` |

---

## Layout — Chrome Extension Sidebar

The sidebar is injected via Shadow DOM at the right edge of the user's page. The page body gets `margin-right: 320px` when the sidebar opens.

```html
<!-- Injected into page via content script, wrapped in shadow DOM -->
<div class="markup-sidebar">
  <div class="markup-header">
    <span class="markup-title">Markup</span>
    <span class="markup-note-count">0 notes</span>
    <button class="icon-btn" aria-label="Close sidebar">✕</button>
  </div>

  <div class="markup-notes">
    <!-- NoteCards rendered here -->
  </div>

  <div class="markup-form-area">
    <!-- NoteForm always visible at bottom -->
  </div>

  <div class="markup-actions">
    <button class="btn-primary" id="generate-brief">Generate AI Brief ↗</button>
  </div>
</div>
```

```css
.markup-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background: var(--sidebar);
  border-left: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  font-family: var(--font-secondary);
  font-size: var(--size-base);
  color: var(--foreground);
  z-index: 2147483647;
  box-sizing: border-box;
  overflow: hidden;
}

.markup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.markup-title {
  font-weight: 600;
  font-size: var(--size-base);
  color: var(--foreground);
}

.markup-note-count {
  font-size: var(--size-sm);
  color: var(--muted-foreground);
}

.markup-notes {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-sm);
}

.markup-form-area {
  border-top: 1px solid var(--border);
  padding: var(--space-sm);
  background: var(--card);
  flex-shrink: 0;
}

.markup-actions {
  padding: var(--space-sm) var(--space-md);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}
```

---

## Components

### NoteTypeTag

```html
<span class="note-type-tag note-type-tag--bug">🐛 Bug</span>
<span class="note-type-tag note-type-tag--design">🎨 Design</span>
<span class="note-type-tag note-type-tag--copy">✍️ Copy</span>
<span class="note-type-tag note-type-tag--question">❓ Question</span>
```

```css
.note-type-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 2px var(--space-sm);
  border-radius: var(--radius-pill);
  font-size: var(--size-sm);
  font-weight: 500;
}
.note-type-tag--bug      { background: var(--color-error);   color: var(--color-error-fg); }
.note-type-tag--design   { background: var(--color-info);    color: var(--color-info-fg); }
.note-type-tag--copy     { background: var(--color-warning); color: var(--color-warning-fg); }
.note-type-tag--question { background: var(--muted);         color: var(--muted-foreground); }
```

---

### SelectorChip

```html
<code class="selector-chip">.hero .cta-button</code>
```

```css
.selector-chip {
  font-family: var(--font-primary);
  font-size: var(--size-sm);
  color: var(--muted-foreground);
  background: var(--muted);
  padding: 1px var(--space-xs);
  border-radius: 4px;
  border: 1px solid var(--border);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

---

### NoteCard

```html
<div class="note-card" data-id="[id]">
  <div class="note-card__header">
    <span class="note-type-tag note-type-tag--bug">🐛 Bug</span>
    <button class="icon-btn" aria-label="Delete note">✕</button>
  </div>
  <code class="selector-chip">.hero .cta-button</code>
  <p class="note-card__text">Font too large on mobile</p>
</div>
```

```css
.note-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-m);
  padding: var(--space-sm);
  margin-bottom: var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.note-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.note-card__text {
  font-size: var(--size-base);
  color: var(--foreground);
  margin: 0;
  line-height: 1.5;
}
```

---

### NoteForm

```html
<div class="note-form">
  <div class="note-form__selector">
    <code class="selector-chip">Click an element to select it</code>
  </div>
  <div class="note-form__types">
    <button class="type-btn type-btn--active" data-type="bug">🐛 Bug</button>
    <button class="type-btn" data-type="design">🎨 Design</button>
    <button class="type-btn" data-type="copy">✍️ Copy</button>
    <button class="type-btn" data-type="question">❓</button>
  </div>
  <textarea class="note-form__input" placeholder="Describe the issue… or speak via Wispr Flow" rows="3"></textarea>
</div>
```

```css
.note-form { display: flex; flex-direction: column; gap: var(--space-sm); }
.note-form__types { display: flex; gap: var(--space-xs); flex-wrap: wrap; }

.type-btn {
  padding: 3px var(--space-sm);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--muted-foreground);
  font-size: var(--size-sm);
  font-family: var(--font-secondary);
  cursor: pointer;
}
.type-btn--active { background: var(--primary); color: var(--primary-foreground); border-color: var(--primary); }

.note-form__input {
  width: 100%;
  background: var(--card);
  border: 1px solid var(--input);
  border-radius: var(--radius-m);
  color: var(--foreground);
  font-family: var(--font-secondary);
  font-size: var(--size-base);
  padding: var(--space-sm);
  resize: vertical;
  box-sizing: border-box;
}
.note-form__input:focus { outline: none; border-color: var(--primary); }
```

---

### Buttons

```css
/* Primary — orange, main CTA (Generate Brief) */
.btn-primary {
  background: var(--primary);
  color: var(--primary-foreground);
  border: none;
  border-radius: var(--radius-m);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--size-base);
  font-family: var(--font-secondary);
  font-weight: 500;
  cursor: pointer;
  width: 100%;
}
.btn-primary:hover { opacity: 0.9; }

/* Secondary */
.btn-secondary {
  background: var(--secondary);
  color: var(--secondary-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius-m);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--size-base);
  font-family: var(--font-secondary);
  cursor: pointer;
}

/* Icon-only */
.icon-btn {
  background: transparent;
  border: none;
  color: var(--muted-foreground);
  cursor: pointer;
  padding: var(--space-xs);
  border-radius: 4px;
  line-height: 1;
}
.icon-btn:hover { color: var(--foreground); }
```

---

## Accessibility Requirements

Every interactive element must have:
- `aria-label` if no visible text
- Visible focus ring: `outline: 2px solid var(--ring); outline-offset: 2px;`
- Keyboard operability (Tab + Enter/Space)
- `prefers-reduced-motion` respected — no transitions by default
- WCAG 2.1 AA contrast on all text (4.5:1 minimum)
