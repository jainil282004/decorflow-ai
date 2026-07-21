import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Icon } from '../../../components/ui/icon';
import { financialTrends } from '../mockData';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

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
          <div className="flex items-center gap-1.5 text-[11px] text-success font-semibold bg-success/10 px-2.5 py-1 rounded-full">
            <Icon name="TrendingUp" className="h-3 w-3" />
            +18.2%
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialTrends} barCategoryGap="20%">
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
        </div>
      </CardContent>
    </Card>
  );
}
