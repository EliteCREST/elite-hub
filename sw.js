const CACHE_NAME = 'elite-hub-v2';
const BASE = 'https://elitecrest.github.io/elite-hub';
const PAGES = [
  '/',
  '/index.html',
  '/compliance.html',
  '/fleet.html',
  '/legal.html',
  '/reviews.html',
  '/documents.html',
  '/hub_cleveland.html',
  '/hub_phoenix.html',
  '/hub_albuquerque.html',
  '/hub_minneapolis.html',
  '/hub_stlouis.html',
  '/hub_chicago.html',
  '/hub_indianapolis.html',
  '/hub_pittsburgh.html',
  '/hub_milwaukee.html',
  '/admin.html',
  '/compliance_admin.html',
  '/fleet_admin.html',
  '/legal_admin.html',
  '/reviews_admin.html',
  '/scoring_rules.html',
];

// Install — cache all pages
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        PAGES.map(page => cache.add(BASE + page).catch(() => {}))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate — clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — never intercept external requests (GAS, APIs, CDNs)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Let ALL external requests pass through untouched — no interception
  if (url.origin !== 'https://elitecrest.github.io') return;

  // Only cache same-origin HTML pages
  if (event.request.destination === 'document') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(event.request);
        const networkFetch = fetch(event.request).then(response => {
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // Everything else same-origin — cache first
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
