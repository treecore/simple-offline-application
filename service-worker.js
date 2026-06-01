(function() {
  'use strict';

  var filesToCache = [
    './css/hmr.css',
    './offline.html',
    './index.html'
  ];

  var staticCacheName = 'offline-application-cache-v2';

  self.addEventListener('install', function(event) {
    console.log('Installing service worker');
    event.waitUntil(
      caches.open(staticCacheName)
      .then(function(cache) {
          return cache.addAll(filesToCache);
      })
    );
  });

  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        if (response) {
          console.log('Found ', event.request.url, ' in cache');
          return response;
        }
        console.log('Network request for ', event.request.url);
        return fetch(event.request).then(function(response) {
          return caches.open(staticCacheName).then(function(cache) {
            if (event.request.url.indexOf('applications') < 0) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          });
        });
      }).catch(function(error) {
        console.log('Error, ', error);
        return caches.match('offline.html');
      })
    );
  });

  self.addEventListener('activate', function(event) {
    console.log('activated service worker');

    var cache = [staticCacheName];
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cache.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });
})();