'use strict';

const CACHE_NAME = 'wingscraft-polish3';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/workflow.js?v=polish3',
  '/services.html',
  '/examples.html',
  '/projects.html',
  '/journal.html',
  '/about.html',
  '/contact.html',
  '/privacy.html',
  '/404.html',
  '/sample-coffee.html',
  '/demo-booking.html',
  '/demo-inquiries.html',
  '/style.css?v=polish3',
  '/script.js?v=polish3',
  '/motion.js?v=polish3',
  '/navigation.js?v=polish3',
  '/contact.js?v=polish3',
  '/contact-transport.js?v=polish3',
  '/demo.css',
  '/demo.js?v=polish3',
  '/sample.css',
  '/sample.js',
  '/site-config.js?v=078713b28d',
  '/site.webmanifest',
  '/assets/logo.svg',
  '/assets/favicon.svg',
  '/assets/apple-touch-icon.png',
  '/assets/og.png'
].map(path => new URL(path.slice(1), self.registration.scope).href);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('Some assets failed to precache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key.startsWith('wingscraft-') && key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only handle same-origin GET requests
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Network-first for HTML pages to ensure fresh content, fallback to cache
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        return caches.match(event.request).then(cached => {
          return cached || caches.match(new URL('404.html',self.registration.scope).href);
        });
      })
    );
    return;
  }

  // Cache-first for static assets (CSS, JS, images, fonts)
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Fetch in background to update cache for next visit (stale-while-revalidate)
        fetch(event.request).then(networkResponse => {
          if (networkResponse.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        if (networkResponse.ok) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      });
    })
  );
});
