import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useGuest } from '@/contexts/GuestContext';
import { useDiscord } from '@/contexts/DiscordContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  X, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Loader2, 
  TrendingUp,
  BarChart3,
  History,
  Shield,
  Users,
  ExternalLink,
  ShieldCheck,
  Users2,
  GraduationCap,
  Gift,
  AlertTriangle
} from 'lucide-react';
import { z } from 'zod';

const DISCORD_INVITE_URL = 'https://discord.gg/7MRsuqqT3n';

// Validation schemas
const emailSchema = z.string().email('Please enter a valid email address');

export function AuthModal() {
  const { showAuthModal, pendingAction, closeAuthModal } = useGuest();
  const { signIn, signInWithGoogle, user } = useAuth();
  const { discordVerified, isVerifying, startVerification, isLoading: discordLoading } = useDiscord();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // If user is logged in and verified, redirect to home
  if (user && discordVerified && !discordLoading) {
    closeAuthModal();
    return null;
  }

  // If user is logged in but NOT discord verified, show discord verification
  if (user && !discordVerified && !discordLoading) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeAuthModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[hsl(235,86%,65%)]/10 to-[hsl(235,86%,65%)]/5 p-6 pb-4">
              <button
                onClick={closeAuthModal}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-background/80 transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[hsl(235,86%,65%)]/10">
                  <Users2 className="h-6 w-6 text-[hsl(235,86%,65%)]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Discord Verification Required
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Join our Discord server and verify your membership to unlock full journal access.
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-background/50">
                  <Users2 className="h-4 w-4 text-[hsl(235,86%,65%)] mb-1" />
                  <span className="text-xs text-muted-foreground">Fellow traders</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-background/50">
                  <GraduationCap className="h-4 w-4 text-[hsl(235,86%,65%)] mb-1" />
                  <span className="text-xs text-muted-foreground">Mentors & insights</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-background/50">
                  <TrendingUp className="h-4 w-4 text-[hsl(235,86%,65%)] mb-1" />
                  <span className="text-xs text-muted-foreground">Market ideas</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-background/50">
                  <Gift className="h-4 w-4 text-[hsl(235,86%,65%)] mb-1" />
                  <span className="text-xs text-muted-foreground">Weekly giveaways</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold text-foreground">What you get inside Discord</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-2.5 rounded-md bg-muted/50">
                    <Users2 className="w-4 h-4 text-[hsl(235,86%,65%)] shrink-0" />
                    <span>Fellow traders and community</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-2.5 rounded-md bg-muted/50">
                    <GraduationCap className="w-4 h-4 text-[hsl(235,86%,65%)] shrink-0" />
                    <span>Mentors and analyst insights</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-2.5 rounded-md bg-muted/50">
                    <TrendingUp className="w-4 h-4 text-[hsl(235,86%,65%)] shrink-0" />
                    <span>Trading analysts and market ideas</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-2.5 rounded-md bg-muted/50">
                    <Gift className="w-4 h-4 text-[hsl(235,86%,65%)] shrink-0" />
                    <span>Weekly free prop firm giveaways</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  className="w-full gap-2 h-11 bg-[hsl(235,86%,65%)] hover:bg-[hsl(235,86%,55%)] text-white"
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
                  className="w-full gap-2 h-11"
                  onClick={() => window.open(DISCORD_INVITE_URL, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  Join Discord Server First
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground pt-2">
                Already a member? Click "Verify Now" to link your Discord account.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const benefits = [
    { icon: BarChart3, text: 'Track your trading stats' },
    { icon: History, text: 'Access trade history anytime' },
    { icon: Shield, text: 'Secure cloud backup' },
  ];

  const validateEmail = (value: string): boolean => {
    const result = emailSchema.safeParse(value);
    if (result.success) {
      setEmailError('');
      return true;
    } else {
      setEmailError(result.error.issues[0].message);
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    
    if (!validateEmail(email)) return;
    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    
    setLoading(true);
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Error signing in",
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password.' 
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "Signed in successfully",
      });
      closeAuthModal();
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Error signing in with Google",
        description: error.message,
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  if (!showAuthModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={closeAuthModal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-6 pb-4">
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-background/80 transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Sign In to Continue
                </h2>
                <p className="text-sm text-muted-foreground">
                  {pendingAction || 'Save and track your trades'}
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex flex-col items-center text-center p-2 rounded-lg bg-background/50">
                  <benefit.icon className="h-4 w-4 text-primary mb-1" />
                  <span className="text-xs text-muted-foreground">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Google Sign In */}
            <Button 
              type="button"
              variant="outline" 
              className="w-full h-11 gap-3"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span>Continue with Google</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Sign In Form */}
            <form onSubmit={handleSignIn} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="modal-email" className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="modal-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  className={emailError ? 'border-destructive' : ''}
                  autoComplete="email"
                />
                {emailError && <p className="text-xs text-destructive">{emailError}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="modal-password" className="flex items-center gap-2 text-sm">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="modal-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    className={`pr-10 ${passwordError ? 'border-destructive' : ''}`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading || googleLoading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : 'Sign In'}
              </Button>
            </form>

            <div className="space-y-2 pt-2">
              <Button
                variant="outline"
                className="w-full gap-2 h-11"
                onClick={() => {
                  closeAuthModal();
                  // Navigate to auth page
                  window.location.href = '/auth';
                }}
              >
                <Users className="w-4 h-4" />
                Create Account
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Already have an account? Sign in above or create a new account.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
