const VERSION = 'soul-day-2026-02-24-19:52';
const CACHE_NAME = `soul-day-cache-${VERSION}`;
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './TibetWildYak.ttf',
  './logo.png',
  './favicon.png',
  './favicon-small.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './1.png','./2.png','./3.png','./4.png','./5.png','./6.png',
  './7.png','./8.png','./9.png','./10.png','./11.png','./12.png',
  './tailwindcdn.js'
];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    for (const url of PRECACHE_ASSETS) {
      try {
        const isCross = /^https?:\/\//i.test(url) && !url.startsWith(self.location.origin);
        const req = isCross ? new Request(url, {mode: 'no-cors', cache: 'reload'}) : new Request(url, {cache: 'reload'});
        const res = await fetch(req);
        await cache.put(req, res.clone());
      } catch (_) {}
    }
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => k === CACHE_NAME ? Promise.resolve() : caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', e => {
  if (e && e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match('./index.html');
      const update = (async () => {
        try {
          const net = await fetch(req);
          await cache.put('./index.html', net.clone());
          return net;
        } catch (_) {
          return null;
        }
      })();
      if (cached) {
        e.waitUntil(update);
        return cached;
      }
      const netRes = await update;
      if (netRes) return netRes;
      return new Response('', {status: 504});
    })());
    return;
  }
  if (url.origin === self.location.origin && /\.(?:png|jpe?g|gif|svg|webp|ico|ttf|woff2?|json|js|css)$/.test(url.pathname)) {
    e.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const net = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, net.clone());
        return net;
      } catch (_) {
        const fallback = await caches.match('./logo.png');
        if (fallback) return fallback;
        return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>', {headers: {'Content-Type': 'image/svg+xml'}});
      }
    })());
    return;
  }
  e.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      return await fetch(req);
    } catch (_) {
      if (req.destination === 'image') {
        const fallback = await caches.match('./logo.png');
        if (fallback) return fallback;
        return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>', {headers: {'Content-Type': 'image/svg+xml'}});
      }
      return new Response('', {status: 504});
    }
  })());
});
