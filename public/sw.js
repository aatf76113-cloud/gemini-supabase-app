// Zain Automation Service Worker v2.4.0-prod
const CACHE_NAME = 'zain-auto-v2.4.0-prod';
const DYNAMIC_CACHE = 'zain-dynamic-v2.4.0';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './version.json'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Precaching app shell...');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache partial warning:', err);
      });
    }).catch((e) => {
      console.warn('[ServiceWorker] Cache open error:', e);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key).catch(() => {});
          }
        })
      );
    }).catch((e) => {
      console.warn('[ServiceWorker] Cache keys error:', e);
    })
  );
  return self.clients.claim();
});

// Fetch Event (Network-first for API, Cache-first for static assets)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (!req || req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch (e) {
    return;
  }

  if (!url || !url.protocol.startsWith('http')) return;

  // Handle API & Firestore calls (Network-first with fallback)
  if (url.pathname.startsWith('/api/') || url.hostname.includes('firestore') || url.hostname.includes('googleapis') || url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
            const resClone = networkRes.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              try {
                cache.put(req, resClone).catch(() => {});
              } catch (e) {}
            }).catch(() => {});
          }
          return networkRes;
        })
        .catch(async () => {
          try {
            const cached = await caches.match(req);
            if (cached) return cached;
          } catch (e) {}
          return new Response(JSON.stringify({ error: 'Offline', offline: true }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Handle App Shell & Static Assets (Cache-first with network fallback)
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      if (cachedRes) return cachedRes;

      return fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200 && (networkRes.type === 'basic' || networkRes.type === 'cors')) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => {
              try {
                cache.put(req, resClone).catch(() => {});
              } catch (e) {}
            }).catch(() => {});
          }
          return networkRes;
        })
        .catch(async () => {
          if (req.mode === 'navigate') {
            try {
              const fallback = (await caches.match('./index.html')) || (await caches.match('/index.html'));
              if (fallback) return fallback;
            } catch (e) {}
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
    }).catch(() => {
      return fetch(req).catch(() => new Response('Offline', { status: 503 }));
    })
  );
});

// Push Notification Listener
self.addEventListener('push', (event) => {
  let data = { title: 'Zain Automation', body: 'تنبيه جديد من مسارات العمل المأتمتة!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: './icons/icon.svg',
    badge: './icons/icon.svg',
    dir: 'rtl',
    lang: 'ar',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || './'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options).catch((e) => {
      console.warn('[ServiceWorker] showNotification failed:', e);
    })
  );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || './';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    }).catch((e) => {
      console.warn('[ServiceWorker] Notification click navigation error:', e);
    })
  );
});

// Message Listener from Client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
