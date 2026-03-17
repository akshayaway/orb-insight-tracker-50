import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authReady: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const RECOVERY_FLAG = 'auth-recovery-in-progress';
const RECOVERY_TS_KEY = 'auth-recovery-ts';
const RECOVERY_COOLDOWN_MS = 5000;

const isBrowser = typeof window !== 'undefined';

function clearSupabaseStorage() {
  if (!isBrowser) return;

  const shouldRemoveKey = (key: string) => {
    const normalizedKey = key.toLowerCase();
    return (
      normalizedKey.startsWith('sb-') ||
      normalizedKey.includes('supabase') ||
      normalizedKey.includes('auth-token') ||
      normalizedKey === RECOVERY_FLAG ||
      normalizedKey === RECOVERY_TS_KEY
    );
  };

  try {
    const localKeys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && shouldRemoveKey(key)) localKeys.push(key);
    }
    localKeys.forEach((key) => window.localStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to clear localStorage during auth recovery:', error);
  }

  try {
    const sessionKeys: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i += 1) {
      const key = window.sessionStorage.key(i);
      if (key && shouldRemoveKey(key)) sessionKeys.push(key);
    }
    sessionKeys.forEach((key) => window.sessionStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to clear sessionStorage during auth recovery:', error);
  }
}

function isSessionInvalid(session: Session | null) {
  if (!session) return true;
  if (!session.access_token || !session.refresh_token || !session.user) return true;

  if (session.expires_at) {
    const expiresAtMs = session.expires_at * 1000;
    if (Number.isFinite(expiresAtMs) && expiresAtMs <= Date.now()) {
      return true;
    }
  }

  return false;
}

async function resetBrokenSession(redirectToAuth = true) {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch (error) {
    console.error('Local sign out failed during auth recovery:', error);
  }

  clearSupabaseStorage();

  if (!isBrowser) return;

  const now = Date.now();
  const lastRecovery = Number(window.sessionStorage.getItem(RECOVERY_TS_KEY) || '0');
  const shouldReload = now - lastRecovery > RECOVERY_COOLDOWN_MS;

  window.sessionStorage.setItem(RECOVERY_FLAG, 'true');
  window.sessionStorage.setItem(RECOVERY_TS_KEY, String(now));

  const target = redirectToAuth ? '/auth' : '/';
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (currentPath !== target) {
    window.location.replace(target);
    return;
  }

  if (shouldReload) {
    window.location.reload();
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const recoveryInProgressRef = useRef(false);

  const applySession = (nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
  };

  const recoverAuthState = async () => {
    if (recoveryInProgressRef.current) return;
    recoveryInProgressRef.current = true;
    applySession(null);
    setLoading(false);
    setAuthReady(false);
    await resetBrokenSession(true);
  };

  useEffect(() => {
    let mounted = true;

    const bootstrapAuth = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase.auth.getSession();
        if (error || isSessionInvalid(data.session)) {
          if (data.session || error) {
            await recoverAuthState();
            return;
          }

          if (!mounted) return;
          applySession(null);
          setAuthReady(true);
          setLoading(false);
          return;
        }

        if (!mounted) return;
        applySession(data.session);
        setAuthReady(true);
        setLoading(false);
      } catch (error) {
        console.error('Auth bootstrap failed:', error);
        await recoverAuthState();
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted || recoveryInProgressRef.current) return;

      if (event === 'SIGNED_OUT') {
        applySession(null);
        setAuthReady(true);
        setLoading(false);
        return;
      }

      if (nextSession && isSessionInvalid(nextSession)) {
        void recoverAuthState();
        return;
      }

      applySession(nextSession);
      setAuthReady(true);
      setLoading(false);
    });

    void bootstrapAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (!error) {
        return { error: null };
      }

      return { error };
    } catch (err: any) {
      return { error: { message: err?.message || 'Connection error. Please try again.', name: 'AuthError', status: 500 } as any };
    }
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/auth`;

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { email_confirm: true }
        }
      });

      if (!error && data?.user) {
        const signInResult = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        return { error: signInResult.error };
      }

      return { error };
    } catch (err: any) {
      if (err?.message?.includes('timeout') || err?.status === 504 || err?.message === '0') {
        const signInResult = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        return { error: signInResult.error };
      }
      return { error: { message: err?.message || 'An unexpected error occurred. Please try again.', name: 'AuthError', status: 500 } as any };
    }
  };

  const signOut = async () => {
    applySession(null);
    setAuthReady(true);
    setLoading(false);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      authReady,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
