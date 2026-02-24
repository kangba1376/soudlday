const VERSION = 'soul-day-2026-02-24-20:23'; 
const CACHE_NAME = VERSION; // 确保 CACHE_NAME 使用你的 VERSION

const ASSETS = [
  './',
  './index.html',
  './tailwind.js', // 核心改动：加入本地脚本缓存
  './TibetWildYak.ttf',
  './logo.png',
  './favicon.png',
  './favicon-small.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './manifest.json',
  './1.png', './2.png', './3.png', './4.png', './5.png', './6.png',
  './7.png', './8.png', './9.png', './10.png', './11.png', './12.png'
];

// 安装阶段：下载新资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); 
});

// 激活阶段：清理旧版本
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); 
});

// 策略：缓存优先
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});