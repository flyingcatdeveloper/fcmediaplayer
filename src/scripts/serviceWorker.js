const cacheName = "fcMediaPlayer-v1.1";

const filesToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/src/scripts/jsmediatags.min.js',
    '/src/scripts/player.js',
    '/src/log/devlog.txt',
    '/src/img/album-placeholder.js',
    '/src/img/favicon.ico',
    '/src/img/icon512_maskable.png',
    '/src/img/icon512_rounded.png'
]

self.addEventListener("install", e => {
  console.log("[ServiceWorker] - Install");
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    console.log("[ServiceWorker] - Caching app shell");
    await cache.addAll(filesToCache);
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keyList = await caches.keys();
    await Promise.all(
      keyList.map(key => {
        console.log(key);
        if (key !== cacheName) {
          console.log("[ServiceWorker] - Removing old cache", key);
          return caches.delete(key);
        }
      })
    );
  })());
  e.waitUntil(self.clients.claim());
});
