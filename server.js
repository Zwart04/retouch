#!/usr/bin/env node
'use strict';
// Visual HTML Editor — zero-dependency static server + save/load API.
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.VHE_PORT || 3460;
const PUBLIC = path.join(__dirname, 'public');
const DATA = path.join(__dirname, 'data');
if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'text/plain; charset=utf-8' });
  res.end(body);
}

function sendStatic(res, file, type) {
  res.writeHead(200, {
    'Content-Type': type || 'application/octet-stream',
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
  res.end(fs.readFileSync(file));
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 5e6) req.destroy(); });
    req.on('end', () => resolve(data));
  });
}

function listProjects() {
  try {
    return fs.readdirSync(DATA)
      .filter((f) => f.endsWith('.json'))
      .map((f) => {
        const p = path.join(DATA, f);
        try {
          const j = JSON.parse(fs.readFileSync(p, 'utf8'));
          return { id: j.id, name: j.name, updated: j.updated || 0 };
        } catch { return null; }
      })
      .filter(Boolean)
      .sort((a, b) => (b.updated || 0) - (a.updated || 0));
  } catch { return []; }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;

  // ---- API ----
  if (p.startsWith('/api/')) {
    if (p === '/api/list' && req.method === 'GET') {
      return send(res, 200, JSON.stringify(listProjects()), 'application/json');
    }
    if (p === '/api/save' && req.method === 'POST') {
      const raw = await readBody(req);
      let obj;
      try { obj = JSON.parse(raw); } catch { return send(res, 400, 'bad json'); }
      const id = (obj.id && /^[a-z0-9_-]{1,64}$/i.test(obj.id)) ? obj.id : crypto.randomBytes(6).toString('hex');
      const rec = { id, name: (obj.name || 'Tanpa Judul').slice(0, 80), data: obj.data || { title: '', head: '', css: '', html: '' }, updated: Date.now() };
      fs.writeFileSync(path.join(DATA, id + '.json'), JSON.stringify(rec, null, 2));
      return send(res, 200, JSON.stringify({ ok: true, id }), 'application/json');
    }
    if (p === '/api/load' && req.method === 'GET') {
      const id = url.searchParams.get('id') || '';
      const file = path.join(DATA, id + '.json');
      if (!/^[a-z0-9_-]{1,64}$/i.test(id) || !fs.existsSync(file)) return send(res, 404, 'not found');
      return send(res, 200, fs.readFileSync(file, 'utf8'), 'application/json');
    }
    if (p === '/api/delete' && req.method === 'POST') {
      const id = url.searchParams.get('id') || '';
      if (!/^[a-z0-9_-]{1,64}$/i.test(id)) return send(res, 400, 'bad id');
      const file = path.join(DATA, id + '.json');
      if (fs.existsSync(file)) fs.unlinkSync(file);
      return send(res, 200, JSON.stringify({ ok: true }), 'application/json');
    }
    return send(res, 404, 'unknown api');
  }

  // ---- static ----
  let rel = p === '/' ? '/index.html' : p;
  let file = path.join(PUBLIC, path.normalize(rel));
  if (!file.startsWith(PUBLIC)) return send(res, 403, 'forbidden');
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, 'not found');
  sendStatic(res, file, MIME[path.extname(file)] || 'application/octet-stream');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Visual HTML Editor running at http://0.0.0.0:${PORT}`);
});
