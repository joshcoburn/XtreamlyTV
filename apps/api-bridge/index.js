'use strict';

const http = require('http');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 8787);
const ALLOWED_ACTIONS = new Set([
  '', 'get_live_categories', 'get_live_streams', 'get_short_epg',
  'get_vod_categories', 'get_vod_streams', 'get_vod_info',
  'get_series_categories', 'get_series', 'get_series_info'
]);

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
}

function send(res, status, body) {
  cors(res);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 256 * 1024) req.destroy(new Error('Request too large'));
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); } catch (error) { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function validServer(value) {
  try {
    const url = new URL(String(value));
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.username = ''; url.password = ''; url.search = ''; url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch (_) { return null; }
}

const server = http.createServer(async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
  if (req.method === 'GET' && req.url === '/health') return send(res, 200, { ok: true, service: 'xtreamlytv-api-bridge' });
  if (req.method !== 'POST' || req.url !== '/api/xtream') return send(res, 404, { error: 'Not found' });

  try {
    const body = await readJson(req);
    const base = validServer(body.server);
    if (!base || !body.username || !body.password) return send(res, 400, { error: 'server, username, and password are required' });
    const params = body.params && typeof body.params === 'object' ? body.params : {};
    const action = String(params.action || '');
    if (!ALLOWED_ACTIONS.has(action)) return send(res, 400, { error: 'Unsupported action' });

    const target = new URL(base + '/player_api.php');
    target.searchParams.set('username', String(body.username));
    target.searchParams.set('password', String(body.password));
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && ['action','category_id','stream_id','vod_id','series_id','limit'].includes(key)) {
        target.searchParams.set(key, String(value));
      }
    }

    const upstream = await fetch(target, {
      headers: { 'User-Agent': 'XtreamlyTV-API-Bridge/0.4' },
      signal: AbortSignal.timeout(18000)
    });
    const text = await upstream.text();
    cors(res);
    res.statusCode = upstream.status;
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    res.end(text);
  } catch (error) {
    send(res, 502, { error: error.message || 'Upstream request failed' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`XtreamlyTV API Bridge listening on port ${PORT}`);
});
