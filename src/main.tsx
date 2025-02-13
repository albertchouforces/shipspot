import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Function to register and handle service worker
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Clear browser cache before registration
      if (window.caches) {
        const cacheKeys = await window.caches.keys()
        await Promise.all(
          cacheKeys.map(key => window.caches.delete(key))
        )
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        updateViaCache: 'none' // Bypass browser cache for service worker
      })

      // Immediately check for updates
      await registration.update()

      // Set up periodic updates
      setInterval(() => {
        registration.update()
      }, 1000 * 60 * 60) // Check for updates every hour

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available
              if (confirm('New version available! Would you like to update?')) {
                window.location.reload()
              }
            }
          })
        }
      })

      // Handle controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })

    } catch (error) {
      console.error('ServiceWorker registration failed:', error)
    }
  }
}

// Register service worker before mounting app
registerServiceWorker().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
