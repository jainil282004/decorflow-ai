import { KpiCard } from '../../../components/KpiCard';
import { summaryStats } from '../mockData';

export function SummaryKpis() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Today's Events"
        value={summaryStats.todayEvents}
        iconName="Calendar"
        description={`${summaryStats.activeEvents} active now`}
        accentColor="bg-gradient-to-r from-info/60 to-info"
        className="stagger-1 animate-fade-in-up"
      />
      <KpiCard
        title="Monthly Revenue"
        value={`$${(summaryStats.monthlyRevenue / 1000).toFixed(1)}k`}
        iconName="DollarSign"
        trend="up"
        trendValue="+12%"
        description="vs last month"
        accentColor="bg-gradient-to-r from-success/60 to-success"
        className="stagger-2 animate-fade-in-up"
      />
      <KpiCard
        title="Inventory Alerts"
        value={summaryStats.lowStockItems}
        iconName="AlertTriangle"
        description="Items low on stock"
        accentColor="bg-gradient-to-r from-warning/60 to-warning"
        className="stagger-3 animate-fade-in-up"
      />
      <KpiCard
        title="Pending Tasks"
        value={summaryStats.pendingTasks}
        iconName="CheckSquare"
        description="Require attention today"
        accentColor="bg-gradient-to-r from-chart-2/60 to-chart-2"
        className="stagger-4 animate-fade-in-up"
      />
    </div>
  );
}
