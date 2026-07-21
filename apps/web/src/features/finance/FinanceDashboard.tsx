import { PageHeader } from '../../components/PageHeader';
import { Card, CardContent } from '../../components/ui/card';
import { useCashFlow } from './api/financeApi';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';

export const FinanceDashboard = () => {
  const { data: cashFlow, isLoading } = useCashFlow();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance Dashboard"
        description="Enterprise cash flow and profitability overview"
      />

      {/* Cash Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Cash In (Received)</p>
                <h3 className="text-3xl font-serif font-semibold text-foreground">
                  {formatCurrency(cashFlow?.totalReceived || 0)}
                </h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Cash Out (Paid)</p>
                <h3 className="text-3xl font-serif font-semibold text-foreground">
                  {formatCurrency(cashFlow?.totalOutgoing || 0)}
                </h3>
              </div>
              <div className="p-3 bg-destructive/10 rounded-full text-destructive">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/5 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Net Cash Flow</p>
                <h3 className="text-3xl font-serif font-semibold text-foreground">
                  {formatCurrency(cashFlow?.netCash || 0)}
                </h3>
              </div>
              <div className="p-3 bg-secondary/10 rounded-full text-secondary">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Pending Receivables</h4>
                <p className="text-sm text-muted-foreground">Unpaid customer invoices</p>
              </div>
            </div>
            <h2 className="text-4xl font-serif text-yellow-600 dark:text-yellow-400 mb-6">
              {formatCurrency(cashFlow?.pendingReceivables || 0)}
            </h2>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/finance/invoices')}
            >
              View Invoices
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-red-100 rounded-lg text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Pending Payables</h4>
                <p className="text-sm text-muted-foreground">Unpaid vendor bills</p>
              </div>
            </div>
            <h2 className="text-4xl font-serif text-red-600 dark:text-red-400 mb-6">
              {formatCurrency(cashFlow?.pendingPayables || 0)}
            </h2>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/finance/payables')}
            >
              View Payables
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
