import React from 'react';
import { FolderX } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon = <FolderX className="w-12 h-12 text-muted-foreground/50" />,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center border rounded-xl border-dashed bg-muted/20 min-h-[300px] animate-fade-in-up',
        className
      )}
    >
      <div className="mb-4 rounded-2xl bg-muted/50 p-4">{icon}</div>
      <h3 className="text-lg font-serif font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
