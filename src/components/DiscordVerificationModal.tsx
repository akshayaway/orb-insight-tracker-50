import { Users, ExternalLink, ShieldCheck, Loader2, TrendingUp, BarChart3, Calendar, Upload, Gift, Users2, GraduationCap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDiscord } from '@/contexts/DiscordContext';
import React from 'react';

const DISCORD_INVITE_URL = 'https://discord.gg/7MRsuqqT3n';

interface DiscordVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionDescription?: string;
}

const features = [
  { icon: TrendingUp, label: 'Log & track trades' },
  { icon: BarChart3, label: 'View detailed stats' },
  { icon: Calendar, label: 'Access trade history' },
  { icon: Upload, label: 'Upload screenshots' },
];

const discordBenefits = [
  { icon: Users2, label: 'Fellow traders and community' },
  { icon: GraduationCap, label: 'Mentors and analyst insights' },
  { icon: TrendingUp, label: 'Trading analysts and market ideas' },
  { icon: Gift, label: 'Weekly free prop firm giveaways' },
];

export function DiscordVerificationModal({ isOpen, onClose, actionDescription }: DiscordVerificationModalProps) {
  const { isVerifying, startVerification, checkVerification } = useDiscord();
  const [isRechecking, setIsRechecking] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-[hsl(235,86%,65%)]/10 flex items-center justify-center">
            <Users className="w-7 h-7 text-[hsl(235,86%,65%)]" />
          </div>
          <DialogTitle className="text-lg">Discord Verification Required</DialogTitle>
          <DialogDescription className="text-sm">
            {actionDescription || 'Join our Discord server and verify to unlock full journal features.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-2">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground p-2 rounded-md bg-muted/50">
                <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-1">
            <p className="text-xs font-semibold text-foreground">Inside the Discord server</p>
            <div className="grid grid-cols-2 gap-2">
              {discordBenefits.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground p-2 rounded-md bg-muted/50">
                  <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              className="w-full gap-2 bg-[hsl(235,86%,65%)] hover:bg-[hsl(235,86%,55%)] text-white"
              onClick={startVerification}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              {isVerifying ? 'Verifying...' : "I've Joined - Verify Now"}
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => window.open(DISCORD_INVITE_URL, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              Join Discord Server
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={async () => {
                setIsRechecking(true);
                await checkVerification();
                setIsRechecking(false);
              }}
              disabled={isRechecking || isVerifying}
            >
              {isRechecking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              {isRechecking ? 'Checking...' : 'Recheck Verification'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
