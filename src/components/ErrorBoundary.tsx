import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { recoverFromError, getAppVersion } from '@/lib/cacheUtils';

interface Props {
  children: React.ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  isRecovering: boolean;
  isOffline: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    isRecovering: false,
    isOffline: navigator.onLine
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  componentDidMount() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  private handleOnline = () => {
    this.setState({ isOffline: false });
  };

  private handleOffline = () => {
    this.setState({ isOffline: true });
  };

  private handleReload = () => {
    this.setState({ isRecovering: true });
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, isRecovering: false });
  };

  private handleClearCacheAndReload = async () => {
    this.setState({ isRecovering: true });
    try {
      await recoverFromError(this.state.error!);
    } catch (e) {
      console.error('Recovery failed:', e);
      // Still try to reload
      window.location.reload();
    }
  };

  private handleGoToAuth = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, isRecovering: false });
    window.location.href = '/auth';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isNetworkError = this.state.error?.message?.includes('Failed to fetch') || 
                            this.state.error?.message?.includes('NetworkError') ||
                            this.state.isOffline;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 safe-area-top safe-area-bottom">
          <Card className="w-full max-w-md bg-card border-border">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                {isNetworkError ? (
                  <WifiOff className="w-8 h-8 text-destructive" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                )}
              </div>
              <CardTitle className="text-xl text-foreground">
                {isNetworkError ? 'Connection Issue' : 'Something went wrong'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center text-sm">
                {isNetworkError 
                  ? 'Please check your internet connection and try again.'
                  : 'We encountered an unexpected error. This is often fixed by clearing your cache.'
                }
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-muted/50 p-3 rounded-lg">
                  <summary className="text-sm font-medium cursor-pointer text-foreground">Error Details</summary>
                  <pre className="text-xs mt-2 overflow-auto text-destructive max-h-32">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={this.handleClearCacheAndReload} 
                  variant="outline" 
                  className="w-full touch-target" 
                  size="lg"
                  disabled={this.state.isRecovering}
                >
                  {this.state.isRecovering ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Clear Cache & Reload
                </Button>
                <Button 
                  onClick={this.handleReload} 
                  className="w-full touch-target" 
                  size="lg"
                  disabled={this.state.isRecovering}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Simple Reload
                </Button>
                <Button 
                  onClick={this.handleGoToAuth} 
                  variant="secondary" 
                  className="w-full touch-target" 
                  size="lg"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Sign In
                </Button>
              </div>
              
              <div className="text-center pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  App Version: {getAppVersion()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience wrapper for functional components
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}