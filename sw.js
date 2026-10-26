// Service worker «Весёлой Азбуки»: офлайн-режим.
// Файлы сайта — сначала сеть (чтобы обновления доходили сразу), кэш про запас.
// Аудио — сначала кэш (оно не меняется), сеть при промахе.
const CACHE = 'azbuka-v4';
const CORE = [
  '.',
  'index.html',
  'english.html',
  'record.html',
  'style.css',
  'script.js',
  'script-en.js',
  'data.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // cache:'reload' — при установке всегда берём свежие файлы, минуя HTTP-кэш
      .then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function cacheCopy(request, res) {
  if (res && res.ok) {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(request, copy));
  }
  return res;
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Кэшируем только свои файлы; шрифты Google подхватятся, пока есть сеть
  if (url.origin !== location.origin) return;

  if (url.pathname.includes('/audio/')) {
    // Аудио: кэш → сеть
    e.respondWith(
      caches.match(e.request).then(hit =>
        hit || fetch(e.request).then(res => cacheCopy(e.request, res)))
    );
  } else {
    // Сайт: сеть → кэш (офлайн). cache:'no-cache' — всегда сверяемся с сервером,
    // чтобы обновления кода доходили сразу, минуя HTTP-кэш браузера
    e.respondWith(
      fetch(e.request, { cache: 'no-cache' })
        .then(res => cacheCopy(e.request, res))
        .catch(() => caches.match(e.request))
    );
  }
});
