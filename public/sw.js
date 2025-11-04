const CACHE_NAME = 'chat-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/config.js',
  '/styles.css',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json'
];

// Service Worker kurulumunda kaynakları önbelleğe al
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Önbellek açıldı');
        return cache.addAll(urlsToCache);
      })
  );
});

// İstek gelince önbelleğe bak, yoksa ağa git (Cache-First stratejisi)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Önbellekte varsa onu döndür
        if (response) {
          return response;
        }
        
        // Önbellekte yoksa ağdan getir ve önbelleğe ekle
        return fetch(event.request)
          .then(response => {
            // API çağrıları için önbelleğe alma
            if (!response || response.status !== 200 || response.type !== 'basic' || event.request.url.includes('/api/')) {
              return response;
            }

            let responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});

// Yeni sürüm geldiğinde eski önbelleği temizle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
