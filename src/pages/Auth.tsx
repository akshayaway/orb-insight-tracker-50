import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Eye, EyeOff, Mail, Lock, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const RESEND_COOLDOWN_MS = 12 * 60 * 1000; // 12 minutes

// Validation schemas
const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [resending, setResending] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Cooldown timer
  useEffect(() => {
    if (!lastSentAt) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastSentAt;
      const remaining = Math.max(0, RESEND_COOLDOWN_MS - elapsed);
      setCooldownRemaining(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastSentAt]);

  const handleResendEmail = useCallback(async () => {
    if (cooldownRemaining > 0 || !signupEmail) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: signupEmail,
    });
    if (error) {
      toast({
        title: "Failed to resend",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setLastSentAt(Date.now());
      toast({
        title: "Verification email resent!",
        description: "Check your inbox (and spam folder).",
      });
    }
    setResending(false);
  }, [cooldownRemaining, signupEmail, toast]);

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
    
    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    
    // Validate
    const isEmailValid = validateEmail(email);
    if (!isEmailValid) return;
    
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
          ? 'Invalid email or password. Please try again.' 
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "Signed in successfully",
      });
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    
    // Validate all fields
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
        setSignupEmail(email);
        setSignupSuccess(true);
        setLastSentAt(Date.now());
        toast({
          title: "Verification email sent!",
          description: "Please check your email inbox and click the verification link to complete signup.",
          duration: 6000,
        });
      }
    } catch (err: unknown) {
      // Handle network/timeout errors - signup may have succeeded
      setSignupEmail(email);
      setSignupSuccess(true);
      setLastSentAt(Date.now());
      toast({
        title: "Account may have been created",
        description: "The server took too long to respond. Check your email for a verification link, or try signing in.",
        duration: 8000,
      });
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
    // Don't set loading to false on success - the page will redirect
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) validateEmail(value);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) validatePassword(value);
    if (confirmPassword && confirmPasswordError) validateConfirmPassword(confirmPassword);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (confirmPasswordError) validateConfirmPassword(value);
  };

  const formatCooldown = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Show signup success screen with resend option
  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md bg-card shadow-lg border-border">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <div className="p-3 rounded-full bg-primary/10">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-card-foreground">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              We sent a verification link to <span className="font-medium text-foreground">{signupEmail}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground space-y-2">
              <p>📧 Check your inbox and spam/junk folder</p>
              <p>🔗 Click the verification link in the email</p>
              <p>⏰ The link expires in 24 hours</p>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleResendEmail}
                disabled={cooldownRemaining > 0 || resending}
              >
                {resending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {cooldownRemaining > 0
                  ? `Resend in ${formatCooldown(cooldownRemaining)}`
                  : resending
                    ? 'Sending...'
                    : 'Resend Verification Email'}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                You can resend after 12 minutes
              </p>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setSignupSuccess(false);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
            >
              ← Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card shadow-lg border-border">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full bg-primary/10">
              <TrendingUp className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground">
            Trading Journal
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Track your trades, improve your performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Sign In Button */}
          <Button 
            type="button"
            variant="outline" 
            className="w-full flex items-center justify-center gap-3 h-11"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="mt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    required
                    className={`bg-background border-input ${emailError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    autoComplete="email"
                  />
                  {emailError && (
                    <p className="text-sm text-destructive">{emailError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      required
                      className={`bg-background border-input pr-10 ${passwordError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-sm text-destructive">{passwordError}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11"
                  disabled={loading || googleLoading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    required
                    className={`bg-background border-input ${emailError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    autoComplete="email"
                  />
                  {emailError && (
                    <p className="text-sm text-destructive">{emailError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      required
                      className={`bg-background border-input pr-10 ${passwordError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-sm text-destructive">{passwordError}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Must be 8+ characters with uppercase, lowercase, number, and special character
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                      required
                      className={`bg-background border-input pr-10 ${confirmPasswordError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="text-sm text-destructive">{confirmPasswordError}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11"
                  disabled={loading || googleLoading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : 'Create Account'}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}