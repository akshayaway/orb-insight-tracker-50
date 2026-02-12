import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGuest } from '@/contexts/GuestContext';
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
  Shield
} from 'lucide-react';
import { z } from 'zod';

// Validation schemas
const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export function AuthModal() {
  const { showAuthModal, pendingAction, closeAuthModal } = useGuest();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

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

  const validatePassword = (value: string): boolean => {
    const result = passwordSchema.safeParse(value);
    if (result.success) {
      setPasswordError('');
      return true;
    } else {
      setPasswordError(result.error.issues[0].message);
      return false;
    }
  };

  const validateConfirmPassword = (value: string): boolean => {
    if (value !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(confirmPassword);
    
    if (!isEmailValid || !isPasswordValid || !isConfirmValid) return;
    
    setLoading(true);
    try {
      const result = await signUp(email, password);
      
      if (result.error) {
        toast({
          title: "Error signing up",
          description: result.error.message || 'Something went wrong. Please try again.',
          variant: "destructive",
        });
      } else {
        toast({ title: "Account created!", description: "Welcome to PropFirm Knowledge Journal." });
        closeAuthModal();
      }
    } catch (err: unknown) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    }
    setLoading(false);
  };


  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
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
          <>

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
                  {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
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

            {/* Form */}
            <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-3">
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
                      if (passwordError) validatePassword(e.target.value);
                    }}
                    className={`pr-10 ${passwordError ? 'border-destructive' : ''}`}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
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

              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <Label htmlFor="modal-confirm" className="flex items-center gap-2 text-sm">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    Confirm Password
                  </Label>
                  <Input
                    id="modal-confirm"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmPasswordError) validateConfirmPassword(e.target.value);
                    }}
                    className={confirmPasswordError ? 'border-destructive' : ''}
                    autoComplete="new-password"
                  />
                  {confirmPasswordError && <p className="text-xs text-destructive">{confirmPasswordError}</p>}
                </div>
              )}

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                  </>
                ) : mode === 'signup' ? 'Create Free Account' : 'Sign In'}
              </Button>
            </form>

            {/* Toggle Mode */}
            <p className="text-center text-sm text-muted-foreground">
              {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signup' ? 'signin' : 'signup');
                  resetForm();
                }}
                className="text-primary hover:underline font-medium"
              >
                {mode === 'signup' ? 'Sign in' : 'Sign up free'}
              </button>
            </p>
          </div>
          </>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}