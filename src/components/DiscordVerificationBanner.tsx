import { motion } from 'framer-motion';
import { Users, ExternalLink, ShieldCheck, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDiscord } from '@/contexts/DiscordContext';
import { useAuth } from '@/contexts/AuthContext';

const DISCORD_INVITE_URL = 'https://discord.gg/7MRsuqqT3n';

export function DiscordVerificationBanner() {
  const { user } = useAuth();
  const { discordVerified, isVerifying, isLoading, startVerification } = useDiscord();

  if (!user || isLoading || discordVerified) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-[hsl(235,86%,65%)]/30 bg-[hsl(235,86%,65%)]/5 shadow-md">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-[hsl(235,86%,65%)]/15 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-[hsl(235,86%,65%)]" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-base">
                  Verify Discord to Unlock Full Access
                </h3>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Join our Discord community and verify your membership to add trades, view stats, and use all journal features.
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="flex flex-col sm:flex-row gap-2 text-xs text-muted-foreground pl-14">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">1</span>
                Join the Discord server
              </span>
              <span className="hidden sm:inline text-border">→</span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">2</span>
                Click "Verify Now" below
              </span>
              <span className="hidden sm:inline text-border">→</span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">3</span>
                Full journal access unlocked!
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pl-14">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => window.open(DISCORD_INVITE_URL, '_blank')}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Join Discord
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-[hsl(235,86%,65%)] hover:bg-[hsl(235,86%,55%)] text-white text-xs"
                onClick={startVerification}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                {isVerifying ? 'Verifying...' : 'Verify Now'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
