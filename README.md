# Markup

Annotate any web page and generate structured AI fix briefs. A Chrome extension for developers, designers, and anyone who reviews live products.

---

## What it does

- Turn Markup on and click any element on the page to select it
- Leave a typed or voice note (works with [Wispr Flow](https://wispr.flow)) tagged as Bug, Design, Copy, Question, or General
- Save notes without selecting an element for general reactions
- All notes persist per URL in local storage
- Generate an AI brief from your notes to paste into Claude, Cursor, or ChatGPT

---

## Install (load unpacked)

1. Download or clone this repo
2. Open `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the `dist/` folder in this repo
6. Open any page, click the Markup icon in the toolbar

The `dist/` folder is pre-built and committed — no build step required for installation.

---

## Build from source

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run build
```

Output goes to `dist/`. Reload the unpacked extension in `chrome://extensions` after building.

---

## How to contribute

1. Fork the repo and create a branch from `main`
2. Make your changes in `src/`
3. Run `npm run build` and test by loading `dist/` as an unpacked extension
4. Open a pull request with a clear description of what changed and why

Please keep pull requests focused — one feature or fix per PR. If you're planning something significant, open an issue first to discuss the approach.

---

## Project structure

```
src/
  background.js        — service worker, side panel registration
  manifest.json        — MV3 manifest
  content/
    content.js         — element selection, highlight ring, page-side events
  sidebar/
    sidebar.html       — side panel UI
    sidebar.css        — styles and design tokens
    sidebar.js         — note lifecycle, storage, undo/redo, toggle logic
dist/                  — built extension (committed for easy install)
```

---

## License

MIT
