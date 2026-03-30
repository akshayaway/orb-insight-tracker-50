import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 🔥 FORCE VERSION RESET (PREVENT OLD USERS BLANK SCREEN)
const APP_VERSION = "6"; // 🔁 CHANGE THIS ON EVERY DEPLOY

try {
  const storedVersion = localStorage.getItem("app_version");

  if (storedVersion !== APP_VERSION) {
    console.log("New version detected → clearing old cache...");

    localStorage.clear();
    sessionStorage.clear();

    // Clear service worker + cache storage
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }

    localStorage.setItem("app_version", APP_VERSION);

    // Force reload to get latest JS files
    window.location.reload();
  }
} catch (e) {
  console.warn("Version check failed:", e);
}

// Ensure proper viewport meta tag for mobile
const viewportMeta = document.createElement('meta');
viewportMeta.name = 'viewport';
viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
document.head.appendChild(viewportMeta);

// 🔥 GLOBAL ERROR HANDLER (NO MORE BLANK SCREEN)
window.addEventListener("error", (e) => {
  if (e.message && e.message.includes("Failed to load module")) {
    console.log("JS load failed → reloading...");
    window.location.reload();
  }
});

// Add error handling for React rendering
try {
  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);
} catch (error) {
  console.error('React rendering error:', error);
  
  // Fallback UI for critical errors
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #1f1f1f; color: white; text-align: center; padding: 20px;">
        <div>
          <h1 style="font-size: 24px; margin-bottom: 10px;">Application Error</h1>
          <p style="margin-bottom: 20px; color: #ccc;">Please refresh the page and try again.</p>
          <button onclick="window.location.reload()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Refresh Page</button>
        </div>
      </div>
    `;
  }
}

// Register a basic service worker if supported (enables offline behavior / PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('Service worker registered.', reg))
      .catch((err) => console.warn('Service worker registration failed:', err));
  });
}
