const CACHE_NAME = "DaggerFate-v3";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// INSTALL - Cache inicial
self.addEventListener("install", event => {
  console.log("[Service Worker] Instalando:", CACHE_NAME);

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// FETCH - Cache first + fallback offline
self.addEventListener("fetch", event => {
  // Ignora requests que não são GET
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(response => {
      // Retorna do cache se existir
      if (response) {
        return response;
      }

      // Senão, busca da rede
      return fetch(event.request)
        .then(networkResponse => {
          // Só cacheia respostas válidas
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // Só cacheia recursos do próprio site
          if (event.request.url.startsWith(self.location.origin)) {
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }

          return networkResponse;
        })
        .catch(() => {
          // Fallback offline (abre o app mesmo sem internet)
          return caches.match("./index.html");
        });
    })
  );
});

// ACTIVATE - Limpa caches antigos
self.addEventListener("activate", event => {
  console.log("[Service Worker] Ativando:", CACHE_NAME);

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Removendo cache antigo:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});
