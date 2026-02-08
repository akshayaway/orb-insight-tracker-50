import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiscordContextType {
  discordVerified: boolean;
  discordUsername: string | null;
  isVerifying: boolean;
  isLoading: boolean;
  checkVerification: () => Promise<void>;
  startVerification: () => Promise<void>;
}

const DiscordContext = createContext<DiscordContextType | undefined>(undefined);

export function DiscordProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [discordVerified, setDiscordVerified] = useState(false);
  const [discordUsername, setDiscordUsername] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for OAuth callback params in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get('discord_verified');
    const error = params.get('discord_error');

    if (verified === 'true') {
      setDiscordVerified(true);
      toast({
        title: "Discord Verified! ✅",
        description: "Full journal access unlocked.",
      });
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (error) {
      const messages: Record<string, string> = {
        not_member: "Please join our Discord server first, then try again.",
        token_failed: "Discord authorization failed. Please try again.",
        user_fetch_failed: "Could not fetch Discord profile. Please try again.",
        invalid_state: "Session expired. Please try again.",
        db_error: "Something went wrong. Please try again.",
      };
      toast({
        title: "Verification Failed",
        description: messages[error] || "An error occurred. Please try again.",
        variant: "destructive",
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [toast]);

  // Load verification status from profile
  const checkVerification = useCallback(async () => {
    if (!user || !session) {
      setDiscordVerified(false);
      setDiscordUsername(null);
      setIsLoading(false);
      return;
    }

    try {
      // First check local profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('discord_verified, discord_username')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setDiscordVerified(profile.discord_verified || false);
        setDiscordUsername(profile.discord_username || null);
      }
    } catch (error) {
      console.error('Error checking Discord verification:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    checkVerification();
  }, [checkVerification]);

  const startVerification = useCallback(async () => {
    if (!session) return;

    setIsVerifying(true);
    try {
      const res = await fetch(
        `https://notyhakhjrmzhnnjbiqp.supabase.co/functions/v1/discord-auth?action=login`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await res.json();

      if (data.url) {
        // Redirect to Discord OAuth
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to start verification",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error starting Discord verification:', error);
      toast({
        title: "Connection Error",
        description: "Could not connect to verification service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  }, [session, toast]);

  return (
    <DiscordContext.Provider
      value={{
        discordVerified,
        discordUsername,
        isVerifying,
        isLoading,
        checkVerification,
        startVerification,
      }}
    >
      {children}
    </DiscordContext.Provider>
  );
}

export function useDiscord() {
  const context = useContext(DiscordContext);
  if (context === undefined) {
    throw new Error('useDiscord must be used within a DiscordProvider');
  }
  return context;
}
