/* Service Worker: App-Hülle offline verfügbar. Daten kommen aus dem Firestore-Offline-Cache. */
const V = 'budget-v4';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png?v=4', 'icon-512.png?v=4', 'apple-touch-icon.png?v=4'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).catch(() => {}).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const same = u.origin === location.origin, sdk = u.hostname === 'www.gstatic.com' && u.pathname.includes('/firebasejs/');
  if (!same && !sdk) return;                      // Firestore / Auth-Aufrufe nie anfassen
  if (sdk) {                                       // versionierte SDK-Dateien: Cache zuerst
    e.respondWith(caches.match(r).then(h => h || fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })));
    return;
  }
  e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r).then(h => h || caches.match('index.html'))));
});
