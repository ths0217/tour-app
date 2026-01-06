const CACHE_NAME = 'bangkok-spa-v5';
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icons/app-icon.svg'
];

const scopePath = new URL(self.registration?.scope || './', self.location.href).pathname;

const normalizePath = (pathname) => {
  if (pathname.startsWith(scopePath)) {
    const trimmed = pathname.slice(scopePath.length);
    return trimmed ? `./${trimmed}` : './';
  }
  return pathname;
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const normalizedPath = normalizePath(url.pathname);

  // Cache-first for same-origin static files
  if (url.origin === location.origin && CORE_ASSETS.includes(normalizedPath)) {
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
    return;
  }

  // Network-first for everything else with offline fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
  });
