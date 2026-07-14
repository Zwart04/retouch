// editor.js — orchestration: iframe render, seleksi, edit inline, drag reorder, save/load/export.
(function () {
  const VHE = window.VHE;
  const frame = document.getElementById('frame');
  const fd = () => frame.contentDocument;
  const palette = document.getElementById('palette');

  let data = VHE.fromRaw('');      // {title, head, css, html}
  let selectedEl = null;
  let docId = null;

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.remove('hidden');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.add('hidden'), 2200);
  }

  // Elemen yang bisa diedit teksnya (hanya kalau tidak punya anak elemen block-level)
  const BLOCK_TAGS = ['SECTION','DIV','P','H1','H2','H3','H4','H5','H6','UL','OL','LI','BLOCKQUOTE','TABLE','ARTICLE','HEADER','FOOTER','MAIN','ASIDE','NAV','FORM'];
  function isEditableText(el) {
    if (!el) return false;
    const tag = el.tagName;
    if (['IMG','HR','BR','INPUT','META','LINK','STYLE','SCRIPT'].includes(tag)) return false;
    return !Array.from(el.children).some((c) => BLOCK_TAGS.includes(c.tagName));
  }

  function rerender() {
    const mobile = document.getElementById('btnDeviceMobile').classList.contains('active');
    VHE.renderToIframe(frame, data, mobile ? 'vhe-mobile' : '');
    selectedEl = null;
    showProps(null);
    // pastikan bind setelah iframe benar-benar siap (handle mobile timing)
    const bindWhenReady = () => {
      const d = frame.contentDocument;
      if (d && d.body) { bindFrame(); bindDrag(); }
      else { requestAnimationFrame(bindWhenReady); }
    };
    frame.onload = bindWhenReady;
    bindWhenReady();
  }

  // ---- drag reorder di IFRAME (browser nyata: user klik di iframe -> event di iframe) ----
  // Catatan: Playwright page.mouse mengirim event ke PARENT, sehingga test pakai
  // iframeLocator.dragTo() / dispatchEvent di konteks iframe, bukan page.mouse.
  let dragEl = null, dragMoved = false, startY = 0, lastOver = null, lastBefore = false;
  const localPoint = (clientX, clientY) => {
    // listener di iframe contentDocument -> clientX/Y SUDAH relatif viewport iframe
    return { x: clientX, y: clientY };
  };
  const SEL = '[data-vhe-id], section, h1, h2, h3, h4, h5, p, a, img, div, li, blockquote, span';
  function onDown(e) {
    if (!document.getElementById('editMode').checked) return;
    if (e.button !== 0) return;
    const d = fd(); if (!d || !d.body) return;
    const lp = localPoint(e.clientX, e.clientY);
    const tgt = d.elementFromPoint(lp.x, lp.y);
    const el = tgt ? tgt.closest(SEL) : null;
    if (!el || !d.body.contains(el)) return;
    dragEl = el; dragMoved = false; startY = e.clientY; lastOver = null;
  }
  function onMove(e) {
    if (!dragEl) return;
    if (!dragMoved && Math.abs(e.clientY - startY) < 6) return;
    const d = fd(); if (!d || !d.body) return;
    dragMoved = true;
    if (!dragEl.hasAttribute('data-vhe-drag')) dragEl.setAttribute('data-vhe-drag', '1');
    const lp = localPoint(e.clientX, e.clientY);
    const tgt = d.elementFromPoint(lp.x, lp.y);
    const over = tgt ? tgt.closest(SEL) : null;
    clearDropMarks(d);
    if (over && over !== dragEl && !dragEl.contains(over) && d.body.contains(over)) {
      const r = over.getBoundingClientRect();
      lastBefore = (lp.y - r.top) < (r.height / 2);
      lastOver = over;
      over.setAttribute('data-vhe-drop', lastBefore ? 'before' : 'after');
    }
  }
  function onUp() {
    if (!dragEl) return;
    const d = fd(); if (!d) return;
    const wasMoved = dragMoved;
    const el = dragEl; dragEl = null; el.removeAttribute('data-vhe-drag');
    clearDropMarks(d);
    window.__pu = { wasMoved, hasOver: !!lastOver };
    if (!wasMoved || !lastOver) { lastOver = null; return; }
    const over = lastOver; lastOver = null;
    if (over === el || el.contains(over)) return;
    if (lastBefore) over.parentNode.insertBefore(el, over);
    else over.parentNode.insertBefore(el, over.nextSibling);
    syncHtml(); selectEl(el); toast('Posisi diubah');
  }
  // daftarkan di document iframe (bindFrame) supaya tidak menumpuk
  function bindDrag() {
    const d = fd(); if (!d) return;
    d.addEventListener('mousedown', onDown);
    d.addEventListener('mousemove', onMove);
    d.addEventListener('mouseup', onUp);
  }

  // ---- seleksi ----
  function selectEl(el) {
    if (selectedEl) selectedEl.removeAttribute('data-vhe-sel');
    selectedEl = el;
    if (el) el.setAttribute('data-vhe-sel', '1');
    showProps(el);
    // di mobile, buka panel kanan otomatis saat memilih elemen
    if (window.matchMedia('(max-width: 860px)').matches) {
      const pr = document.querySelector('.panel-right');
      const bd = document.getElementById('wsBackdrop');
      if (pr) pr.classList.add('open');
      if (bd) bd.classList.add('show');
    }
  }

  function showProps(el) {
    const empty = document.getElementById('propEmpty');
    const form = document.getElementById('propForm');
    if (!el) { empty.classList.remove('hidden'); form.classList.add('hidden'); return; }
    empty.classList.add('hidden'); form.classList.remove('hidden');
    document.getElementById('propTag').textContent = el.tagName.toLowerCase();

    const editable = isEditableText(el);
    document.getElementById('rowText').style.display = editable ? '' : 'none';
    if (editable) document.getElementById('propText').value = el.textContent.trim();

    const isImg = el.tagName.toLowerCase() === 'img';
    document.getElementById('rowSrc').style.display = isImg ? '' : 'none';
    if (isImg) document.getElementById('propSrc').value = el.getAttribute('src') || '';

    // link: kalau el adalah <a> atau punya <a> dalamnya
    const a = el.tagName.toLowerCase() === 'a' ? el : el.querySelector('a');
    document.getElementById('rowLink').style.display = a ? '' : 'none';
    if (a) document.getElementById('propLink').value = a.getAttribute('href') || '#';

    // warna dari style
    const cs = fd().defaultView.getComputedStyle(el);
    const curColor = readInline(el, 'color') || toHex(cs.color) || '#000000';
    const curBg = readInline(el, 'background-color') || readInline(el, 'background') || toHex(cs.backgroundColor) || '#ffffff';
    if (el.tagName.toLowerCase() !== 'img' && el.tagName.toLowerCase() !== 'hr') {
      document.getElementById('propColor').value = toHex(curColor);
      document.getElementById('propBg').value = toHex(curBg);
    }
    // font family
    const curFont = readInline(el, 'font-family') || '';
    const ffSel = document.getElementById('propFontFamily');
    ffSel.value = curFont ? curFont.replace(/["']/g, '') : '';
    // font size
    const curFsize = readInline(el, 'font-size') || '';
    const fsInput = document.getElementById('propFontSize');
    fsInput.value = curFsize ? parseInt(curFsize) || '' : '';
    // bold/italic/underline
    const curWeight = readInline(el, 'font-weight') || cs.fontWeight || '';
    const curStyle = readInline(el, 'font-style') || cs.fontStyle || '';
    const curDecor = readInline(el, 'text-decoration') || cs.textDecoration || '';
    document.getElementById('propBold').classList.toggle('active', curWeight === '700' || curWeight === 'bold');
    document.getElementById('propItalic').classList.toggle('active', curStyle === 'italic');
    document.getElementById('propUnderline').classList.toggle('active', curDecor.includes('underline'));
    const curAlign = readInline(el, 'text-align') || '';
    document.getElementById('propAlign').value = ['left', 'center', 'right'].includes(curAlign) ? curAlign : '';
    const curPad = readInline(el, 'padding') || readInline(el, 'padding-top') || '0';
    document.getElementById('propPad').value = parseInt(curPad) || 0;
  }

  function readInline(el, prop) {
    const s = el.getAttribute && el.getAttribute('style');
    if (!s) return '';
    const m = s.match(new RegExp(prop + '\\s*:\\s*([^;]+)', 'i'));
    return m ? m[1].trim() : '';
  }
  function setInline(el, prop, val) {
    let s = el.getAttribute('style') || '';
    s = s.replace(new RegExp(prop + '\\s*:\\s*[^;]+;?', 'gi'), '');
    if (val) s += `${prop}:${val};`;
    s = s.replace(/;+/g, ';').replace(/^\s*;|;\s*$/g, '');
    if (s.trim()) el.setAttribute('style', s); else el.removeAttribute('style');
  }

  function toHex(c) {
    if (!c) return '#000000';
    if (c.startsWith('#')) return c.length === 4 ? '#' + c[1]+c[1]+c[2]+c[2]+c[3]+c[3] : c;
    const m = c.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (m) return '#' + [m[1], m[2], m[3]].map((x) => (+x).toString(16).padStart(2, '0')).join('');
    return '#000000';
  }

  // ---- edit handlers ----
  document.getElementById('propText').addEventListener('input', (e) => {
    if (selectedEl) { selectedEl.textContent = e.target.value; syncHtml(); }
  });
  document.getElementById('propSrc').addEventListener('input', (e) => {
    if (selectedEl) { selectedEl.setAttribute('src', e.target.value); syncHtml(); }
  });
  document.getElementById('propLink').addEventListener('input', (e) => {
    const a = selectedEl.tagName.toLowerCase() === 'a' ? selectedEl : selectedEl.querySelector('a');
    if (a) { a.setAttribute('href', e.target.value); syncHtml(); }
  });
  document.getElementById('propColor').addEventListener('input', (e) => {
    if (selectedEl && !['img','hr'].includes(selectedEl.tagName.toLowerCase())) { setInline(selectedEl, 'color', e.target.value); syncHtml(); }
  });
  document.getElementById('propBg').addEventListener('input', (e) => {
    if (selectedEl && !['img','hr'].includes(selectedEl.tagName.toLowerCase())) { setInline(selectedEl, 'background', e.target.value); syncHtml(); }
  });
  document.getElementById('propAlign').addEventListener('change', (e) => {
    if (selectedEl) {
      if (e.target.value) setInline(selectedEl, 'text-align', e.target.value);
      else setInline(selectedEl, 'text-align', '');
      syncHtml();
    }
  });
  document.getElementById('propPad').addEventListener('input', (e) => {
    if (selectedEl) {
      const v = e.target.value ? e.target.value + 'px' : '';
      setInline(selectedEl, 'padding', v);
      syncHtml();
    }
  });

  // Font family
  document.getElementById('propFontFamily').addEventListener('change', (e) => {
    if (selectedEl && !['img','hr'].includes(selectedEl.tagName.toLowerCase())) {
      if (e.target.value) setInline(selectedEl, 'font-family', e.target.value);
      else setInline(selectedEl, 'font-family', '');
      syncHtml();
    }
  });

  // Font size
  document.getElementById('propFontSize').addEventListener('input', (e) => {
    if (selectedEl && !['img','hr'].includes(selectedEl.tagName.toLowerCase())) {
      const v = e.target.value ? e.target.value + 'px' : '';
      setInline(selectedEl, 'font-size', v);
      syncHtml();
    }
  });

  // Bold / Italic / Underline toggle
  document.getElementById('propBold').addEventListener('click', () => {
    if (!selectedEl || ['img','hr'].includes(selectedEl.tagName.toLowerCase())) return;
    const btn = document.getElementById('propBold');
    const active = btn.classList.toggle('active');
    setInline(selectedEl, 'font-weight', active ? '700' : '');
    syncHtml();
  });
  document.getElementById('propItalic').addEventListener('click', () => {
    if (!selectedEl || ['img','hr'].includes(selectedEl.tagName.toLowerCase())) return;
    const btn = document.getElementById('propItalic');
    const active = btn.classList.toggle('active');
    setInline(selectedEl, 'font-style', active ? 'italic' : '');
    syncHtml();
  });
  document.getElementById('propUnderline').addEventListener('click', () => {
    if (!selectedEl || ['img','hr'].includes(selectedEl.tagName.toLowerCase())) return;
    const btn = document.getElementById('propUnderline');
    const active = btn.classList.toggle('active');
    // merge with existing text-decoration (if any)
    const existing = readInline(selectedEl, 'text-decoration') || '';
    let newDeco;
    if (active) {
      newDeco = existing.includes('underline') ? existing : (existing ? existing + ' underline' : 'underline');
    } else {
      newDeco = existing.replace(/underline\s*/g, '').trim() || '';
    }
    setInline(selectedEl, 'text-decoration', newDeco);
    syncHtml();
  });

  function syncHtml() {
    const d = fd();
    if (!d || !d.body) return;
    // ambil body html terbaru dari iframe (tanpa atribut seleksi)
    const clone = d.body.cloneNode(true);
    clone.querySelectorAll('[data-vhe-sel]').forEach((e) => e.removeAttribute('data-vhe-sel'));
    data.html = clone.innerHTML;
  }

  document.getElementById('btnUp').addEventListener('click', () => moveEl(-1));
  document.getElementById('btnDown').addEventListener('click', () => moveEl(1));
  document.getElementById('btnDel').addEventListener('click', () => {
    if (!selectedEl) return;
    selectedEl.remove(); selectedEl = null; syncHtml(); rerender(); toast('Elemen dihapus');
  });
  function moveEl(dir) {
    if (!selectedEl) return;
    const par = selectedEl.parentElement;
    if (!par) return;
    if (dir < 0 && selectedEl.previousElementSibling) par.insertBefore(selectedEl, selectedEl.previousElementSibling);
    else if (dir > 0 && selectedEl.nextElementSibling) par.insertBefore(selectedEl.nextElementSibling, selectedEl);
    syncHtml(); rerender();
  }

  // ---- frame events ----
  function clearDropMarks(d) {
    d.querySelectorAll('[data-vhe-drop]').forEach((e) => e.removeAttribute('data-vhe-drop'));
  }
  function closestDraggable(e) {
    return e.target.closest('[data-vhe-id], section, h1, h2, h3, h4, h5, p, a, img, div, li, blockquote, span');
  }
  function bindFrame() {
    const d = fd();
    if (!d) return;
    // toggle class edit supaya hover outline muncul
    const syncEditClass = () => d.body.classList.toggle('vhe-edit', document.getElementById('editMode').checked);
    syncEditClass();
    document.getElementById('editMode').addEventListener('change', syncEditClass);

    // buat semua elemen yang bisa dipilih jadi draggable (HTML5 DnD butuh atribut ini)
    const markDraggable = () => {
      d.querySelectorAll('section, h1, h2, h3, h4, h5, p, a, img, div, li, blockquote, span')
        .forEach((el) => { if (!el.hasAttribute('data-vhe-nodrag')) el.draggable = true; });
    };
    markDraggable();
    new MutationObserver(markDraggable).observe(d.body, { childList: true, subtree: true });

    d.addEventListener('click', (e) => {
      if (!document.getElementById('editMode').checked) return;
      const el = closestDraggable(e);
      if (el && d.body.contains(el)) { e.preventDefault(); e.stopPropagation(); selectEl(el); }
    });
    d.addEventListener('dblclick', (e) => {
      if (!document.getElementById('editMode').checked) return;
      const el = closestDraggable(e);
      if (el && isEditableText(el) && d.body.contains(el)) {
        e.preventDefault();
        el.setAttribute('contenteditable', 'true');
        el.focus();
        selectEl(el);
        const save = () => {
          el.removeAttribute('contenteditable');
          el.removeEventListener('blur', save);
          syncHtml();
        };
        el.addEventListener('blur', save);
      }
    });

    // ---- drop blok baru dari palette (pakai DnD HTML5 dari luar iframe) ----
    d.addEventListener('dragover', (e) => { if (e.dataTransfer && e.dataTransfer.types.includes('application/x-vhe-new')) e.preventDefault(); });
    d.addEventListener('drop', (e) => {
      if (!e.dataTransfer) return;
      const type = e.dataTransfer.getData('application/x-vhe-new');
      if (!type) return;
      e.preventDefault();
      const over = closestDraggable(e);
      const tmp = d.createElement('div');
      tmp.innerHTML = VHE.blockHtml(type);
      const node = tmp.firstElementChild;
      if (over && d.body.contains(over)) {
        const r = over.getBoundingClientRect();
        const before = (e.clientY - r.top) < (r.height / 2);
        if (before) over.parentNode.insertBefore(node, over);
        else over.parentNode.insertBefore(node, over.nextSibling);
      } else {
        d.body.appendChild(node);
      }
      clearDropMarks(d);
      syncHtml(); rerender();
      const added = fd().body.querySelector(`[data-vhe-id="${node.getAttribute('data-vhe-id')}"]`);
      if (added) selectEl(added);
      toast('Blok ditambah');
    });
  }

  // palette drag + click
  palette.querySelectorAll('.palette-item').forEach((item) => {
    item.addEventListener('click', () => {
      const tmp = fd().createElement('div');
      tmp.innerHTML = VHE.blockHtml(item.dataset.type);
      const node = tmp.firstElementChild;
      fd().body.appendChild(node);
      syncHtml(); rerender();
      const added = fd().body.querySelector(`[data-vhe-id="${node.getAttribute('data-vhe-id')}"]`);
      if (added) selectEl(added);
      toast('Blok ditambah di bawah');
    });
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('application/x-vhe-new', item.dataset.type);
    });
  });

  // CSS editor live
  const cssEditor = document.getElementById('cssEditor');
  cssEditor.addEventListener('input', () => {
    data.css = cssEditor.value;
    rerender();
    // kembalikan fokus & refresh nilai cssEditor (rerender tidak mengubah textarea)
  });

  // device toggle
  document.getElementById('btnDeviceDesktop').addEventListener('click', () => {
    document.getElementById('btnDeviceDesktop').classList.add('active');
    document.getElementById('btnDeviceMobile').classList.remove('active');
    rerender();
  });
  document.getElementById('btnDeviceMobile').addEventListener('click', () => {
    document.getElementById('btnDeviceMobile').classList.add('active');
    document.getElementById('btnDeviceDesktop').classList.remove('active');
    rerender();
  });

  // desktop panel collapse
  const ws = document.querySelector('.workspace');
  const panelLeft = document.getElementById('panelLeft');
  const panelRight = document.getElementById('panelRight');
  function togglePanel(side, collapse) {
    const panel = side === 'left' ? panelLeft : panelRight;
    const wsClass = side === 'left' ? 'collapsed-left' : 'collapsed-right';
    panel.classList.toggle('collapsed', collapse);
    ws.classList.toggle(wsClass, collapse);
  }
  document.getElementById('btnCollapseLeft').addEventListener('click', () => togglePanel('left', true));
  document.getElementById('btnCollapseRight').addEventListener('click', () => togglePanel('right', true));
  document.getElementById('railLeft').addEventListener('click', () => togglePanel('left', false));
  document.getElementById('railRight').addEventListener('click', () => togglePanel('right', false));

  // mobile panel drawers
  const fabL = document.getElementById('fabLeft');
  const fabR = document.getElementById('fabRight');
  const backdrop = document.getElementById('wsBackdrop');
  const pl = document.querySelector('.panel-left');
  const pr = document.querySelector('.panel-right');
  function closeDrawers() { pl.classList.remove('open'); pr.classList.remove('open'); backdrop.classList.remove('show'); }
  if (fabL) fabL.addEventListener('click', () => { pr.classList.remove('open'); pl.classList.toggle('open'); backdrop.classList.toggle('show', pl.classList.contains('open')); });
  if (fabR) fabR.addEventListener('click', () => { pl.classList.remove('open'); pr.classList.toggle('open'); backdrop.classList.toggle('show', pr.classList.contains('open')); });
  if (backdrop) backdrop.addEventListener('click', closeDrawers);

  // import
  const importModal = document.getElementById('importModal');
  document.getElementById('btnImport').addEventListener('click', () => importModal.classList.remove('hidden'));
  document.getElementById('btnImportCancel').addEventListener('click', () => importModal.classList.add('hidden'));
  document.getElementById('btnImportOk').addEventListener('click', () => {
    const val = document.getElementById('importArea').value;
    if (!val.trim()) return;
    try {
      data = VHE.fromRaw(val);
      document.getElementById('docName').value = data.title || 'Website Import';
      cssEditor.value = data.css || '';
      rerender();
      importModal.classList.add('hidden');
      toast('HTML diimpor — desain asli tampil utuh');
    } catch (err) { toast('Gagal impor: ' + err.message); }
  });

  // save/load
  document.getElementById('btnSave').addEventListener('click', async () => {
    syncHtml();
    const name = document.getElementById('docName').value || 'Tanpa Judul';
    const body = JSON.stringify({ id: docId, name, data });
    const r = await fetch('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    const j = await r.json();
    docId = j.id;
    toast('Tersimpan: ' + name);
  });
  document.getElementById('btnLoad').addEventListener('click', async () => {
    const r = await fetch('/api/list'); const list = await r.json();
    const box = document.getElementById('loadList'); box.innerHTML = '';
    if (!list.length) box.innerHTML = '<div class="prop-empty">Belum ada project tersimpan.</div>';
    list.forEach((it) => {
      const row = document.createElement('div'); row.className = 'load-item';
      const time = new Date(it.updated).toLocaleString('id-ID');
      row.innerHTML = `<span class="li-name">${it.name}</span><span class="li-time">${time}</span>`;
      const open = document.createElement('button'); open.className = 'btn btn-sm'; open.textContent = 'Buka';
      open.addEventListener('click', async () => {
        const rr = await fetch('/api/load?id=' + it.id); const j = await rr.json();
        data = j.data || VHE.fromRaw(''); docId = j.id;
        document.getElementById('docName').value = j.name;
        cssEditor.value = data.css || '';
        rerender();
        document.getElementById('loadModal').classList.add('hidden');
        toast('Dibuka: ' + j.name);
      });
      const del = document.createElement('button'); del.className = 'btn btn-sm btn-danger'; del.textContent = 'Hapus';
      del.addEventListener('click', async () => {
        await fetch('/api/delete?id=' + it.id, { method: 'POST' });
        row.remove(); toast('Dihapus');
      });
      row.appendChild(open); row.appendChild(del); box.appendChild(row);
    });
    document.getElementById('loadModal').classList.remove('hidden');
  });
  document.getElementById('btnLoadClose').addEventListener('click', () => document.getElementById('loadModal').classList.add('hidden'));

  // export
  const exportModal = document.getElementById('exportModal');
  document.getElementById('btnExport').addEventListener('click', () => {
    syncHtml();
    document.getElementById('exportArea').value = VHE.serialize(data);
    exportModal.classList.remove('hidden');
  });
  document.getElementById('btnExportClose').addEventListener('click', () => exportModal.classList.add('hidden'));
  document.getElementById('btnExportCopy').addEventListener('click', async () => {
    const ta = document.getElementById('exportArea'); ta.select();
    try { await navigator.clipboard.writeText(ta.value); toast('Tersalin'); } catch { document.execCommand('copy'); toast('Tersalin'); }
  });
  document.getElementById('btnExportDownload').addEventListener('click', () => {
    syncHtml();
    const blob = new Blob([VHE.serialize(data)], { type: 'text/html' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = (document.getElementById('docName').value || 'website') + '.html'; a.click();
    URL.revokeObjectURL(a.href);
  });

  // init
  rerender();
})();
