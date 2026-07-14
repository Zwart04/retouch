# Retouch v3 — PRD

## Problem
Orang non-teknis sering pakai AI (ChatGPT, Claude, v0) untuk generate HTML website, tapi begitu hasilnya jadi, mereka gak bisa mengeditnya secara visual karena tools yang ada (GrapesJS, Webstudio, dll) terlalu berat/kompleks untuk pemula. Retouch adalah editor visual zero-install yang sangat sederhana: paste HTML, klik elemen, edit propertinya.

## Target User
- Orang yang "ngoding" pakai AI tapi gak paham kode HTML
- Content creator / marketer yang perlu edit landing page sederhana
- Siapa pun yang punya file HTML dan perlu ubah tampilan tanpa buka code editor

## Fitur Inti v3 (Dari V2 yang sudah ada)
1. **Font-family selector** (dropdown 10+ font) — BARU
2. **Text alignment** (left, center, right, justify) — BARU
3. **Underline toggle** — BARU
4. **Undo/Redo** (history stack, batasi 50 langkah) — BARU
5. **Drag-and-drop reorder** (pindah posisi elemen naik/turun dalam parent) — BARU
6. **Add element** (insert div, h1, h2, p, img via toolbar) — BARU
7. **Inline text editing** (double-click untuk edit teks langsung di preview) — BARU
8. **Padding/Margin quick controls** (preset kecil, sedang, besar) — BARU

Fitur yang SUDAH ADA di v2:
- Bold, Italic
- Font size (+/-)
- Text color, Background color
- Duplicate, Delete
- Open file, Export
- Resizable split panels

## Tech Stack
- Single HTML file (100% client-side)
- Vanilla JS (no framework)
- Tailwind CSS v4 CDN (seperti sebelumnya)
- Zero dependencies, zero install

## Out of Scope v3
- Layer management (z-index, hierarchy tree)
- CSS class editing
- Responsive preview (mobile/tablet toggle)
- Cloud save / account system
