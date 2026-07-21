import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Icon } from './ui/icon';
import { cn } from '../lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  iconName?: React.ComponentProps<typeof Icon>['name'];
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  accentColor?: string;
  className?: string;
}

function useCountUp(end: number, duration = 800) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = 0;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + (end - start) * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration]);

  return count;
}

export const KpiCard = ({
  title,
  value,
  description,
  iconName,
  trend,
  trendValue,
  accentColor,
  className,
}: KpiCardProps) => {
  // Parse numeric value for count-up animation
  const numericValue =
    typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  const isNumeric = !isNaN(numericValue) && typeof value === 'number';
  const animatedValue = useCountUp(isNumeric ? numericValue : 0);

  const displayValue = isNumeric ? animatedValue : value;

  return (
    <Card className={cn('hover-lift group relative overflow-hidden', className)}>
      {/* Top accent gradient line */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl',
          accentColor || 'bg-gradient-to-r from-primary/60 via-primary to-primary/60'
        )}
      />

      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 pt-5">
        <CardTitle className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted-foreground">
          {title}
        </CardTitle>
        {iconName && (
          <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/12 transition-colors">
            <Icon name={iconName} className="w-[18px] h-[18px] text-primary stroke-[1.5]" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-serif font-medium text-foreground tabular-nums animate-count-up">
          {displayValue}
        </div>
        {(description || trendValue) && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
            {trend && (
              <span
                className={cn(
                  'flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full',
                  trend === 'up' && 'text-success bg-success/10',
                  trend === 'down' && 'text-destructive bg-destructive/10'
                )}
              >
                <Icon
                  name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'}
                  className="w-3 h-3"
                />
                {trendValue}
              </span>
            )}
            <span className="text-muted-foreground">{description}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};
