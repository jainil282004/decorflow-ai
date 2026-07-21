import { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useSavedReports, useSaveReport } from './api/analyticsApi';
import { FileDown, Save, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow } from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';

export const ReportBuilder = () => {
  const { data: savedReports, isLoading } = useSavedReports();
  const saveReportMutation = useSaveReport();

  const [reportType, setReportType] = useState('FINANCIAL');
  const [dateRange, setDateRange] = useState('this_month');

  const handleSave = () => {
    saveReportMutation.mutate({
      name: `Custom ${reportType} Report - ${new Date().toLocaleDateString()}`,
      type: reportType as any,
      config: { dateRange, columns: ['id', 'date', 'amount'] },
    });
  };

  const handleExportCSV = () => {
    // In a real scenario, this would trigger an API call to download CSV
    // We are simulating the frontend-driven CSV export here.
    const csvContent =
      'data:text/csv;charset=utf-8,ID,Date,Amount\n1,2023-10-01,15000\n2,2023-10-05,25000';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `report_${reportType.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader
          title="Report Builder"
          description="Build, save, and export custom operational reports"
        />
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSave} disabled={saveReportMutation.isPending}>
            <Save className="mr-2 h-4 w-4" /> Save Configuration
          </Button>
          <Button onClick={handleExportCSV}>
            <FileDown className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Source</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FINANCIAL">Financial (Invoices & Bills)</SelectItem>
                    <SelectItem value="EVENT">Events</SelectItem>
                    <SelectItem value="INVENTORY">Inventory</SelectItem>
                    <SelectItem value="WORKFORCE">Workforce</SelectItem>
                    <SelectItem value="CUSTOMER">Customers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="this_year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved Reports</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell>
                        <div className="p-2 space-y-4">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : savedReports?.length === 0 ? (
                    <TableRow>
                      <TableCell className="p-0">
                        <EmptyState
                          title="No saved reports"
                          description="Create a custom configuration and save it."
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    savedReports?.map((report: any) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Load
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border h-[400px] flex items-center justify-center bg-secondary/10">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Select configuration to generate preview.
                  </p>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Add Columns
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
