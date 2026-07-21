import { useActivityTimeline } from '../api/activityApi';

import { formatDistanceToNow, format } from 'date-fns';
import type { ActivityLogResponseDTO } from '@decorflow/shared';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Edit,
  Truck,
  Package,
  Trash,
  UserPlus,
} from 'lucide-react';

interface ActivityTimelineProps {
  entityType: string;
  entityId: string;
}

export function ActivityTimeline({ entityType, entityId }: ActivityTimelineProps) {
  const { data: timeline, isLoading, error } = useActivityTimeline(entityType, entityId);

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">
        Loading timeline...
      </div>
    );
  }

  if (error || !timeline) {
    return <div className="p-4 text-center text-sm text-destructive">Failed to load timeline</div>;
  }

  if (timeline.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">No activity recorded yet.</div>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATED':
        return <FileText className="h-4 w-4 text-primary" />;
      case 'UPDATED':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'DELETED':
        return <Trash className="h-4 w-4 text-destructive" />;
      case 'ASSIGNED':
        return <UserPlus className="h-4 w-4 text-orange-500" />;
      case 'DISPATCHED':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'COMPLETED':
        return <Package className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent pt-2 pb-2">
      {timeline.map((item: ActivityLogResponseDTO) => (
        <div
          key={item.id}
          className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            {getActionIcon(item.action)}
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-sm capitalize">{item.action.toLowerCase()}</h4>
              <time
                className="text-xs text-muted-foreground"
                title={format(new Date(item.createdAt), 'PPP p')}
              >
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </time>
            </div>
            {item.details && <p className="text-sm text-muted-foreground mt-2">{item.details}</p>}
            {/* Ideally we show who did it if we had the user info joined */}
            {item.userId && (
              <p className="text-xs text-muted-foreground mt-2 opacity-70">
                User ID: {item.userId.split('-')[0]}...
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
