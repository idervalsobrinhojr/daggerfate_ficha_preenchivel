const CACHE_NAME = "DaggerFate-v2";

const FILES_TO_CACHE = [
  "./",
"./index.html",
"./manifest.json"
];

// INSTALL - Cacheia os arquivos
self.addEventListener("install", event => {
  console.log("[Service Worker] Instalando versão:", CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => {
      console.log("[Service Worker] Arquivos em cache");
      return cache.addAll(FILES_TO_CACHE);
    })
    .catch(err => {
      console.error("[Service Worker] Erro ao cachear:", err);
    })
  );
  // Força o Service Worker a ativar imediatamente
  self.skipWaiting();
});

// FETCH - Estratégia cache-first
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
    .then(response => {
      // Retorna do cache se encontrado
      if (response) {
        return response;
      }

      // Se não estiver no cache, busca da rede
      return fetch(event.request).then(response => {
        // Opcional: cachear novas requisições
        if (!response || response.status !== 200) {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
        .then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// ACTIVATE - Limpa caches antigos
self.addEventListener("activate", event => {
  console.log("[Service Worker] Ativando versão:", CACHE_NAME);

  const cacheWhitelist = [CACHE_NAME]; // ✅ Usa o nome correto

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log("[Service Worker] Deletando cache antigo:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Toma controle de todas as abas abertas
  return self.clients.claim();
})
