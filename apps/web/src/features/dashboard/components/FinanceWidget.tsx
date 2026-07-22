import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Icon } from '../../../components/ui/icon';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useFinancialAnalytics } from '../../reports/api/analyticsApi';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-modal">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-serif font-medium text-foreground">
        ${Number(payload[0].value).toLocaleString()}
      </p>
    </div>
  );
};

export function FinanceWidget() {
  const { data: analytics, isLoading } = useFinancialAnalytics();
  const trends = analytics?.trends ?? [];
  const chartData = trends.map((t: { month: string; revenue: number }) => ({
    name: t.month,
    revenue: t.revenue,
  }));

  const last = chartData.length > 0 ? chartData[chartData.length - 1].revenue : 0;
  const prev = chartData.length > 1 ? chartData[chartData.length - 2].revenue : 0;
  const pctChange = prev > 0 ? ((last - prev) / prev) * 100 : null;
  const pctLabel =
    pctChange === null ? null : `${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(1)}%`;

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <Icon name="TrendingUp" className="h-4 w-4 text-success stroke-[1.5]" />
            </div>
            Revenue Trend
          </CardTitle>
          {pctLabel && (
            <div
              className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                pctChange !== null && pctChange < 0
                  ? 'text-destructive bg-destructive/10'
                  : 'text-success bg-success/10'
              }`}
            >
              <Icon name="TrendingUp" className="h-3 w-3" />
              {pctLabel}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-4">Loading revenue…</p>
          ) : chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No revenue data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="20%">
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000}k`}
                  dx={-8}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted) / 0.5)', radius: 8 }}
                  content={<CustomTooltip />}
                />
                <Bar
                  dataKey="revenue"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
