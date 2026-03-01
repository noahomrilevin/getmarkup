# Skill — AI Brief Format

> Paste this when working on the BriefGenerator or anything that touches brief output.
> The format below is non-negotiable. It is the product's core artifact.
> Two modes produce two distinct brief formats. Both are covered here.

---

## Mode 1 Brief Format — Self Review

Every Mode 1 brief must match this structure precisely:

```markdown
# Markup — Fix Instructions
**Project:** [filename or localhost URL]  
**Reviewed:** [YYYY-MM-DD] at [HH:MM]  
**Total Issues:** [number]

---

## 🐛 Bug — [Priority: High / Medium / Low]
**Element:** [human-readable name e.g. "Hero section CTA button"]  
**Selector:** [css selector e.g. `.hero .cta-button`]  
**Issue:** [what is wrong, one clear sentence]  
**Expected:** [what it should do/look like instead]  

---

## 🎨 Design
**Element:** [name]  
**Selector:** [selector]  
**Issue:** [description]  
**Expected:** [description]  

---

## ✍️ Copy
**Element:** [name]  
**Selector:** [selector]  
**Issue:** [description]  
**Expected:** [description]  

---

## ❓ Question
**Element:** [name]  
**Selector:** [selector]  
**Issue:** [question or decision needed]  
**Decision needed:** [Yes/No / Option A / Option B]  
```

---

## Mode 2 Brief Format — Think Aloud Session *(V2)*

Every Mode 2 brief must match this structure precisely:

```markdown
# Markup — Usability Session Brief
**Project:** [tab title or URL]
**Session:** [YYYY-MM-DD] at [HH:MM]
**Mode:** Think Aloud
**Duration:** [mm:ss]
**Total Observations:** [number]

---

## 🗣️ Think Aloud — Observation
**Element:** [human-readable name e.g. "Checkout button"]
**Selector:** [css selector e.g. `button#checkout`]
**Said:** [exact transcription of what the tester said]
**Insight:** [what this reveals about the UX]

---

## 🗣️ Think Aloud — Observation
**Element:** [name]
**Selector:** [selector]
**Said:** [transcription]
**Insight:** [UX insight]
```

> **Voice assumption:** Markup does not transcribe voice. Mode 2 assumes the tester runs Wispr Flow (or any dictation tool) which types directly into the auto-focused note field. The BriefGenerator receives notes tagged `type: 'think-aloud'` and formats them as observations, not bugs.

---

## Note Types → Brief Section Mapping

| Note type | Brief heading | Emoji | Mode |
|---|---|---|---|
| `bug` | `Bug` | 🐛 | Mode 1 |
| `design` | `Design` | 🎨 | Mode 1 |
| `copy` | `Copy` | ✍️ | Mode 1 |
| `question` | `Question` | ❓ | Mode 1 |
| `think-aloud` | `Think Aloud — Observation` | 🗣️ | Mode 2 (V2) |

**Output order:** Bug → Design → Copy → Question → Think Aloud

---

## TypeScript Interface for a Note

```typescript
// src/types.ts
export type NoteType = 'bug' | 'design' | 'copy' | 'question' | 'think-aloud';
export type Priority = 'high' | 'medium' | 'low';

export interface ReviewNote {
  id: string;              // uuid
  type: NoteType;
  priority?: Priority;     // bugs only
  elementName: string;     // human-readable, user provides
  selector: string;        // css selector, auto-extracted
  issue: string;           // user's description (Mode 1) or transcription (Mode 2)
  expected?: string;       // optional for Mode 1 (omit for think-aloud)
  insight?: string;        // Mode 2 only — UX interpretation
  createdAt: string;       // ISO date string
  mode: 'self-review' | 'think-aloud';  // which mode produced this note
}
```

---

## BriefGenerator Implementation Pattern

```typescript
// src/brief/BriefGenerator.ts
import { ReviewNote } from '../types';

export function generateBrief(notes: ReviewNote[], projectName: string): string {
  if (notes.length === 0) {
    return '# Markup\n\nNo issues recorded in this session.';
  }

  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().slice(0, 5);

  const header = [
    `# Markup — Fix Instructions`,
    `**Project:** ${projectName}`,
    `**Reviewed:** ${date} at ${time}`,
    `**Total Issues:** ${notes.length}`,
    ''
  ].join('\n');

  const sections = notes.map(note => formatNote(note)).join('\n---\n\n');

  return `${header}\n---\n\n${sections}`;
}

function formatNote(note: ReviewNote): string {
  const emoji = {
    bug: '🐛',
    design: '🎨',
    copy: '✍️',
    question: '❓'
  }[note.type];

  const heading = note.type === 'bug' && note.priority
    ? `## ${emoji} Bug — ${capitalize(note.priority)} Priority`
    : `## ${emoji} ${capitalize(note.type)}`;

  const lines = [
    heading,
    `**Element:** ${note.elementName}`,
    `**Selector:** \`${note.selector}\``,
    `**Issue:** ${note.issue}`,
  ];

  if (note.type === 'question') {
    lines.push(`**Decision needed:** `);
  } else if (note.expected) {
    lines.push(`**Expected:** ${note.expected}`);
  }

  return lines.join('\n') + '\n';
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
```

---

## Brief Generator Tests (write these first)

```typescript
// src/brief/__tests__/BriefGenerator.test.ts
import { generateBrief } from '../BriefGenerator';
import { ReviewNote } from '../../types';

const bugNote: ReviewNote = {
  id: '1',
  type: 'bug',
  priority: 'high',
  elementName: 'Hero CTA Button',
  selector: '.hero .cta-button',
  issue: 'Overflows container on mobile',
  expected: 'Full width with 16px padding',
  createdAt: new Date().toISOString()
};

describe('generateBrief', () => {
  it('includes project name and date in header', () => {
    const brief = generateBrief([bugNote], 'index.html');
    expect(brief).toContain('**Project:** index.html');
    expect(brief).toContain('# Markup — Fix Instructions');
  });

  it('formats a bug note with priority', () => {
    const brief = generateBrief([bugNote], 'test');
    expect(brief).toContain('🐛 Bug — High Priority');
    expect(brief).toContain('`.hero .cta-button`');
    expect(brief).toContain('Overflows container on mobile');
  });

  it('shows total issue count', () => {
    const brief = generateBrief([bugNote], 'test');
    expect(brief).toContain('**Total Issues:** 1');
  });

  it('handles empty notes array', () => {
    const brief = generateBrief([], 'test');
    expect(brief).toContain('No issues recorded');
  });

  it('separates multiple notes with dividers', () => {
    const designNote: ReviewNote = { ...bugNote, id: '2', type: 'design', priority: undefined };
    const brief = generateBrief([bugNote, designNote], 'test');
    expect(brief.split('---').length).toBeGreaterThan(2);
  });
});
```

---

## Edge Cases to Handle

- Empty notes array → show "No issues recorded" message, not a crash
- Note with no `expected` field → omit that line entirely, don't show blank
- Selector with backticks inside → escape them
- Very long issue descriptions → no truncation, preserve full text
- Multiple notes of same type → each gets its own section, no grouping
