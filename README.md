# Visual HTML Editor

**Edit website hasil AI (ChatGPT, Claude, v0, dsb) secara visual — tanpa coding.**

Buat orang yang sudah bisa "minta AI bikin website" tapi **bingung cara ubah teks, warna, atau
tata letak** begitu hasilnya jadi kode HTML mentah. Tool ini mengubah HTML apa pun jadi kanvas
yang bisa diedit: klik elemen untuk ubah teks/warna, seret untuk geser posisi, tambah section /
gambar / tombol baru, lalu ekspor ulang jadi HTML bersih.

## Kenapa ini beda
- Banyak AI bisa **menghasilkan** website, tapi nyaris tidak ada yang kasih cara **mengedit hasilnya**
  buat orang awam. Biasanya user harus minta ulang ke AI ("ubah warnanya jadi biru") — lambat & tidak fleksibel.
- Tool serupa (GrapesJS, Webstudio) menyasar developer yang mau bikin *builder* sendiri. Tool ini
  menyasar **end-user**: cukup tempel HTML, klik elemen untuk ubah, selesai.
- **Penting:** desain asli (CSS, font, class, layout) dipertahankan 100%. HTML diimpor tampil **persis**
  seperti aslinya di dalam pratinjau, lalu diedit elemen per elemen — bukan diubah jadi kotak polos.

## Cara Kerja
HTML diimpor lalu dirender langsung di dalam pratinjau (iframe) bersama **seluruh CSS & font aslinya**.
Kamu mengedit elemen di DOM asli:
- **Klik** elemen → pilih, lalu ubah teks/warna/latar/perataan/tautan di panel kanan.
- **Klik dua kali** elemen teks → edit langsung di dalam halaman.
- **Seret** gagang / pakai tombol ↑↓ untuk mengubah urutan.
- **Tambah blok** dari panel kiri (section, heading, teks, tombol, gambar, garis).
- **CSS Kustom** di panel kiri untuk gaya lanjut (warna, font, jarak).
- **Ekspor** menghasilkan satu file HTML lengkap (head + style + body) siap hosting.

## Fitur
- **Impor HTML** — tempel kode dari ChatGPT/Claude/v0, otomatis jadi blok yang bisa diedit.
- **Tambah blok** — Section (wadah), Heading, Teks, Tombol, Gambar, Garis pembatas.
- **Edit inline** — klik elemen untuk pilih, dobel-klik untuk ubah teks langsung.
- **Ubah tampilan** — warna teks, warna latar, perataan (kiri/tengah/kanan), jarak dalam.
- **Font & Format Teks** — pilih jenis font (10 pilihan), atur ukuran font, tebal (bold), miring (italic), garis bawah (underline).
- **Geser posisi** — tarik gagang di tiap elemen, atau tombol naik/turun. Juga bisa seret blok dari panel kiri ke posisi mana pun.
- **Simpan & Buka** — project tersimpan di server, bisa dilanjut lain hari.
- **Ekspor HTML** — hasil akhir bersih & siap di-hosting di mana pun.
- **Pratinjau HP/Desktop** — tombol toggle untuk lihat tampilan di layar HP.

## Cara Pakai (cepat)
1. Buka editor di browser.
2. Klik **Impor HTML** → tempel kode dari AI → **Impor & Ubah Jadi Blok**.
   Atau langsung klik blok di kiri ("Tambah Blok") untuk mulai dari nol.
3. Klik elemen di tengah → ubah teks/warna di panel kanan.
4. Tarik gagang biru (⠿) untuk geser urutan, atau pakai ↑/↓.
5. Klik **Ekspor HTML** → Salin / Unduh, lalu tempel ke hosting kamu.

## Instalasi (server / self-hosted)
Tanpa dependency apa pun (pure Node.js).

```bash
cd visual-html-editor
node server.js
# buka http://localhost:3460
```

Ubah port lewat env: `VHE_PORT=8080 node server.js`

## Tech Stack
- **Backend**: Node.js bawaan (`http`) — tanpa framework, tanpa database (file JSON di folder `data/`).
- **Frontend**: Vanilla JS + DOM API (drag-and-drop HTML5 native). Tidak ada build step.

## Struktur
```
visual-html-editor/
├── server.js          # server static + API save/load
├── public/
│   ├── index.html     # layout editor
│   ├── styles.css     # tema gelap, OKLCH
│   ├── doc.js         # engine: definisi blok, render, parse import, serialize
│   └── editor.js      # state, seleksi, drag reorder, simpan/muat
├── data/              # project tersimpan (JSON)
└── LICENSE
```

## Roadmap
- Undo/redo.
- Export dengan CSS terpisah.
- Template siap pakai (landing page, portfolio).
- Upload gambar lokal (bukan cuma URL).

## Lisensi
MIT
