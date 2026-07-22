import { KpiCard } from '../../../components/KpiCard';
import { useExecutiveSummary, useFinancialAnalytics } from '../../reports/api/analyticsApi';
import { useEvents } from '../../events/api/eventsApi';
import { useInventoryItems } from '../../inventory/api/inventoryApi';
import { useTasks } from '../../workforce/api/workforceApi';

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function isEventActiveToday(startDate: string, endDate: string, today = new Date()) {
  const start = startOfDay(new Date(startDate));
  const end = endOfDay(new Date(endDate));
  const t0 = startOfDay(today);
  const t1 = endOfDay(today);
  return start <= t1 && end >= t0;
}

function formatRevenueK(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export function SummaryKpis() {
  const { data: executive } = useExecutiveSummary();
  const { data: financial } = useFinancialAnalytics();
  const { data: eventsResult } = useEvents(1, 100, '');
  const { data: inventoryResult } = useInventoryItems(1, 100, '');
  const { data: tasks } = useTasks();

  const events = eventsResult?.data ?? [];
  const todayEvents = events.filter((e) => isEventActiveToday(e.startDate, e.endDate)).length;
  const activeEvents = executive?.activeEvents ?? 0;

  const trends = financial?.trends ?? [];
  const currentMonthRevenue = trends.length > 0 ? trends[trends.length - 1].revenue : 0;
  const previousMonthRevenue = trends.length > 1 ? trends[trends.length - 2].revenue : 0;
  const revenueDeltaPct =
    previousMonthRevenue > 0
      ? Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
      : null;

  const items = inventoryResult?.data ?? [];
  const lowStockItems = items.filter((item) => item.availableQuantity <= item.minStock).length;

  const taskList = Array.isArray(tasks) ? tasks : [];
  const pendingTasks = taskList.filter(
    (t: { status: string }) => t.status === 'TODO' || t.status === 'IN_PROGRESS'
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Today's Events"
        value={todayEvents}
        iconName="Calendar"
        description={`${activeEvents} active now`}
        accentColor="bg-gradient-to-r from-info/60 to-info"
        className="stagger-1 animate-fade-in-up"
      />
      <KpiCard
        title="Monthly Revenue"
        value={formatRevenueK(currentMonthRevenue)}
        iconName="DollarSign"
        trend={revenueDeltaPct === null ? 'neutral' : revenueDeltaPct >= 0 ? 'up' : 'down'}
        trendValue={
          revenueDeltaPct === null
            ? undefined
            : `${revenueDeltaPct >= 0 ? '+' : ''}${revenueDeltaPct}%`
        }
        description="vs last month"
        accentColor="bg-gradient-to-r from-success/60 to-success"
        className="stagger-2 animate-fade-in-up"
      />
      <KpiCard
        title="Inventory Alerts"
        value={lowStockItems}
        iconName="AlertTriangle"
        description="Items low on stock"
        accentColor="bg-gradient-to-r from-warning/60 to-warning"
        className="stagger-3 animate-fade-in-up"
      />
      <KpiCard
        title="Pending Tasks"
        value={pendingTasks}
        iconName="CheckSquare"
        description="Require attention today"
        accentColor="bg-gradient-to-r from-chart-2/60 to-chart-2"
        className="stagger-4 animate-fade-in-up"
      />
    </div>
  );
}
