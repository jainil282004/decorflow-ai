import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import type { EventResponseDTO } from '@decorflow/shared';
import { useEvents } from './api/eventsApi';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/ui/button';
import { Icon } from '../../components/ui/icon';
import { Input } from '../../components/ui/input';
import { format } from 'date-fns';
import { Badge } from '../../components/ui/badge';
import { ErrorState } from '../../components/ui/error-state';
import { EmptyState } from '../../components/ui/empty-state';
import { Skeleton } from '../../components/ui/skeleton';

export const EventListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const { data, isError, isLoading, refetch } = useEvents(page, 10, search);

  const columns: ColumnDef<EventResponseDTO>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => <div className="font-medium text-foreground">{row.original.title}</div>,
    },
    {
      id: 'customer',
      header: 'Customer',
      cell: ({ row }) => row.original.customer?.name || '-',
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge variant="outline">{row.original.type?.name || '-'}</Badge>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusName = row.original.status?.name || '-';
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
        if (['Confirmed', 'Planning'].includes(statusName)) variant = 'default';
        if (['In Progress'].includes(statusName)) variant = 'secondary';
        if (['Cancelled'].includes(statusName)) variant = 'destructive';

        return <Badge variant={variant}>{statusName}</Badge>;
      },
    },
    {
      accessorKey: 'startDate',
      header: 'Date',
      cell: ({ row }) => format(new Date(row.original.startDate), 'PPP'),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }) => {
        const amount = row.original.totalAmount;
        return amount ? `$${amount.toFixed(2)}` : '-';
      },
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        title="Events"
        description="Manage your enterprise events."
        actions={
          <Button onClick={() => navigate('/events/new')}>
            <Icon name="Plus" className="mr-2 h-4 w-4" />
            New Event
          </Button>
        }
      >
        <div className="flex flex-1 items-center space-x-2 w-full max-w-sm mt-4 sm:mt-0">
          <Input
            placeholder="Search events..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearch(searchValue);
                setPage(1);
              }
            }}
            onBlur={() => {
              if (search !== searchValue) {
                setSearch(searchValue);
                setPage(1);
              }
            }}
          />
        </div>
      </PageHeader>

      <div className="bg-card border rounded-lg">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : !data?.data?.length ? (
          <EmptyState
            title="No events found"
            description={
              search ? 'Try adjusting your search query.' : "You haven't scheduled any events yet."
            }
            actionLabel={search ? 'Clear Search' : 'New Event'}
            onAction={() => (search ? setSearchValue('') : navigate('/events/new'))}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data?.data || []}
            onRowClick={(row: EventResponseDTO) => navigate(`/events/${row.id}`)}
            manualPagination
            pageCount={data?.meta?.totalPages || -1}
            pagination={{
              pageIndex: page - 1,
              pageSize: 10,
            }}
            onPaginationChange={(updater) => {
              if (typeof updater === 'function') {
                const newState = updater({ pageIndex: page - 1, pageSize: 10 });
                setPage(newState.pageIndex + 1);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};
