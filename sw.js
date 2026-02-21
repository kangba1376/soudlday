const VERSION = 'soul-day-2026-02-21-13:50'; 
const CACHE_NAME = `soulday-cache-${VERSION}`;

const ASSETS = [
  './',
  './index.html',
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
  self.skipWaiting(); // 强制跳过等待，立即激活新版本
});

// 激活阶段：清理旧版本的过期缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          // 如果缓存名称不是当前的 VERSION，就全部删除
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // 立即取得页面的控制权
});

// 策略：缓存优先，如果没缓存再走网络
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // 动态缓存新请求的资源
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});