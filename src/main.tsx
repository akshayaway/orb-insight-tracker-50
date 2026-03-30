import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 🔥 FORCE VERSION RESET (PREVENT OLD USERS BLANK SCREEN)
const APP_VERSION = "7"; // 🔁 CHANGE THIS ON EVERY DEPLOY

try {
  const storedVersion = localStorage.getItem("app_version");

  if (storedVersion !== APP_VERSION) {
    console.log("🔄 New version detected → clearing old cache...");

    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();

    // Clear service worker cache
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name).catch(err => {
            console.warn('Failed to delete cache:', name, err);
          });
        });
      });
    }

    // Unregister service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister().catch(err => {
            console.warn('Failed to unregister service worker:', err);
          });
        });
      });
    }

    // Set new version
    localStorage.setItem("app_version", APP_VERSION);

    // Force hard reload to get fresh assets
    console.log("✅ Cache cleared, forcing reload...");
    window.location.reload();
  }
} catch (e) {
  console.warn("⚠️ Version check failed:", e);
  // Still try to set version to prevent repeated checks
  try {
    localStorage.setItem("app_version", APP_VERSION);
  } catch (storageError) {
    console.warn("Could not set version in localStorage:", storageError);
  }
}

// Ensure proper viewport meta tag for mobile
const viewportMeta = document.createElement('meta');
viewportMeta.name = 'viewport';
viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
document.head.appendChild(viewportMeta);

// 🔥 GLOBAL ERROR HANDLER (NO MORE BLANK SCREEN)
window.addEventListener("error", (e) => {
  console.error("Global error caught:", e.error);
  
  // Check for common module loading errors
  if (e.message && (
    e.message.includes("Failed to load module") ||
    e.message.includes("Unexpected token") ||
    e.message.includes("Cannot find module")
  )) {
    console.log("🔄 JS load failed → clearing cache and reloading...");
    
    // Clear everything and reload
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
          regs.forEach(reg => reg.unregister());
        });
      }
    } catch (clearError) {
      console.warn("Error clearing cache:", clearError);
    }
    
    // Force reload after short delay
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }
});

// Add unhandled rejection handler
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  
  // If it's a network error or module loading error, try to recover
  if (event.reason?.message?.includes("Failed to fetch") || 
      event.reason?.message?.includes("Loading chunk")) {
    console.log("🔄 Chunk loading error → clearing cache and reloading...");
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
    } catch (e) {
      console.warn("Error clearing cache:", e);
    }
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }
});

// Add error handling for React rendering
try {
  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);
} catch (error) {
  console.error('❌ React rendering error:', error);
  
  // Show detailed error in development
  if (process.env.NODE_ENV === 'development') {
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #1f1f1f; color: white; padding: 20px;">
          <div style="max-width: 600px; text-align: center;">
            <h1 style="color: #ff6b6b; margin-bottom: 20px;">Application Error</h1>
            <pre style="background: #2a2a2a; padding: 15px; border-radius: 8px; overflow-x: auto; text-align: left; font-size: 12px;">${error.stack || error.message}</pre>
            <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
              🔄 Reload Page
            </button>
            <p style="margin-top: 15px; color: #ccc; font-size: 12px;">
              If this persists, please clear your browser cache and reload.
            </p>
          </div>
        </div>
      `;
    }
  } else {
    // Production: show simple error with reload button
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #1f1f1f; color: white; text-align: center; padding: 20px;">
          <div>
            <h1 style="font-size: 24px; margin-bottom: 10px;">Application Error</h1>
            <p style="margin-bottom: 20px; color: #ccc;">Please refresh the page to try again.</p>
            <button onclick="window.location.reload()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">Refresh Page</button>
            <p style="margin-top: 15px; font-size: 11px; color: #999;">
              If the problem persists, clear your browser cache and reload.
            </p>
          </div>
        </div>
      `;
    }
  }
}

// Register a basic service worker if supported (enables offline behavior / PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('Service worker registered.', reg);
        // Check for updates immediately
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker available, page will update on next load');
                // Optionally show notification to user
                if (Notification.permission === 'granted') {
                  new Notification('Update Available', {
                    body: 'A new version is available. Refresh to update.',
                    icon: '/icon-192.png'
                  });
                }
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn('Service worker registration failed:', err);
        // Don't fail the app if service worker fails
      });
  });
}

// Add cache-busting query parameter to index.html links (optional enhancement)
document.addEventListener('DOMContentLoaded', () => {
  // Add version to any external resources if needed
  const version = APP_VERSION;
  console.log(`🚀 App v${version} loaded successfully`);
});