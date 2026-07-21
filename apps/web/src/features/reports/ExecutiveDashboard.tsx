import { PageHeader } from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useExecutiveSummary } from './api/analyticsApi';
import { formatCurrency } from '../../utils';
import { DollarSign, TrendingUp, Users, Package, Briefcase, Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';

export const ExecutiveDashboard = () => {
  const { data: summary, isLoading } = useExecutiveSummary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Skeleton className="h-[250px]" />
          <Skeleton className="h-[250px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader
          title="Executive Dashboard"
          description="High-level enterprise overview and KPIs"
        />
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
                <h3 className="text-2xl font-serif font-semibold text-foreground">
                  {formatCurrency(summary?.totalRevenue || 0)}
                </h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Net Profit</p>
                <h3 className="text-2xl font-serif font-semibold text-foreground">
                  {formatCurrency(summary?.netProfit || 0)}
                </h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Events</p>
                <h3 className="text-2xl font-serif font-semibold text-foreground">
                  {summary?.activeEvents || 0}
                </h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-full text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Customers</p>
                <h3 className="text-2xl font-serif font-semibold text-foreground">
                  {summary?.customerCount || 0}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <span className="font-medium">Pending Receivables</span>
                </div>
                <span className="text-xl font-semibold">
                  {formatCurrency(summary?.pendingReceivables || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span className="font-medium">Pending Payables</span>
                </div>
                <span className="text-xl font-semibold">
                  {formatCurrency(summary?.pendingPayables || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full text-primary mb-4">
                  <Package className="h-10 w-10" />
                </div>
                <h2 className="text-4xl font-serif font-bold text-foreground">
                  {formatCurrency(summary?.inventoryValue || 0)}
                </h2>
                <p className="text-muted-foreground mt-2">Total Warehouse Inventory Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
