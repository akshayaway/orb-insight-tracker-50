import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  title?: string;
}

export function MobileHeader({ isMenuOpen, onMenuToggle, title = 'PropFirm Journal' }: MobileHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center px-4 gap-3 safe-area-top">
      {/* Menu Button */}
      <motion.button
        onClick={onMenuToggle}
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted active:bg-muted/80 transition-colors touch-target"
        whileTap={{ scale: 0.95 }}
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isMenuOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-foreground" />
          ) : (
            <Menu className="w-6 h-6 text-foreground" />
          )}
        </motion.div>
      </motion.button>

      {/* Logo */}
      <img 
        src="https://i.postimg.cc/W31cqNRN/20260117-155732.jpg" 
        alt="PropFirm" 
        className="h-8 w-8 rounded object-cover"
      />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="ml-1 text-sm font-semibold text-foreground truncate"
      >
        {title}
      </motion.h1>
    </header>
  );
}
