import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/ui/button';
import { useQuotation, useUpdateQuotationStatus } from '../finance/api/financeApi';
import { useOrganization } from '../saas/api/saasApi';
import {
  exportToPdf,
  exportToWord,
  exportFinanceDocumentToExcel,
  printDocument,
  buildDocumentFilename,
} from '../../utils/exportUtils';
import { FinanceDocumentView } from '../finance/components/FinanceDocumentView';
import { ArrowLeft, CheckCircle2, XCircle, Send, Download, Printer } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { useToast } from '../../hooks/use-toast';

export const QuotationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: quotation, isLoading, isError, refetch } = useQuotation(id as string);
  const { data: organization } = useOrganization();
  const updateStatus = useUpdateQuotationStatus();

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[640px] w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-12">
        <EmptyState
          title="Could not load quotation"
          description="Something went wrong while fetching this quotation. Check your connection and try again."
          actionLabel="Try again"
          onAction={() => refetch()}
        />
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

  const filename = buildDocumentFilename('QUOTATION', quotation.number, quotation.customer?.name);

  const handleStatusChange = (status: string) => {
    updateStatus.mutate(
      { id: quotation.id, status },
      {
        onSuccess: (result: any) => {
          if (status === 'APPROVED' && result?.invoice?.id) {
            toast({
              title: 'Quotation accepted',
              description: `Invoice ${result.invoice.number} created.`,
            });
            navigate(`/finance/invoices/${result.invoice.id}`);
            return;
          }
          toast({ title: 'Status updated' });
        },
        onError: () => {
          toast({ title: 'Could not update quotation status', variant: 'destructive' });
        },
      }
    );
  };

  const handleExportPdf = () => exportToPdf('quotation-document', filename);

  const handlePrint = () => printDocument('quotation-document');

  const handleExportWord = () => exportToWord('Quotation', quotation, organization, filename);

  const handleExportExcel = async () => {
    try {
      await exportFinanceDocumentToExcel(
        {
          docType: 'QUOTATION',
          number: quotation.number,
          status: quotation.status,
          date: quotation.date,
          validUntil: quotation.validUntil,
          subTotal: quotation.subTotal,
          taxTotal: quotation.taxTotal,
          discountTotal: quotation.discountTotal,
          totalAmount: quotation.totalAmount,
          company: organization,
          customer: quotation.customer,
          items: quotation.items || [],
        },
        filename
      );
    } catch (error) {
      console.error(error);
      toast({ title: 'Could not export Excel file', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/finance/quotations">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={`Quotation ${quotation.number}`}
          description={`Created on ${new Date(quotation.createdAt).toLocaleDateString('en-IN')}`}
        />
        <div className="ml-auto flex flex-wrap gap-2">
          {quotation.status === 'DRAFT' && (
            <Button onClick={() => handleStatusChange('SENT')} disabled={updateStatus.isPending}>
              <Send className="mr-2 h-4 w-4" /> Mark as Sent
            </Button>
          )}
          {quotation.status === 'SENT' && (
            <>
              <Button
                onClick={() => handleStatusChange('APPROVED')}
                className="bg-green-600 hover:bg-green-700"
                disabled={updateStatus.isPending}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Accept
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusChange('REJECTED')}
                disabled={updateStatus.isPending}
              >
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPdf}>Download PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>Download Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportWord}>Download Word</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="default" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      <FinanceDocumentView
        documentId="quotation-document"
        docType="QUOTATION"
        number={quotation.number}
        status={quotation.status}
        date={quotation.date}
        validUntil={quotation.validUntil}
        subTotal={quotation.subTotal}
        taxTotal={quotation.taxTotal}
        discountTotal={quotation.discountTotal}
        totalAmount={quotation.totalAmount}
        company={organization}
        customer={quotation.customer}
        items={quotation.items || []}
      />
    </div>
  );
};
