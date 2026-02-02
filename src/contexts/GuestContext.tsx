import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface GuestContextType {
  isGuest: boolean;
  showAuthModal: boolean;
  pendingAction: string | null;
  openAuthModal: (action?: string) => void;
  closeAuthModal: () => void;
  requireAuth: (action: string, callback: () => void) => void;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  // User is guest if not authenticated
  const isGuest = !user;

  const openAuthModal = useCallback((action?: string) => {
    setPendingAction(action || null);
    setShowAuthModal(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
    setPendingAction(null);
    setPendingCallback(null);
  }, []);

  // Require auth for an action - if guest, show modal; if authenticated, execute callback
  const requireAuth = useCallback((action: string, callback: () => void) => {
    if (user) {
      // User is authenticated, execute the action
      callback();
    } else {
      // User is guest, show auth modal
      setPendingAction(action);
      setPendingCallback(() => callback);
      setShowAuthModal(true);
    }
  }, [user]);

  return (
    <GuestContext.Provider value={{
      isGuest,
      showAuthModal,
      pendingAction,
      openAuthModal,
      closeAuthModal,
      requireAuth,
    }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const context = useContext(GuestContext);
  if (context === undefined) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
}
