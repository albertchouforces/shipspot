// Service Worker version
const CACHE_VERSION = Date.now().toString()
const CACHE_NAME = `shipspot-${CACHE_VERSION}`

// Assets to cache
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx'
]

// Install event - cache basic assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    })
  )
  // Activate new service worker immediately
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('shipspot-') && cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
          return null
        }).filter(Boolean)
      )
    }).then(() => {
      // Take control of all clients immediately
      return clients.claim()
    })
  )
})

// Helper function to check if URL is an image
const isImageUrl = (url) => {
  return url.match(/\.(jpg|jpeg|png|gif|svg)(\?.*)?$/i)
}

// Helper function to check if URL is a navigation request
const isNavigationRequest = (request) => {
  return request.mode === 'navigate'
}

// Fetch event - custom caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Handle navigation requests
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    )
    return
  }

  // Handle image requests
  if (isImageUrl(request.url)) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(response => {
          // Clone the response before caching
          const responseToCache = response.clone()
          
          // Cache the new version
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, responseToCache))
          
          return response
        })
        .catch(() => {
          // If network request fails, try to get from cache
          return caches.match(request)
        })
    )
    return
  }

  // Default fetch handler
  event.respondWith(
    fetch(request)
      .then(response => {
        // Don't cache if not successful
        if (!response || response.status !== 200) {
          return response
        }

        // Clone the response before caching
        const responseToCache = response.clone()
        
        // Cache the new version
        caches.open(CACHE_NAME)
          .then(cache => cache.put(request, responseToCache))
        
        return response
      })
      .catch(() => {
        // If network request fails, try to get from cache
        return caches.match(request)
      })
  )
})

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting()
  }
})
