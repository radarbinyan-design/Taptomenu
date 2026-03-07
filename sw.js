// ===== TapMenu Service Worker v1.2 =====
const CACHE_NAME = 'tapmenu-v1.2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.html',
  '/pricing.html',
  '/how-it-works.html',
  '/contact.html',
  '/luxe.html',
  '/css/main.css',
  '/css/luxe.css',
  '/js/main.js',
  '/manifest.json',
  '/demo/araks-restaurant.html',
  '/demo/cafe-nairi.html',
  '/demo/bar-masis.html',
  '/demo/noyan-tapan.html',
];

// ===== INSTALL =====
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('data:'))))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('Cache install error:', err))
  );
});

// ===== ACTIVATE =====
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ===== FETCH — Network First, fallback to Cache =====
self.addEventListener('fetch', event => {
  // Skip non-GET, cross-origin, and extension requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  // API requests — network only
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed — try cache
        return caches.match(event.request)
          .then(cached => {
            if (cached) return cached;
            // Return app.html as fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/app.html') || caches.match('/index.html');
            }
          });
      })
  );
});

// ===== PUSH NOTIFICATIONS (future) =====
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'TapMenu', {
    body: data.body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'tapmenu-notification',
  });
});
