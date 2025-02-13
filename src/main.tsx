import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Function to handle service worker registration and updates
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Clear existing caches before registration
      if (window.caches) {
        const cacheKeys = await window.caches.keys()
        await Promise.all(
          cacheKeys.map(key => window.caches.delete(key))
        )
      }

      // Register service worker with cache control
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        updateViaCache: 'none'
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

// Clear localStorage if version mismatch
const handleVersionCheck = () => {
  const currentVersion = '1.0.1' // Update this when deploying new versions
  const storedVersion = localStorage.getItem('appVersion')
  
  if (storedVersion !== currentVersion) {
    // Clear all localStorage data
    localStorage.clear()
    // Set new version
    localStorage.setItem('appVersion', currentVersion)
  }
}

// Initialize app with proper cache and version control
const initializeApp = async () => {
  // Check version and clear cache if needed
  handleVersionCheck()
  
  // Register service worker
  await registerServiceWorker()
  
  // Mount app
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

initializeApp()
