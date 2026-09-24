const CACHE_NAME = 'cloudcrossover-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './crossover-guide.html',
  './adr-generator.html',
  './assets/css/style.css',
  './assets/js/calculators.js',
  './assets/js/app.js',
  './assets/img/favicon.svg',
  './site.webmanifest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request);
    })
  );
});
