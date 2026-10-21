const V = 'maxcycle-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Serve from cache first, refresh the cache in the background.
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  e.respondWith(caches.match(r).then(hit => {
    const net = fetch(r).then(res => {
      if (res && (res.ok || res.type === 'opaque')) {
        const cp = res.clone();
        caches.open(V).then(c => c.put(r, cp));
      }
      return res;
    }).catch(() => hit || caches.match('./index.html'));
    return hit || net;
  }));
});
