import { motion } from 'framer-motion';
import { Users, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDiscord } from '@/contexts/DiscordContext';
import { useAuth } from '@/contexts/AuthContext';

const DISCORD_INVITE_URL = 'https://discord.gg/7MRsuqqT3n';

export function DiscordVerificationBanner() {
  const { user } = useAuth();
  const { discordVerified, discordUsername, isVerifying, isLoading, startVerification } = useDiscord();

  // Don't show for guests or while loading
  if (!user || isLoading) return null;

  // Verified state - compact badge
  if (discordVerified) {
    return null; // Don't show banner when verified - badge shown in header instead
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[hsl(235,86%,65%)]/10 border border-[hsl(235,86%,65%)]/20 rounded-lg p-4 mb-4"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-10 h-10 rounded-full bg-[hsl(235,86%,65%)]/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[hsl(235,86%,65%)]" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Join Discord to Unlock Full Access</h3>
            <p className="text-muted-foreground text-xs">
              Verify your Discord membership to add, edit, and manage trades.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none gap-1.5 text-xs"
            onClick={() => window.open(DISCORD_INVITE_URL, '_blank')}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Join Discord
          </Button>
          <Button
            size="sm"
            className="flex-1 sm:flex-none gap-1.5 bg-[hsl(235,86%,65%)] hover:bg-[hsl(235,86%,55%)] text-white text-xs"
            onClick={startVerification}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            {isVerifying ? 'Verifying...' : 'Verify with Discord'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
