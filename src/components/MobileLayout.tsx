import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MobileHeader } from './MobileHeader';
import { MobileMenu } from './MobileMenu';
import { FloatingActionButton } from './FloatingActionButton';
import { OfflineBanner } from './OfflineBanner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useTrades } from '@/hooks/useTrades';

interface MobileLayoutProps {
  children: React.ReactNode;
}

// Page titles for different routes
const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/stats': 'Statistics',
  '/calendar': 'Calendar',
  '/settings': 'Settings',
  '/help': 'Help',
  '/ideas': 'Trade Ideas',
};

export function MobileLayout({ children }: MobileLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const isOnline = useNetworkStatus();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Get page title for current route
  const getPageTitle = () => {
    // Check for dynamic routes
    if (location.pathname.startsWith('/review/')) return 'Trade Review';
    return pageTitles[location.pathname] || 'PropFirm Journal';
  };

  // Show FAB only on Dashboard and certain pages
  const showFAB = ['/', '/calendar'].includes(location.pathname);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Offline Banner */}
      <OfflineBanner isOnline={isOnline} />

      {/* Header */}
      <MobileHeader 
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        title={getPageTitle()}
      />

      {/* Side Menu */}
      <MobileMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 pt-14 w-full">
        {children}
      </main>

      {/* Floating Action Button - only on dashboard and calendar */}
      {showFAB && (
        <FloatingActionButton onClick={() => setShowTradeModal(true)} />
      )}
    </div>
  );
}
