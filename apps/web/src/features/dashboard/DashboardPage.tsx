import { motion } from 'framer-motion';
import { SummaryKpis } from './components/SummaryKpis';
import { QuickActions } from './components/QuickActions';
import { EventsWidget } from './components/EventsWidget';
import { OperationsWidget } from './components/OperationsWidget';
import { FinanceWidget } from './components/FinanceWidget';
import { TeamWidget } from './components/TeamWidget';
import { GlobalFeedWidget } from '../activity/components/GlobalFeedWidget';
import { ErrorBoundary } from '../../components/ui/error-boundary';
import { useAuthStore } from '../../stores/authStore';
import { Icon } from '../../components/ui/icon';

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <motion.div className="space-y-6 pb-8" variants={stagger} initial="hidden" animate="visible">
      {/* Welcome Banner */}
      <motion.div variants={fadeUp}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-6 md:p-8">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/8 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-3xl translate-y-1/2" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-medium tracking-tight text-foreground">
                {getGreeting()}, {firstName}
              </h1>
              <p className="mt-1.5 text-muted-foreground text-sm flex items-center gap-2">
                <Icon name="Calendar" className="h-3.5 w-3.5" />
                {formatDate()}
              </p>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Here's what's happening with your business today.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Top KPIs Row */}
      <motion.div variants={fadeUp}>
        <ErrorBoundary variant="widget">
          <SummaryKpis />
        </ErrorBoundary>
      </motion.div>

      {/* Quick Actions Row */}
      <motion.div variants={fadeUp}>
        <ErrorBoundary variant="widget">
          <QuickActions />
        </ErrorBoundary>
      </motion.div>

      {/* Main Grid Area */}
      <motion.div variants={fadeUp} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Row 1 */}
        <ErrorBoundary variant="widget">
          <EventsWidget />
        </ErrorBoundary>
        <ErrorBoundary variant="widget">
          <OperationsWidget />
        </ErrorBoundary>

        {/* Row 2 */}
        <ErrorBoundary variant="widget">
          <FinanceWidget />
        </ErrorBoundary>
        <ErrorBoundary variant="widget">
          <TeamWidget />
        </ErrorBoundary>

        {/* Row 3 */}
        <div className="col-span-full xl:col-span-3">
          <ErrorBoundary variant="widget">
            <GlobalFeedWidget />
          </ErrorBoundary>
        </div>
      </motion.div>
    </motion.div>
  );
}
