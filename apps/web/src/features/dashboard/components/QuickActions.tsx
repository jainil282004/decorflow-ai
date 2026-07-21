import { Button } from '../../../components/ui/button';
import { Icon } from '../../../components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';

const actions = [
  {
    label: 'New Customer',
    icon: 'UserPlus' as const,
    gradient: 'from-blue-500/15 to-blue-600/5',
    hoverGlow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.12)]',
    color: 'text-blue-600 dark:text-blue-400',
    path: '/customers/new',
  },
  {
    label: 'Create Event',
    icon: 'CalendarPlus' as const,
    gradient: 'from-emerald-500/15 to-emerald-600/5',
    hoverGlow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]',
    color: 'text-emerald-600 dark:text-emerald-400',
    path: '/events/new',
  },
  {
    label: 'Add Inventory',
    icon: 'PackagePlus' as const,
    gradient: 'from-amber-500/15 to-amber-600/5',
    hoverGlow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.12)]',
    color: 'text-amber-600 dark:text-amber-400',
    path: '/inventory/new',
  },
  {
    label: 'New Invoice',
    icon: 'FileText' as const,
    gradient: 'from-violet-500/15 to-violet-600/5',
    hoverGlow: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.12)]',
    color: 'text-violet-600 dark:text-violet-400',
    path: '/finance/invoices/new',
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
      {actions.map((action, i) => (
        <Button
          key={i}
          variant="outline"
          onClick={() => navigate(action.path)}
          className={cn(
            'h-[88px] flex flex-col items-center justify-center gap-2.5',
            'border-border/60 hover:border-border',
            'transition-all duration-300 group',
            action.hoverGlow,
            'hover:scale-[1.02]'
          )}
        >
          <div
            className={cn(
              'p-2.5 rounded-xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-110',
              action.gradient
            )}
          >
            <Icon name={action.icon} className={cn('h-5 w-5 stroke-[1.5]', action.color)} />
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {action.label}
          </span>
        </Button>
      ))}
    </div>
  );
}
