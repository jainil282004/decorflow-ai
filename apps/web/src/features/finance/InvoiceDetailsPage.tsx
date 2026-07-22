import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/ui/button';
import { useInvoice } from '../finance/api/financeApi';
import { useOrganization } from '../saas/api/saasApi';
import {
  exportToPdf,
  exportToWord,
  exportFinanceDocumentToExcel,
  printDocument,
  buildDocumentFilename,
} from '../../utils/exportUtils';
import { FinanceDocumentView } from '../finance/components/FinanceDocumentView';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { useToast } from '../../hooks/use-toast';

export const InvoiceDetailsPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { data: invoice, isLoading, isError, refetch } = useInvoice(id as string);
  const { data: organization } = useOrganization();

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
          title="Could not load invoice"
          description="Something went wrong while fetching this invoice. Check your connection and try again."
          actionLabel="Try again"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="pt-12">
        <EmptyState
          title="Invoice Not Found"
          description="The invoice you are looking for does not exist."
          actionLabel="Back to Dashboard"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  const filename = buildDocumentFilename('INVOICE', invoice.number, invoice.customer?.name);

  const handleExportPdf = () => exportToPdf('invoice-document', filename);

  const handlePrint = () => printDocument('invoice-document');

  const handleExportWord = () => exportToWord('Invoice', invoice, organization, filename);

  const handleExportExcel = async () => {
    try {
      await exportFinanceDocumentToExcel(
        {
          docType: 'INVOICE',
          number: invoice.number,
          status: invoice.status,
          date: invoice.date,
          dueDate: invoice.dueDate,
          notes: invoice.notes,
          subTotal: invoice.subTotal,
          taxTotal: invoice.taxTotal,
          discountTotal: invoice.discountTotal,
          totalAmount: invoice.totalAmount,
          company: organization,
          customer: invoice.customer,
          items: invoice.items || [],
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
          <Link to="/finance/invoices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={`Invoice ${invoice.number}`}
          description={`Created on ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`}
        />
        <div className="ml-auto flex flex-wrap gap-2">
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
        documentId="invoice-document"
        docType="INVOICE"
        number={invoice.number}
        status={invoice.status}
        date={invoice.date}
        dueDate={invoice.dueDate}
        notes={invoice.notes}
        subTotal={invoice.subTotal}
        taxTotal={invoice.taxTotal}
        discountTotal={invoice.discountTotal}
        totalAmount={invoice.totalAmount}
        company={organization}
        customer={invoice.customer}
        items={invoice.items || []}
      />
    </div>
  );
};
