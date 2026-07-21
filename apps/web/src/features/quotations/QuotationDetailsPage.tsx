import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useQuotation, useUpdateQuotationStatus } from '../finance/api/financeApi';
import { useOrganization } from '../saas/api/saasApi';
import { exportToPdf, exportToWord, exportToExcel } from '../../utils/exportUtils';
import { formatCurrency } from '../reports/FinancialDashboard';
import { ArrowLeft, CheckCircle2, XCircle, Send, Download, Printer } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';

export const QuotationDetailsPage = () => {
  const { id } = useParams();
  const { data: quotation, isLoading } = useQuotation(id as string);
  const { data: organization } = useOrganization();
  const updateStatus = useUpdateQuotationStatus();

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[500px] md:col-span-2" />
          <div className="space-y-6">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="pt-12">
        <EmptyState
          title="Quotation Not Found"
          description="The quotation you are looking for does not exist."
          actionLabel="Back to Dashboard"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  const handleStatusChange = (status: string) => {
    updateStatus.mutate({ id: quotation.id, status });
  };

  const handleExportPdf = () => exportToPdf('quotation-document', `Quotation_${quotation.number}`);
  const handleExportWord = () =>
    exportToWord('Quotation', quotation, organization, `Quotation_${quotation.number}`);
  const handleExportExcel = () => exportToExcel(quotation.items, `Quotation_${quotation.number}`);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/finance/quotations">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={`Quotation ${quotation.number}`}
          description={`Created on ${new Date(quotation.createdAt).toLocaleDateString()}`}
        />
        <div className="ml-auto flex gap-2">
          {quotation.status === 'DRAFT' && (
            <Button onClick={() => handleStatusChange('SENT')} disabled={updateStatus.isPending}>
              <Send className="h-4 w-4 mr-2" /> Mark as Sent
            </Button>
          )}
          {quotation.status === 'SENT' && (
            <>
              <Button
                onClick={() => handleStatusChange('ACCEPTED')}
                className="bg-green-600 hover:bg-green-700"
                disabled={updateStatus.isPending}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> Accept
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusChange('REJECTED')}
                disabled={updateStatus.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" /> Reject
              </Button>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPdf}>Download PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>Download Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportWord}>Download Word</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="default" onClick={handleExportPdf}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="quotation-document">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              {organization?.logoUrl && (
                <img src={organization.logoUrl} alt="Company Logo" className="h-12 w-auto mb-4" />
              )}
              <CardTitle>{organization?.name || 'Company Name'}</CardTitle>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-muted-foreground">QUOTATION</h1>
              <p className="font-medium mt-2"># {quotation.number}</p>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotation.items?.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end mt-8">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(quotation.subTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(quotation.taxTotal)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(quotation.totalAmount)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={quotation.status === 'ACCEPTED' ? 'default' : 'secondary'}>
                  {quotation.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valid Until</span>
                <span>{new Date(quotation.validUntil).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {quotation.customer ? (
                <>
                  <div className="font-medium">{quotation.customer.name}</div>
                  <div className="text-muted-foreground">{quotation.customer.email}</div>
                  <div className="text-muted-foreground">{quotation.customer.phone}</div>
                </>
              ) : (
                <div className="text-muted-foreground italic">No customer linked.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
