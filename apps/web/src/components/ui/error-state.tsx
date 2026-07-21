import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Failed to load data',
  message = 'There was a problem retrieving the information. Please try again.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center border rounded-lg border-destructive/20 bg-destructive/5 min-h-[300px] ${className}`}
    >
      <AlertTriangle className="w-12 h-12 text-destructive/60 mb-4" />
      <h3 className="text-lg font-semibold text-destructive mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Request
        </Button>
      )}
    </div>
  );
}
