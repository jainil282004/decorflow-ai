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
import { useVendorBills, useExpenses } from './api/financeApi';
import { formatCurrency } from '../../utils';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { format } from 'date-fns';

export const PayablesDashboard = () => {
  const [activeTab, setActiveTab] = useState('bills');
  const { data: bills, isLoading: billsLoading } = useVendorBills();
  const { data: expenses, isLoading: expensesLoading } = useExpenses();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'APPROVED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'PARTIAL':
        return 'warning';
      case 'REJECTED':
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader
          title="Accounts Payable"
          description="Manage vendor bills and internal expenses"
        />
        <div className="flex gap-3">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Record Expense
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Vendor Bill
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="bills">Vendor Bills ({bills?.length || 0})</TabsTrigger>
          <TabsTrigger value="expenses">Internal Expenses ({expenses?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="bills">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billsLoading ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className="p-4 space-y-4">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-[200px] w-full" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : bills?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="p-0">
                        <EmptyState
                          title="No vendor bills found"
                          description="You have not added any vendor bills yet."
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    bills?.map((bill: any) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">{bill.billNumber}</TableCell>
                        <TableCell>{format(new Date(bill.date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{bill.vendor?.name}</TableCell>
                        <TableCell>{format(new Date(bill.dueDate), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{formatCurrency(bill.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(bill.status) as any}>{bill.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Pay
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

        <TabsContent value="expenses">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expensesLoading ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="p-4 space-y-4">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-[200px] w-full" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : expenses?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <EmptyState
                          title="No expenses found"
                          description="You have not recorded any internal expenses yet."
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses?.map((exp: any) => (
                      <TableRow key={exp.id}>
                        <TableCell>{format(new Date(exp.date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{exp.category}</TableCell>
                        <TableCell className="truncate max-w-[200px]">
                          {exp.description || '-'}
                        </TableCell>
                        <TableCell>{formatCurrency(exp.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(exp.status) as any}>{exp.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {exp.status === 'PENDING' && (
                            <Button variant="outline" size="sm">
                              Review
                            </Button>
                          )}
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
