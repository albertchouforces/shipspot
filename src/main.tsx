import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker for cache control
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js')
      
      // Check for updates immediately
      registration.update()

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
              // New content is available, reload the page
              window.location.reload()
            }
          })
        }
      })
    } catch (err) {
      console.log('ServiceWorker registration failed: ', err)
    }
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
