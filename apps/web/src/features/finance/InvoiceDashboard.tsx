import { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';
import { useInvoices, useQuotations } from './api/financeApi';
import { formatCurrency } from '../../utils';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { format } from 'date-fns';

import { useNavigate } from 'react-router-dom';

export const InvoiceDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('invoices');
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();
  const { data: quotations, isLoading: quotationsLoading } = useQuotations();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'APPROVED':
        return 'default';
      case 'DRAFT':
        return 'secondary';
      case 'SENT':
        return 'outline';
      case 'PARTIAL':
        return 'warning';
      case 'OVERDUE':
      case 'REJECTED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader
          title="Accounts Receivable"
          description="Manage quotations, invoices, and incoming payments"
        />
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/finance/quotations/new')}>
            <Plus className="mr-2 h-4 w-4" /> New Quotation
          </Button>
          <Button onClick={() => navigate('/finance/invoices/new')}>
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="invoices">Invoices ({invoices?.length || 0})</TabsTrigger>
          <TabsTrigger value="quotations">Quotations ({quotations?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoicesLoading ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="p-4 space-y-4">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-[200px] w-full" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : invoices?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <EmptyState
                          title="No invoices found"
                          description="You have not created any invoices yet."
                          actionLabel="Create Invoice"
                          onAction={() => navigate('/finance/invoices/new')}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices?.map((inv: any) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.number}</TableCell>
                        <TableCell>{format(new Date(inv.date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{inv.customer?.name}</TableCell>
                        <TableCell>{formatCurrency(inv.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(inv.status) as any}>{inv.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/finance/invoices/${inv.id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotations">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotationsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="p-4 space-y-4">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-[200px] w-full" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : quotations?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <EmptyState
                          title="No quotations found"
                          description="You have not created any quotations yet."
                          actionLabel="New Quotation"
                          onAction={() => navigate('/finance/quotations/new')}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    quotations?.map((qt: any) => (
                      <TableRow key={qt.id}>
                        <TableCell className="font-medium">{qt.number}</TableCell>
                        <TableCell>{format(new Date(qt.date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{qt.customer?.name}</TableCell>
                        <TableCell>{formatCurrency(qt.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(qt.status) as any}>{qt.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/finance/quotations/${qt.id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
