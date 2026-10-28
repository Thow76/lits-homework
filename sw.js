/* Service worker: offline after first load.
   - App shell: stale-while-revalidate (serve cached, refresh in background).
   - Unit JSON (units/**.json): network first, cache fallback, so newly opened sections appear.
   - Images and audio: cache first, fetched once and kept.
   Bump CACHE_VERSION when shipping breaking changes to the shell. */
const CACHE_VERSION = 'lits-v1';
const SHELL = [
  './', './index.html', './css/style.css', './js/icons.js', './js/activities.js', './js/app.js',
  './strings.json', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type === 'precache' && Array.isArray(d.urls)) {
    e.waitUntil(caches.open(CACHE_VERSION).then(async (c) => {
      for (const u of d.urls) {
        try { if (!(await c.match(u))) { const r = await fetch(u); if (r.ok) await c.put(u, r); } } catch (_) { /* offline: skip */ }
      }
    }));
  }
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // never touch GoatCounter or other origins

  if (url.pathname.includes('/units/') && url.pathname.endsWith('.json')) {
    e.respondWith(networkFirst(req));
  } else if (/\.(png|jpe?g|gif|webp|svg|mp3|ogg|m4a|wav)$/i.test(url.pathname)) {
    e.respondWith(cacheFirst(req));
  } else {
    e.respondWith(staleWhileRevalidate(req));
  }
});

async function networkFirst(req) {
  const c = await caches.open(CACHE_VERSION);
  try {
    const r = await fetch(req, { cache: 'no-store' });
    if (r.ok) c.put(req, r.clone());
    return r;
  } catch (_) {
    const hit = await c.match(req);
    return hit || new Response('{"error":"offline"}', { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
}

async function cacheFirst(req) {
  const c = await caches.open(CACHE_VERSION);
  const hit = await c.match(req);
  if (hit) return hit;
  try {
    const r = await fetch(req);
    if (r.ok) c.put(req, r.clone());
    return r;
  } catch (_) {
    return new Response('', { status: 503 });
  }
}

async function staleWhileRevalidate(req) {
  const c = await caches.open(CACHE_VERSION);
  const key = req.mode === 'navigate' ? './index.html' : req;
  const hit = await c.match(key);
  const net = fetch(req).then((r) => { if (r.ok) c.put(key, r.clone()); return r; }).catch(() => null);
  if (hit) { net.catch(() => {}); return hit; }
  const r = await net;
  return r || new Response('Offline', { status: 503 });
}
