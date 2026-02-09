import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDiscord } from '@/contexts/DiscordContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Eye, EyeOff, Mail, Lock, Loader2, Users, ExternalLink, ShieldCheck, BarChart3, Calendar, Upload, Gift, Users2, GraduationCap } from 'lucide-react';
import { z } from 'zod';

const DISCORD_INVITE_URL = 'https://discord.gg/7MRsuqqT3n';

// Validation schemas
const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

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

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const { discordVerified, isVerifying, startVerification, isLoading: discordLoading } = useDiscord();
  const { toast } = useToast();
  const navigate = useNavigate();

  // If user is logged in and verified, redirect to home
  if (user && discordVerified && !discordLoading) {
    navigate('/');
    return null;
  }

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
        title: 'Error signing in',
        description: error.message === 'Invalid login credentials'
          ? 'Invalid email or password. Please try again.'
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'Signed in successfully',
      });
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!validateEmail(email)) return;
    if (!validatePassword(password)) return;
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    setSignUpLoading(true);
    const { error } = await signUp(email, password);

    if (error) {
      toast({
        title: 'Error creating account',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account created!',
        description: 'Continue to Discord verification to unlock full access.',
      });
      navigate('/');
    }
    setSignUpLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: 'Error signing in with Google',
        description: error.message,
        variant: 'destructive',
      });
      setGoogleLoading(false);
    }
  };

  // If user is logged in but NOT discord verified, show discord verification
  if (user && !discordVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md bg-card shadow-lg border-border">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-[hsl(235,86%,65%)]/10 flex items-center justify-center">
              <Users className="h-8 w-8 text-[hsl(235,86%,65%)]" />
            </div>
            <CardTitle className="text-2xl font-bold text-card-foreground">
              Discord Verification Required
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Join our Discord server and verify your membership to unlock full journal access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground p-2.5 rounded-md bg-muted/50">
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold text-foreground">What you get inside Discord</p>
              <div className="grid grid-cols-2 gap-2">
                {discordBenefits.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground p-2.5 rounded-md bg-muted/50">
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <span>{label}</span>
                  </div>
                ))}
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
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default: Sign in / Sign up form
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
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
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
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) validateEmail(e.target.value);
                    }}
                    required
                    className={`bg-background border-input ${emailError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    autoComplete="email"
                  />
                  {emailError && <p className="text-sm text-destructive">{emailError}</p>}
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
                      placeholder="********"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
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
                  {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
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

            <TabsContent value="signup" className="space-y-4">
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) validateEmail(e.target.value);
                    }}
                    required
                    className={`bg-background border-input ${emailError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    autoComplete="email"
                  />
                  {emailError && <p className="text-sm text-destructive">{emailError}</p>}
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
                      placeholder="********"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) validatePassword(e.target.value);
                      }}
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
                  {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Confirm Password
                  </Label>
                  <Input
                    id="signup-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmPasswordError) setConfirmPasswordError('');
                    }}
                    required
                    className={`bg-background border-input ${confirmPasswordError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    autoComplete="new-password"
                  />
                  {confirmPasswordError && <p className="text-sm text-destructive">{confirmPasswordError}</p>}
                </div>
                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={signUpLoading}
                >
                  {signUpLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : 'Create Account'}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground">
                After signing up, verify your Discord membership to unlock full access.
              </p>
              <p className="text-xs text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => setActiveTab('signin')}
                >
                  Go to login
                </button>
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}