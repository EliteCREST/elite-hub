const CACHE_NAME = 'elite-hub-v1';
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

// Fetch — serve from cache first, update in background
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only cache same-origin HTML pages
  if (url.origin === 'https://elitecrest.github.io' && event.request.destination === 'document') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(event.request);
        const networkFetch = fetch(event.request).then(response => {
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        }).catch(() => cached);

        // Return cached immediately, update in background
        return cached || networkFetch;
      })
    );
    return;
  }

  // For GAS backend calls — network only (always fresh)
  if (url.hostname.includes('script.google.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Everything else — cache first
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
