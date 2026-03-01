# Skill — TypeScript Patterns for Markup

> Paste this alongside CLAUDE.md for any TypeScript work.

---

## Rules — Always Follow These

- **No `any`** — use `unknown` and narrow it, or define a proper type
- **Explicit return types** on all functions
- **Null-check everything** from VS Code APIs — they return `undefined` constantly
- **No implicit returns** — every code path returns something
- **Interfaces over types** for object shapes
- **Enums only for fixed sets** — note types, priority levels
- **One concern per file** — don't grow files past ~150 lines

---

## Preferred Patterns

### Null safety
```typescript
// ❌ Wrong
const root = vscode.workspace.workspaceFolders[0].uri.fsPath;

// ✅ Right
const folders = vscode.workspace.workspaceFolders;
if (!folders || folders.length === 0) {
  vscode.window.showErrorMessage('No workspace folder open');
  return;
}
const root = folders[0].uri.fsPath;
```

### Error handling
```typescript
// ❌ Wrong — silent failure
try {
  fs.writeFileSync(path, content);
} catch (e) {}

// ✅ Right — explicit handling
try {
  fs.writeFileSync(path, content);
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  vscode.window.showErrorMessage(`Markup: Failed to save notes — ${message}`);
}
```

### Async functions
```typescript
// Always use async/await, never raw .then()
// Always handle the error case

async function loadNotes(filePath: string): Promise<ReviewNote[]> {
  try {
    const raw = await fs.promises.readFile(filePath, 'utf8');
    return parseNotes(raw);
  } catch {
    return []; // file doesn't exist yet, that's fine
  }
}
```

### Type narrowing from unknown
```typescript
function isReviewNote(value: unknown): value is ReviewNote {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'selector' in value &&
    'issue' in value
  );
}
```

---

## Shared Types (src/types.ts)

Always import from here. Never redeclare types in feature files.

```typescript
export type NoteType = 'bug' | 'design' | 'copy' | 'question';
export type Priority = 'high' | 'medium' | 'low';

export interface ReviewNote {
  id: string;
  type: NoteType;
  priority?: Priority;
  elementName: string;
  selector: string;
  issue: string;
  expected?: string;
  createdAt: string;
}

export interface ReviewSession {
  date: string;
  projectName: string;
  notes: ReviewNote[];
}

export interface WebviewMessage {
  command: string;
  data: unknown;
}
```

---

## File Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Classes | PascalCase | `ReviewPanel.ts` |
| Functions/utilities | camelCase | `briefGenerator.ts` |
| Types file | lowercase | `types.ts` |
| Tests | same name + `.test` | `BriefGenerator.test.ts` |
| Test folder | `__tests__` | `src/brief/__tests__/` |

---

## What NOT to Do

```typescript
// ❌ No any
function handle(data: any) {}

// ❌ No non-null assertion unless you're 100% certain
const text = element!.textContent;

// ❌ No var
var count = 0;

// ❌ No unused imports (Claude sometimes adds these)
import { SomethingNeverUsed } from 'vscode';

// ❌ No console.log in committed code — use vscode.window.showInformationMessage
console.log('debug');
```
