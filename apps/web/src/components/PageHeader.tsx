import React from 'react';
import { cn } from '../lib/utils';

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  description,
  actions,
  children,
  className,
}: PageHeaderProps) => {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 gap-4 animate-fade-in-up',
        className
      )}
    >
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-foreground">
            {title}
          </h1>
        </div>
        {description && (
          <p className="mt-2 text-muted-foreground font-light text-base max-w-2xl">{description}</p>
        )}
        <div className="mt-3 h-[2px] w-12 bg-gradient-to-r from-primary to-primary/30 rounded-full" />
      </div>
      {actions && (
        <div className="flex items-center gap-2 animate-fade-in stagger-2">{actions}</div>
      )}
      {children && (
        <div className="flex items-center gap-2 flex-wrap animate-fade-in stagger-2">
          {children}
        </div>
      )}
    </div>
  );
};
