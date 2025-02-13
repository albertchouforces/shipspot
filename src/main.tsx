import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Version check function
const checkVersion = async () => {
  try {
    const currentVersion = localStorage.getItem('appVersion') || '0'
    const response = await fetch('/version.json?t=' + new Date().getTime())
    const data = await response.json()
    
    if (data.version !== currentVersion) {
      localStorage.setItem('appVersion', data.version)
      // Clear any cached resources
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name)
          })
        })
      }
      // Reload the application
      window.location.reload(true)
    }
  } catch (error) {
    console.warn('Version check failed:', error)
  }
}

// Check version on startup
checkVersion()

// Also check version when tab becomes visible again
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    checkVersion()
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
