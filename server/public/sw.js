// import fs from 'fs';
// const pkg = JSON.parse(fs.readFileSync('../../package.json', 'utf-8'));
// export const VERSION = pkg.version;

const VERSION = 'v1';
const CACHE_NAME = `cache-${VERSION}`;

const APP_STATIC_RESOURCES = [
  '/',
  '/img/s2.webp',
  '/img/tiger3.webp',
  '/font/Ubuntu-Regular.ttf',
  '/font/fa-regular-400.woff2',
  '/font/fa-solid-900.woff2',
  '/pwa-manifest.json',
  '/android-icon-192x192.png',
  '/favicon.ico',
  '/assets/index-ca734c48.js',
  '/assets/index-dac0e504.css ',
];

const addResourcesToCache = async resources => {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(resources);
};

const cacheFirst = async request => {
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    console.log(`CACHE: ${request.url}`);
    return responseFromCache;
  }

  console.log(`*****: ${request.url}`);
  return fetch(request);
};

self.addEventListener('install', event => {
  console.log('install');
  event.waitUntil(addResourcesToCache(APP_STATIC_RESOURCES));
});

self.addEventListener('activate', event => {
  console.log('activate');
});

self.addEventListener('fetch', event => {
  event.respondWith(cacheFirst(event.request));
});
