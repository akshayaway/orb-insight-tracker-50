import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const LAST_ROUTE_KEY = 'propfirm_last_route';
const VALID_ROUTES = ['/', '/stats', '/calendar', '/settings', '/help', '/ideas'];

export function useLastRoute() {
  const location = useLocation();
  const navigate = useNavigate();

  // Save current route
  useEffect(() => {
    if (VALID_ROUTES.includes(location.pathname)) {
      localStorage.setItem(LAST_ROUTE_KEY, location.pathname);
    }
  }, [location.pathname]);

  // Restore last route on mount (only if on root)
  useEffect(() => {
    if (location.pathname === '/') {
      const lastRoute = localStorage.getItem(LAST_ROUTE_KEY);
      if (lastRoute && lastRoute !== '/' && VALID_ROUTES.includes(lastRoute)) {
        // Small delay to prevent flash
        const timer = setTimeout(() => {
          navigate(lastRoute, { replace: true });
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  return {
    getLastRoute: () => localStorage.getItem(LAST_ROUTE_KEY) || '/',
    clearLastRoute: () => localStorage.removeItem(LAST_ROUTE_KEY),
  };
}
