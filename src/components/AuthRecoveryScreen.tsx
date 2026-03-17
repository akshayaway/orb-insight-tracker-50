import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthRecoveryScreenProps {
  message?: string;
}

export function AuthRecoveryScreen({
  message = 'Checking your session and recovering the app…',
}: AuthRecoveryScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-xl text-card-foreground">Loading your journal</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 text-center">
          <LoadingSpinner size="lg" text={message} />
          <p className="text-sm text-muted-foreground">
            If we find an invalid or expired session, we’ll automatically reset it and send you to sign in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
