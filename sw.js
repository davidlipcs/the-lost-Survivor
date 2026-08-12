// THE LOST SURVIVOR — service worker
// Célja: telepíthetőség (PWA) + alap offline működés. Nem szerver, csak a böngésző
// saját cache-ét használja ezen az eszközön belül.
const CACHE_NAME = 'lostsurvivor-cache-v4';
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE.map(u => new Request(u, { cache: 'reload' }))).catch(()=>{})
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Stratégia: MINDIG a hálózatot próbáljuk először, és kifejezetten a böngésző saját
// HTTP-cache-ét is megkerüljük ('no-store') — így soha nem ragadhat be egy régi verzió.
// Csak akkor szolgálunk ki a mentett másolatból, ha tényleg nincs internet.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if(req.method !== 'GET') return;
  // csak a saját origin-ünket kezeljük — külső kérés (pl. felhő-mentés) menjen érintetlenül
  if(new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req, { cache: 'no-store' })
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(()=>{});
        return resp;
      })
      .catch(() => caches.match(req).then((r) =>
        r || (req.mode === 'navigate' ? caches.match('./index.html').then(x => x || caches.match('./')) : undefined)
      ))
  );
});
