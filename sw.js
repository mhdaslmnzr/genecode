/* global self, caches */
var CACHE_NAME = "genecode-v1";

var PRECACHE_URLS = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.json",
  "./config.js",
  "./css/style.css",
  "./js/main.js",
  "./assets/logo.png",
  "./assets/logo-dark.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/shirts/shirt-01.jpg",
  "./assets/shirts/shirt-02.jpg",
  "./assets/shirts/shirt-03.jpg",
  "./assets/shirts/shirt-04.jpg",
  "./assets/shirts/shirt-05.jpg",
  "./assets/shirts/shirt-06.jpg",
];

function offlineResponse() {
  var u = new URL("./offline.html", self.location.href).href;
  return caches.match(u).then(function (hit) {
    return hit || fetch(u);
  });
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return undefined;
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) {
        return cached;
      }
      return fetch(event.request)
        .then(function (response) {
          return response;
        })
        .catch(function () {
          return offlineResponse();
        });
    })
  );
});
