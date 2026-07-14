// doc.js — engine: ekstrak CSS+body mentah, render di iframe, edit elemen live, serialize utuh.
window.VHE = (function () {
  let counter = 0;
  function uid() { return 'vhe' + (Date.now().toString(36)) + (counter++).toString(36); }

  // Ambil CSS dari <style> di head, dan potongan <head> lain (font/link/meta) dari raw HTML.
  function extract(rawHtml) {
    const doc = new DOMParser().parseFromString(rawHtml, 'text/html');
    const cssParts = [];
    doc.querySelectorAll('style').forEach((s) => cssParts.push(s.textContent));
    // simpan head non-style untuk dipertahankan saat export (font, meta, link)
    const headExtras = [];
    doc.querySelectorAll('head > *').forEach((el) => {
      if (el.tagName.toLowerCase() === 'style') return;
      headExtras.push(el.outerHTML);
    });
    const body = doc.body ? doc.body.innerHTML : rawHtml;
    return {
      css: cssParts.join('\n\n'),
      html: body,
      head: headExtras.join('\n  '),
      title: (doc.querySelector('title') && doc.querySelector('title').textContent) || '',
    };
  }

  // Build data awal dari raw html, atau kosong
  function fromRaw(rawHtml) {
    if (!rawHtml || !rawHtml.trim()) {
      return {
        title: '', head: '', css: '',
        html: '<section style="padding:64px 24px;text-align:center;background:#0e2136;color:#f3f1ea"><h1 style="font-family:Georgia,serif;font-size:2.4rem;margin:0">Selamat Datang 👋</h1><p style="margin-top:12px;font-size:1.05rem">Ini contoh. Klik elemen untuk mengubah, atau impor HTML dari AI.</p><a href="#" style="display:inline-block;margin-top:20px;padding:12px 22px;background:#c6a15b;color:#0a1a29;text-decoration:none;border-radius:2px;font-weight:600">Tombol Contoh</a></section>',
      };
    }
    return extract(rawHtml);
  }

  // Render data ke iframe via srcdoc (lebih stabil di mobile).
  // Menerima ELEMENT iframe (bukan contentDocument).
  function renderToIframe(frameEl, data, deviceClass) {
    const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' +
      (data.css || '') +
      '\n/* editor selection + drag helpers */\n' +
      '[data-vhe-sel]{outline:2px solid #2f6df6 !important;outline-offset:1px;}\n' +
      '[data-vhe-ovr]{outline:1px dashed rgba(47,109,246,.5) !important;outline-offset:1px;}\n' +
      '[data-vhe-drag]{opacity:.4;}\n' +
      // garis indikator di mana elemen akan jatuh (atas/bawah)
      '[data-vhe-drop="before"]{box-shadow:0 -3px 0 0 #2f6df6 !important;}\n' +
      '[data-vhe-drop="after"]{box-shadow:0 3px 0 0 #2f6df6 !important;}\n' +
      // hover: tunjukkan elemen yang bisa dipilih/digeser
      'body.vhe-edit [data-vhe-id],body.vhe-edit section,body.vhe-edit h1,body.vhe-edit h2,body.vhe-edit h3,body.vhe-edit h4,body.vhe-edit p,body.vhe-edit a,body.vhe-edit img,body.vhe-edit div,body.vhe-edit li,body.vhe-edit blockquote,body.vhe-edit span{outline:1px dashed rgba(47,109,246,.28);outline-offset:0;transition:outline-color .1s ease;}\n' +
      'body.vhe-edit [data-vhe-id]:hover,body.vhe-edit section:hover,body.vhe-edit h1:hover,body.vhe-edit h2:hover,body.vhe-edit h3:hover,body.vhe-edit h4:hover,body.vhe-edit p:hover,body.vhe-edit a:hover,body.vhe-edit img:hover,body.vhe-edit li:hover,body.vhe-edit blockquote:hover,body.vhe-edit span:hover{outline-color:rgba(47,109,246,.7);}\n' +
      (deviceClass ? '.vhe-mobile{max-width:390px;margin:0 auto;}' : '') +
      '</style></head><body' + (deviceClass ? ' class="vhe-mobile"' : '') + '>' + data.html + '</body></html>';
    frameEl.srcdoc = html;
  }
  // Blok baru (dipakai saat tambah dari palette) sebagai HTML string
  function blockHtml(type) {
    const id = uid();
    switch (type) {
      case 'section':
        return `<section data-vhe-id="${id}" style="padding:40px 24px;background:#ffffff"><p style="margin:0;color:#444">Section baru. Klik dua kali untuk edit teks, atau seret blok lain ke sini.</p></section>`;
      case 'heading':
        return `<h2 data-vhe-id="${id}" style="margin:16px 0;color:#1a1a1a">Judul Baru</h2>`;
      case 'text':
        return `<p data-vhe-id="${id}" style="margin:12px 0;color:#444;line-height:1.6">Tulis paragraf di sini. Klik dua kali untuk mengubah.</p>`;
      case 'button':
        return `<p data-vhe-id="${id}" style="margin:16px 0"><a href="#" style="display:inline-block;padding:10px 18px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Tombol</a></p>`;
      case 'image':
        return `<p data-vhe-id="${id}" style="margin:16px 0;text-align:center"><img src="https://placehold.co/600x300?text=Gambar" alt="gambar" style="max-width:100%"></p>`;
      case 'divider':
        return `<hr data-vhe-id="${id}" style="border:none;border-top:1px solid #ccc;margin:16px 0">`;
      default:
        return '';
    }
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Bungkus data jadi full HTML (untuk export)
  function serialize(data) {
    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${data.head ? '  ' + data.head + '\n' : ''}  <title>${escapeHtml(data.title || 'Website')}</title>
  <style>
${data.css || ''}
  </style>
</head>
<body>
${data.html}
</body>
</html>`;
  }

  return { uid, fromRaw, extract, renderToIframe, blockHtml, serialize };
})();
