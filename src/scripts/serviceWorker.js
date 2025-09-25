const cacheName = "fcMediaPlayer-v1.1";

const filesToCache = [
    '/fcmediaplayer/',
    '/fcmediaplayer/index.html',
    '/fcmediaplayer/manifest.json',
    '/fcmediaplayer/src/scripts/jsmediatags.min.js',
    '/fcmediaplayer/src/scripts/player.js',
    '/fcmediaplayer/src/log/devlog.txt',
    '/fcmediaplayer/src/img/album-placeholder.js',
    '/fcmediaplayer/src/img/favicon.ico',
    '/fcmediaplayer/src/img/icon512_maskable.png',
    '/fcmediaplayer/src/img/icon512_rounded.png'
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
