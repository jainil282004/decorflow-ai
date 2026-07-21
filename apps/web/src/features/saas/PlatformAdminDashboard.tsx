import { PageHeader } from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { usePlatformStats } from './api/saasApi';
import { Building2, Users, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../reports/FinancialDashboard'; // Reusing utility

export const PlatformAdminDashboard = () => {
  const { data: stats, isLoading, error } = usePlatformStats();

  if (error) {
    return (
      <div className="p-8 text-center text-destructive flex flex-col items-center">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p>You must be a Platform Super Admin to view this page.</p>
      </div>
    );
  }

  if (isLoading) return <div className="p-8">Loading platform data...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Administration"
        description="Global SaaS metrics and tenant oversight"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(stats?.monthlyRecurringRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCompanies || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active billing cycles</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="border-dashed bg-secondary/5">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Tenant Directory Module Pending</p>
            <p className="text-sm mt-2">
              The ability to masquerade into tenant accounts will be unlocked in v2.1
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
