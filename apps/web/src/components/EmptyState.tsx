import React from 'react';
import { Icon } from './ui/icon';
import { H4, MutedText } from './ui/typography';
import { Button } from './ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  iconName?: React.ComponentProps<typeof Icon>['name'];
  action?: React.ReactNode;
}

export const EmptyState = ({ title, description, iconName = 'FileX', action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10">
      <div className="rounded-2xl bg-muted/50 p-5 mb-5 animate-float">
        <Icon name={iconName} className="h-10 w-10 text-muted-foreground/60 stroke-[1.2]" />
      </div>
      <H4 className="mb-2">{title}</H4>
      <MutedText className="mb-6 max-w-sm text-sm">{description}</MutedText>
      {action}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading this data.',
  onRetry,
}: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center rounded-2xl border border-destructive/20 bg-destructive/5">
      <div className="rounded-2xl bg-destructive/10 p-5 mb-5">
        <Icon name="AlertTriangle" className="h-10 w-10 text-destructive stroke-[1.2]" />
      </div>
      <H4 className="mb-2 text-destructive">{title}</H4>
      <MutedText className="mb-6 max-w-sm text-sm">{message}</MutedText>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="text-destructive border-destructive/20 hover:bg-destructive/5"
        >
          <Icon name="RefreshCw" className="mr-2 h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
};
