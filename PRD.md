# Retouch — Visual HTML Editor untuk AI-Generated Code

## Masalah
Sekarang ini, 63% pengguna "vibe coding" adalah non-developer (TechTimes, Mei 2026). Mereka bisa generate halaman web pakai ChatGPT, Claude, atau v0 dalam hitungan detik — tapi begitu hasilnya jadi, mereka tidak bisa mengeditnya. Mau ganti teks, warna tombol, ukuran font, atau tata letak: bingung karena harus utak-atik kode HTML/CSS.

Solusi yang ada terlalu berat (GrapesJS, Webflow), berbayar, atau butuh instalasi server.

## Target Pengguna
- Orang non-teknis yang pakai AI untuk generate website (landing page, portfolio, halaman sederhana)
- Freelancer / agensi kecil yang pengen cepet customize template HTML
- Siapa pun yang dapat file HTML dari AI dan perlu diedit visual

## Kenapa Beda dari yang Sudah Ada
- **AI-first workflow**: paste langsung dari ChatGPT/Claude/v0
- **Zero install**: buka di browser, langsung pakai
- **Super sederhana**: bukan CMS, bukan page builder kompleks. Focus: edit yang sudah ada.
- **Open source + MIT**: gratis selamanya
- **Self-contained**: single HTML file, bisa jalan offline

## Tech Stack
- Vanilla HTML/CSS/JS (zero framework, zero build step)
- Tailwind CSS v4 via CDN
- ContentEditable API untuk text editing
- DOMParser + sanitasi untuk HTML rendering

## Fitur Inti MVP
1. Paste HTML dari AI tools → lihat preview langsung
2. Klik elemen di preview → pilih & tampilkan toolbar
3. Edit teks langsung (contentEditable)
4. Ganti warna teks & background
5. Ganti ukuran font
6. Bold / Italic
7. Hapus elemen
8. Duplikasi elemen
9. Export HTML bersih
10. Bisa jalan offline setelah load pertama
