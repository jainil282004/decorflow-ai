import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import type { CustomerResponseDTO } from '@decorflow/shared';
import { useCustomers } from './api/customersApi';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Icon } from '../../components/ui/icon';
import { Badge } from '../../components/ui/badge';
import { ErrorState } from '../../components/ui/error-state';
import { EmptyState } from '../../components/ui/empty-state';
import { Skeleton } from '../../components/ui/skeleton';

export function CustomerListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Local state for the input, syncs to `search` on enter or blur to prevent excessive API calls
  const [searchValue, setSearchValue] = useState('');

  const { data, isError, isLoading, refetch } = useCustomers(page, 10, search);

  const columns: ColumnDef<CustomerResponseDTO>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div
          className="flex flex-col gap-1 cursor-pointer"
          onClick={() => navigate(`/customers/${row.original.id}`)}
        >
          <span className="font-semibold text-primary hover:underline">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.email || 'No email'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant={row.original.type === 'BUSINESS' ? 'default' : 'secondary'}>
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.phone || '-',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'outline' : 'destructive'}>
          {row.original.isActive ? 'Active' : 'Archived'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/customers/${row.original.id}`)}
        >
          <Icon name="ChevronRight" className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const handleSearch = () => {
    setPage(1);
    setSearch(searchValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Manage your client base, addresses, and contacts.">
        <Button onClick={() => navigate('/customers/new')}>
          <Icon name="Plus" className="mr-2 h-4 w-4" />
          New Customer
        </Button>
      </PageHeader>

      <div className="flex items-center gap-4 max-w-sm">
        <div className="relative flex-1">
          <Icon
            name="Search"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            placeholder="Search name, email, phone..."
            className="pl-9"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSearch}
          />
        </div>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : !data?.data?.length ? (
        <EmptyState
          title="No customers found"
          description={
            search ? 'Try adjusting your search query.' : "You haven't added any customers yet."
          }
          actionLabel={search ? 'Clear Search' : 'New Customer'}
          onAction={() => (search ? setSearchValue('') : navigate('/customers/new'))}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data || []}
          manualPagination
          pageCount={data?.meta?.totalPages || 1}
          pagination={{ pageIndex: page - 1, pageSize: 10 }}
          onPaginationChange={(updater) => {
            if (typeof updater === 'function') {
              const newState = updater({ pageIndex: page - 1, pageSize: 10 });
              setPage(newState.pageIndex + 1);
            }
          }}
        />
      )}
    </div>
  );
}
