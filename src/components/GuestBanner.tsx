import { motion } from 'framer-motion';
import { useGuest } from '@/contexts/GuestContext';
import { Button } from '@/components/ui/button';
import { UserPlus, Sparkles } from 'lucide-react';

export function GuestBanner() {
  const { isGuest, openAuthModal } = useGuest();

  if (!isGuest) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-lg p-3 mb-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-full bg-primary/10 shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Guest Mode
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Sign up to save your trades
            </p>
          </div>
        </div>
        <Button 
          size="sm" 
          onClick={() => openAuthModal('Create a free account to save your trades')}
          className="shrink-0 gap-1.5"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign Up Free</span>
          <span className="sm:hidden">Sign Up</span>
        </Button>
      </div>
    </motion.div>
  );
}
