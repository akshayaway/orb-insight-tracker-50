import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Calendar, 
  Settings, 
  LogOut,
  History,
  HelpCircle,
  Lightbulb,
  LogIn,
  UserPlus,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGuest } from '@/contexts/GuestContext';
import { cn } from '@/lib/utils';
import { tapFeedback } from '@/lib/haptics';
import { Badge } from '@/components/ui/badge';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// Menu items for authenticated users
const authMenuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/stats', label: 'Stats', icon: BarChart3 },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/ideas', label: 'Trade Ideas', icon: Lightbulb },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/help', label: 'Help', icon: HelpCircle },
];

// Menu items for guest users (no settings)
const guestMenuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/stats', label: 'Stats', icon: BarChart3 },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/ideas', label: 'Trade Ideas', icon: Lightbulb },
  { path: '/help', label: 'Help', icon: HelpCircle },
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isGuest, openAuthModal } = useGuest();
  
  const menuItems = isGuest ? guestMenuItems : authMenuItems;

  const handleNavigation = async (path: string) => {
    await tapFeedback();
    navigate(path);
    onClose();
  };

  const handleSignIn = async () => {
    await tapFeedback();
    openAuthModal('Sign in to save your trades');
    onClose();
  };

  const handleLogout = async () => {
    await tapFeedback();
    await signOut();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-card border-r border-border shadow-xl safe-area-left"
          >
            <div className="flex flex-col h-full pt-14 safe-area-top">
              {/* Logo Section */}
              <div className="px-4 py-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-foreground">PropFirm</h2>
                    <p className="text-xs text-muted-foreground">Knowledge Journal</p>
                  </div>
                  {isGuest && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Sparkles className="w-3 h-3" />
                      Guest
                    </Badge>
                  )}
                </div>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto py-4 px-3">
                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                      <motion.button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors touch-target",
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "text-foreground hover:bg-muted active:bg-muted/80"
                        )}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-base">{item.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Auth Section for Guests OR Logout for Authenticated */}
              <div className="p-4 border-t border-border safe-area-bottom">
                {isGuest ? (
                  <div className="space-y-2">
                    <motion.button
                      onClick={handleSignIn}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground transition-colors touch-target"
                    >
                      <LogIn className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium text-base">Sign In / Sign Up</span>
                    </motion.button>
                    <p className="text-xs text-center text-muted-foreground">
                      Create a free account to save your trades
                    </p>
                  </div>
                ) : (
                  <motion.button
                    onClick={handleLogout}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 active:bg-destructive/20 transition-colors touch-target"
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-base">Logout</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
