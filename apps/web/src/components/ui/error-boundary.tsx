import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

export function GlobalErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full shadow-lg border-destructive/20">
        <CardHeader className="text-center">
          <div className="mx-auto bg-destructive/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. Our team has been notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-3 rounded-md overflow-auto max-h-32 text-xs font-mono text-muted-foreground">
            {error instanceof Error ? error.message : String(error)}
          </div>
          <Button onClick={resetErrorBoundary} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function WidgetErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center text-center space-y-3 min-h-[200px]">
      <AlertCircle className="w-8 h-8 text-destructive/80" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-destructive">Could not load this component</p>
        <p className="text-xs text-muted-foreground max-w-[250px] truncate">
          {error instanceof Error ? error.message : String(error)}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary} className="h-8">
        <RefreshCw className="w-3 h-3 mr-2" />
        Retry
      </Button>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  variant?: 'global' | 'widget';
  onReset?: () => void;
}

export function ErrorBoundary({ children, variant = 'widget', onReset }: ErrorBoundaryProps) {
  const Fallback = variant === 'global' ? GlobalErrorFallback : WidgetErrorFallback;
  return (
    <ReactErrorBoundary FallbackComponent={Fallback} onReset={onReset}>
      {children}
    </ReactErrorBoundary>
  );
}
