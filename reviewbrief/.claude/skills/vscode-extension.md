# Skill — VS Code Extension Development *(Phase 2)*

> **Phase 2 skill.** The Chrome extension is the MVP. This file covers the VS Code extension, which ships after Chrome is launched.
> Paste this alongside CLAUDE.md when working on VS Code extension code.

---

## Extension Architecture

Markup uses the standard VS Code extension pattern:

```
src/
├── extension.ts          ← entry point, registers commands + providers
├── panel/
│   ├── ReviewPanel.ts    ← WebviewPanel creation and lifecycle
│   └── webview/
│       ├── index.html    ← webview HTML shell
│       ├── preview.js    ← iframe/preview logic
│       ├── notes.js      ← note form + pin overlay
│       └── styles.css    ← webview styles
├── notes/
│   ├── NoteStorage.ts    ← read/write .md files
│   └── NoteFormatter.ts  ← format notes as markdown
├── brief/
│   └── BriefGenerator.ts ← compile notes into AI brief
└── types.ts              ← shared TypeScript interfaces
```

---

## Extension Entry Point Pattern

```typescript
// src/extension.ts
import * as vscode from 'vscode';
import { ReviewPanel } from './panel/ReviewPanel';

export function activate(context: vscode.ExtensionContext) {
  const openPanel = vscode.commands.registerCommand(
    'markup.openPanel',
    () => ReviewPanel.createOrShow(context.extensionUri)
  );
  context.subscriptions.push(openPanel);
}

export function deactivate() {}
```

---

## WebviewPanel Pattern

```typescript
// src/panel/ReviewPanel.ts
import * as vscode from 'vscode';

export class ReviewPanel {
  public static currentPanel: ReviewPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (ReviewPanel.currentPanel) {
      ReviewPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'markup',
      'Markup',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'src', 'panel', 'webview')
        ]
      }
    );

    ReviewPanel.currentPanel = new ReviewPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getHtmlForWebview();

    // Handle messages from webview
    this._panel.webview.onDidReceiveMessage(
      message => this._handleMessage(message),
      null,
      this._disposables
    );
  }

  private _handleMessage(message: { command: string; data: unknown }) {
    switch (message.command) {
      case 'saveNote':
        // handle note save
        break;
      case 'generateBrief':
        // handle brief generation
        break;
    }
  }

  public dispose() {
    ReviewPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) disposable.dispose();
    }
  }
}
```

---

## Webview → Extension Messaging

```typescript
// FROM webview TO extension
// In webview JS:
const vscode = acquireVsCodeApi();
vscode.postMessage({ command: 'saveNote', data: noteObject });

// In extension, receive it:
panel.webview.onDidReceiveMessage(message => {
  if (message.command === 'saveNote') {
    // handle
  }
});
```

```typescript
// FROM extension TO webview
// In extension:
panel.webview.postMessage({ command: 'notesSaved', data: { success: true } });

// In webview JS:
window.addEventListener('message', event => {
  const message = event.data;
  if (message.command === 'notesSaved') {
    // update UI
  }
});
```

---

## File System Access

```typescript
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Get workspace root
const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
if (!workspaceRoot) {
  vscode.window.showErrorMessage('No workspace folder open');
  return;
}

// Write a file
const notesDir = path.join(workspaceRoot, '.review-notes');
if (!fs.existsSync(notesDir)) fs.mkdirSync(notesDir);

const date = new Date().toISOString().split('T')[0];
const filePath = path.join(notesDir, `${date}.md`);
fs.writeFileSync(filePath, content, 'utf8');

// Read a file
const existing = fs.existsSync(filePath) 
  ? fs.readFileSync(filePath, 'utf8') 
  : '';
```

---

## package.json Contributes (required fields)

```json
{
  "name": "markup",
  "displayName": "Markup",
  "description": "Annotate local HTML previews. Generate AI fix briefs.",
  "version": "0.1.0",
  "engines": { "vscode": "^1.85.0" },
  "categories": ["Other"],
  "activationEvents": [],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "markup.openPanel",
        "title": "Open Markup",
        "category": "Markup"
      }
    ],
    "configuration": {
      "title": "Markup",
      "properties": {
        "markup.enableBetaFeatures": {
          "type": "boolean",
          "default": false,
          "description": "Enable experimental features"
        }
      }
    }
  },
  "scripts": {
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "test": "jest"
  }
}
```

---

## Common Mistakes to Avoid

- **Never** use `require()` in webview scripts — use ES modules or inline scripts
- **Never** assume `workspaceFolders` exists — always null-check it
- **Never** store state only in webview — it resets on hide/show; use extension state or file system
- **Always** dispose event listeners in `_disposables`
- **Always** use `vscode.Uri.joinPath` not string concatenation for paths
- **Always** set `localResourceRoots` or local assets won't load in webview
