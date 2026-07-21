import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface PageLoaderProps {
  label?: string;
  className?: string;
  compact?: boolean;
}

export function PageLoader({ label = 'Loading…', className, compact }: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center gap-3 animate-fade-in',
        compact ? 'h-40' : 'h-[50vh]',
        className
      )}
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/15 blur-md animate-pulse-subtle" />
        <Loader2 className="relative h-8 w-8 animate-spin text-primary" />
      </div>
      <p className="text-sm text-muted-foreground tracking-wide">{label}</p>
    </div>
  );
}
