// Service Worker version - use timestamp and version string for better control
const APP_VERSION = '1.0.1'
const CACHE_VERSION = `${APP_VERSION}-${Date.now()}`
const CACHE_NAME = `shipspot-${CACHE_VERSION}`

// Assets to cache - include version in the cache key
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx'
]

// Function to clean up old caches
const clearOldCaches = async () => {
  const cacheKeys = await caches.keys()
  const oldCaches = cacheKeys.filter(key => 
    key.startsWith('shipspot-') && key !== CACHE_NAME
  )
  return Promise.all(oldCaches.map(key => caches.delete(key)))
}

// Install event - cache basic assets and force activation
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await cache.addAll(ASSETS_TO_CACHE)
      await self.skipWaiting() // Force activation
    })()
  )
})

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await clearOldCaches()
      await clients.claim() // Take control of all clients
    })()
  )
})

// Helper function to check if URL is an image
const isImageUrl = (url) => url.match(/\.(jpg|jpeg|png|gif|svg)(\?.*)?$/i)

// Helper function to check if URL is a navigation request
const isNavigationRequest = (request) => request.mode === 'navigate'

// Helper function to add version to URLs
const addVersionToUrl = (url) => {
  const versionedUrl = new URL(url, self.location.origin)
  versionedUrl.searchParams.set('v', CACHE_VERSION)
  return versionedUrl.toString()
}

// Fetch event with improved caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Handle navigation requests
  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          // Always try network first for HTML
          const response = await fetch(request)
          const cache = await caches.open(CACHE_NAME)
          await cache.put(request, response.clone())
          return response
        } catch (error) {
          const cachedResponse = await caches.match('/index.html')
          return cachedResponse || new Response('Navigation failed', { status: 404 })
        }
      })()
    )
    return
  }

  // Handle image requests
  if (isImageUrl(request.url)) {
    event.respondWith(
      (async () => {
        // Try network first
        try {
          const response = await fetch(request, { 
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
          })
          const cache = await caches.open(CACHE_NAME)
          await cache.put(request, response.clone())
          return response
        } catch (error) {
          // Fall back to cache
          const cachedResponse = await caches.match(request)
          return cachedResponse || new Response('Image not found', { status: 404 })
        }
      })()
    )
    return
  }

  // Default network-first strategy for other requests
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request)
        if (response && response.status === 200) {
          const cache = await caches.open(CACHE_NAME)
          await cache.put(request, response.clone())
        }
        return response
      } catch (error) {
        const cachedResponse = await caches.match(request)
        return cachedResponse || new Response('Resource not found', { status: 404 })
      }
    })()
  )
})

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting()
  }
})

// Periodic cache cleanup
setInterval(async () => {
  await clearOldCaches()
}, 1000 * 60 * 60) // Every hour
