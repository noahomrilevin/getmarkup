# Markup — Cowork Project Instructions

> One-handed, voice-first development workflow
> Built by Noah Levin using VS Code + Claude + Wispr Flow

---

## Project Overview

Markup is a Chrome extension (and VS Code extension) for annotating any URL and generating structured AI fix briefs. Open source. Built in public.

**Three products:**
- Chrome Extension — primary build (MVP)
- VS Code Extension — Phase 2
- markup.dev — marketing + docs site

**Full project plan:** see `docs/` folder

---

## Folder Structure

```
reviewbrief/
├── .claude/
│   ├── CLAUDE.md                    ← paste this at start of EVERY session
│   ├── COWORK.md                    ← this file
│   └── skills/
│       ├── vscode-extension.md      ← VS Code extension patterns (Phase 2)
│       ├── brief-format.md          ← AI brief output format spec
│       ├── typescript.md            ← TS style and patterns
│       └── review-ui.md             ← design tokens + Chrome sidebar components
├── 00-project-overview.md
├── 01-discovery/
│   ├── discovery.md
│   └── gap-analysis.md
├── 02-define/
│   └── define.md
├── 03-design/
│   └── design.md
├── 04-build/
│   └── build.md
├── 05-ship/
│   └── ship.md
├── 06-learn/
│   └── learn.md
├── _versions/                       ← archived originals
├── src/                             ← extension source (built in Sprint 1+)
├── CHANGELOG.md
└── README.md
```

---

## Daily Session Setup

### Step 1 — Open VS Code
Open the `markup/` folder as your workspace.

### Step 2 — Open Parallel Claude Tabs
```
Cmd+Shift+P → "Claude: New Chat"   (repeat 2-3x)
Drag tabs into side-by-side layout
```

| Tab | Role | What to paste |
|---|---|---|
| Claude #1 | Builder — writes code | CLAUDE.md + relevant skill file |
| Claude #2 | Checker — validates against spec | CLAUDE.md + current sprint section from 04-build.md |
| Claude #3 | Debugger — isolated problem solving | CLAUDE.md + the specific file with the bug |

### Step 3 — Start Wispr Flow
Activate before you start talking. Everything from here is voice.

### Step 4 — Ground Claude #1
Say:
> "Read CLAUDE.md. We're on Sprint [N]. Build [today's story] from 04-build.md. Use the acceptance criteria as your definition of done."

### Step 5 — Run tasks via keyboard, not terminal typing
```
Cmd+Shift+P → Tasks: Run Task → pick from list
```

---

## Keyboard Shortcuts (One-Handed Optimized)

Add these to your VS Code keybindings (`Cmd+Shift+P → Open Keyboard Shortcuts JSON`):

```json
[
  { "key": "ctrl+`",         "command": "workbench.action.terminal.toggleTerminal" },
  { "key": "ctrl+shift+t",   "command": "workbench.action.tasks.runTask" },
  { "key": "ctrl+shift+n",   "command": "claude.newChat" },
  { "key": "ctrl+shift+b",   "command": "workbench.action.tasks.build" }
]
```

---

## .vscode/tasks.json

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Dev: Compile Extension",
      "type": "shell",
      "command": "npm run compile",
      "group": "build",
      "presentation": { "reveal": "silent" }
    },
    {
      "label": "Dev: Watch Mode",
      "type": "shell",
      "command": "npm run watch",
      "group": "build",
      "isBackground": true
    },
    {
      "label": "Test: Run All",
      "type": "shell",
      "command": "npm test",
      "group": "test"
    },
    {
      "label": "Test: Watch",
      "type": "shell",
      "command": "npm run test:watch",
      "group": "test"
    },
    {
      "label": "Git: Commit All",
      "type": "shell",
      "command": "git add -A && git commit -m '${input:commitMessage}'",
      "group": "none"
    },
    {
      "label": "Git: Push",
      "type": "shell",
      "command": "git push",
      "group": "none"
    },
    {
      "label": "Package: Install",
      "type": "shell",
      "command": "npm install",
      "group": "none"
    },
    {
      "label": "Extension: Package VSIX",
      "type": "shell",
      "command": "npx vsce package",
      "group": "none"
    }
  ],
  "inputs": [
    {
      "id": "commitMessage",
      "type": "promptString",
      "description": "Commit message"
    }
  ]
}
```

---

## Parallel Claude Roles — Reference

### Claude #1 — Builder
Paste at start: `CLAUDE.md` + `skills/vscode-extension.md`

Use for:
- Writing new features
- Implementing sprint stories
- Creating new files

Example prompt:
> "We're in Sprint 2. Build the file picker that lets users select a local .html file. Write it to src/preview/filePicker.ts. Check acceptance criteria in 02-define/define.md."

---

### Claude #2 — Checker
Paste at start: `CLAUDE.md` + current sprint section from `04-build/build.md`

Use for:
- Validating code against acceptance criteria
- Checking output format against spec
- Asking "does this match what we defined?"

Example prompt:
> "Claude #1 just wrote the brief generator. Here's the output it produces: [paste]. Does this match the AI Brief format spec in 02-define/define.md exactly? List anything that doesn't match."

---

### Claude #3 — Debugger
Paste at start: `CLAUDE.md` + the specific file with the problem

Use for:
- Isolated bug fixing
- Understanding why something isn't working
- One problem, full focus

Example prompt:
> "This function is returning null when it should return the CSS selector. Here's the file: [paste]. Find why and fix it."

---

## End of Session Checklist

- [ ] Update `[CURRENT SPRINT]` line in CLAUDE.md
- [ ] Run `Git: Commit All` task
- [ ] Update sprint progress in `docs/04-build.md` (check off done stories)
- [ ] Note anything blocked for next session at top of CLAUDE.md

---

## When to Use Which Skill File

| You're working on... | Paste this skill |
|---|---|
| Chrome extension sidebar UI | `skills/review-ui.md` |
| The AI brief generator | `skills/brief-format.md` |
| Any TypeScript file | `skills/typescript.md` |
| VS Code extension (Phase 2 only) | `skills/vscode-extension.md` |
| Multiple concerns in one session | Paste all relevant ones |

Skills are small. Pasting two is fine. The more context Claude has upfront, the fewer corrections you make.
