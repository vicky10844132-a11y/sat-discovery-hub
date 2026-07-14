const CACHE_NAME = 'gs-linkops-ai-pwa-v1';
const APP_ASSETS = [
  '/gs-linkops-ai',
  '/gs-linkops-ai.html',
  '/gs-linkops-manifest.webmanifest',
  '/gs-linkops-icon.svg',
  '/gs-linkops-assets/app00.gz.b64',
  '/gs-linkops-assets/app01.gz.b64',
  '/gs-linkops-assets/app02.gz.b64'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached || caches.match('/gs-linkops-ai.html'));

      return cached || network;
    })
  );
});
