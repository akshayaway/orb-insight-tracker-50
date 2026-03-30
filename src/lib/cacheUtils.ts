/**
 * Cache utilities for handling updates and versioning
 */

export const getAppVersion = (): string => {
  // This should match the APP_VERSION in main.tsx
  return "8";
};

export const clearAllCaches = async (): Promise<void> => {
  try {
    // Clear localStorage and sessionStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }

    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }

    // Unregister service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
    }

    console.log('✅ All caches cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
    throw error;
  }
};

export const forceUpdate = (): void => {
  window.location.reload();
};

export const checkForUpdates = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        // This will trigger the updatefound event if a new SW is available
        await registration.update();
        return true;
      }
    } catch (error) {
      console.warn('Service worker update check failed:', error);
    }
  }
  return false;
};

// Add this to your error recovery strategy
export const recoverFromError = async (error: Error): Promise<void> => {
  console.error('Attempting to recover from error:', error);
  
  // Clear caches
  await clearAllCaches();
  
  // Force reload after a short delay
  setTimeout(() => {
    window.location.reload();
  }, 500);
};