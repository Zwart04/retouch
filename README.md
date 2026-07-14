# Retouch

**Visual HTML editor for AI-generated code.**  
Paste HTML from ChatGPT, Claude, v0 — edit it visually, export clean code.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/demo-live-green.svg)](https://zwart04.github.io/retouch)
[![No framework](https://img.shields.io/badge/vanilla-js-f7df1e?logo=javascript&logoColor=black)]()

## Why Retouch?

- **63% of "vibe coders" are non-developers** (TechTimes, May 2026). They can generate HTML with AI but can't edit it.
- Existing editors are SaaS, require installation, or are complex CMS tools.
- **Retouch is zero-install, zero-cost, zero-framework.** Open the page, paste your AI-generated HTML, edit visually, export.

## Features

- **Paste & render** — paste HTML from any AI tool, see it instantly
- **Click to edit** — select any element, change text, colors, size
- **Inline text editing** — double-click any text to edit it directly in the preview
- **Bold / Italic / Underline** — toggle text formatting
- **Font family** — choose from 10 fonts (Inter, Georgia, Times, Arial, etc.)
- **Font size** — increase / decrease per element
- **Text alignment** — left, center, right
- **Text & background color** — pick any color with native color picker
- **Padding presets** — small, medium, large with one click
- **Move up / down** — reorder elements in their parent container
- **Add element** — insert div, heading, paragraph, image, link, or button
- **Duplicate & delete** — copy or remove elements
- **Undo / Redo** — full history with Ctrl+Z / Ctrl+Shift+Z
- **Export** — download clean HTML file
- **Open HTML file** — load existing HTML files directly
- **Works offline** — after first load, everything runs client-side
- **100% free** — open source, MIT license

## Usage

1. Open [retouch.zwart04.github.io](https://zwart04.github.io/retouch) (or open `index.html` locally)
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
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` or `Cmd/Ctrl + Y` | Redo |
| `Cmd/Ctrl + B` | Bold (when element selected) |
| `Cmd/Ctrl + I` | Italic (when element selected) |
| `Cmd/Ctrl + U` | Underline (when element selected) |
| `Escape` | Deselect / stop editing |

## Tech Stack

- **Vanilla HTML/CSS/JS** — zero framework, zero build step
- **Tailwind CSS v4** — via CDN
- **No runtime dependencies** — everything is in one file

## Run Locally

```bash
git clone https://github.com/Zwart04/retouch.git
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
- [x] Visual element editing (text, color, size, font)
- [x] Bold/italic/underline toggle
- [x] Font family selector (10 fonts)
- [x] Text alignment (left, center, right)
- [x] Padding presets (small, medium, large)
- [x] Inline text editing (double-click)
- [x] Add element (div, h1, h2, p, img, a, button)
- [x] Move up / down reordering
- [x] Duplicate & delete elements
- [x] Undo / Redo (50-step history)
- [x] Export to HTML file
- [x] Open existing HTML files
- [ ] Image URL / alt editing
- [ ] Tailwind class editing panel
- [ ] Drag-and-drop (mouse-based, not just buttons)
- [ ] PWA support (installable offline)

## License

MIT License — see [LICENSE](LICENSE).
