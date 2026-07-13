# Retouch

**Visual HTML editor for AI-generated code.**  
Paste HTML from ChatGPT, Claude, v0 — edit it visually, export clean code.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/demo-live-green.svg)](https://fikri.github.io/retouch)
[![No framework](https://img.shields.io/badge/vanilla-js-f7df1e?logo=javascript&logoColor=black)]()

## Why Retouch?

- **63% of "vibe coders" are non-developers** (TechTimes, May 2026). They can generate HTML with AI but can't edit it.
- Existing editors are SaaS, require installation, or are complex CMS tools.
- **Retouch is zero-install, zero-cost, zero-framework.** Open the page, paste your AI-generated HTML, edit visually, export.

## Features

- **Paste & render** — paste HTML from any AI tool, see it instantly
- **Click to edit** — select any element, change text, colors, size
- **Bold / Italic** — toggle text weight and style
- **Font size** — increase / decrease per element
- **Text & background color** — pick any color
- **Duplicate & delete** — copy or remove elements
- **Export** — download clean HTML file
- **Open HTML file** — load existing HTML files
- **Works offline** — after first load, everything runs client-side
- **100% free** — open source, MIT license

## Usage

1. Open [retouch.fikri.dev](https://fikri.github.io/retouch) (or open `index.html` locally)
2. Paste your AI-generated HTML in the left panel
3. Click **Render**
4. Click any element in the preview to select it
5. Use the floating toolbar to edit
6. Click **Export** to download your page

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Enter` | Render |
| `Cmd/Ctrl + S` | Export |
| `Escape` | Deselect |

## Tech Stack

- **Vanilla HTML/CSS/JS** — zero framework, zero build step
- **Tailwind CSS v4** — via CDN
- **No runtime dependencies** — everything is in one file

## Run Locally

```bash
git clone https://github.com/fikri/retouch.git
cd retouch
# Open index.html in your browser
open index.html
```

No server needed. No `npm install`. No build step.

## Why Self-Hosted?

- Your code never leaves your machine
- Works without internet (after initial load for Tailwind CDN)
- MIT licensed — use it commercially, modify it, embed it

## Roadmap

- [x] Paste & render HTML
- [x] Visual element editing (text, color, size)
- [x] Bold/italic toggle
- [x] Duplicate & delete elements
- [x] Export to HTML file
- [x] Open existing HTML files
- [ ] Drag-and-drop element reordering
- [ ] Image URL editing
- [ ] Tailwind class editing panel
- [ ] Undo / Redo
- [ ] PWA support (installable offline)

## License

MIT License — see [LICENSE](LICENSE).
