import { AlertCircle } from 'lucide-react';
import { EmptyState } from './empty-state';

/**
 * List-fetch error UI — same pattern as CleaningDashboard
 * (EmptyState + AlertCircle + Try again).
 */
export function FetchErrorState({
  entity = 'data',
  description = 'Something went wrong while fetching this list. Check your connection and try again.',
  onRetry,
  className,
}: {
  entity?: string;
  description?: string;
  onRetry: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      title={`Could not load ${entity}`}
      description={description}
      icon={<AlertCircle className="w-12 h-12 text-destructive/60" />}
      actionLabel="Try again"
      onAction={onRetry}
      className={className}
    />
  );
}
