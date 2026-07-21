import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import type { InventoryItemResponseDTO } from '@decorflow/shared';
import { useInventoryItems } from './api/inventoryApi';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/ui/button';
import { Icon } from '../../components/ui/icon';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { ErrorState } from '../../components/ui/error-state';
import { EmptyState } from '../../components/ui/empty-state';
import { Skeleton } from '../../components/ui/skeleton';

export const InventoryListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const { data, isError, isLoading, refetch } = useInventoryItems(page, 10, search);

  const columns: ColumnDef<InventoryItemResponseDTO>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.sku}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      id: 'category',
      header: 'Category',
      cell: ({ row }) => <Badge variant="outline">{row.original.category?.name || '-'}</Badge>,
    },
    {
      id: 'stock',
      header: 'Available / Total',
      cell: ({ row }) => {
        const { availableQuantity, currentQuantity, minStock } = row.original;
        const isLowStock = availableQuantity <= minStock;

        return (
          <div className="flex items-center space-x-2">
            <span className={isLowStock ? 'text-destructive font-semibold' : ''}>
              {availableQuantity}
            </span>
            <span className="text-muted-foreground">/ {currentQuantity}</span>
            {isLowStock && (
              <Badge variant="destructive" className="ml-2">
                Low
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
        if (status === 'AVAILABLE') variant = 'default';
        if (status === 'DAMAGED') variant = 'destructive';
        if (status === 'RESERVED') variant = 'secondary';

        return <Badge variant={variant}>{status}</Badge>;
      },
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        title="Inventory"
        description="Manage warehouse stock and rental items."
        actions={
          <Button onClick={() => navigate('/inventory/new')}>
            <Icon name="Plus" className="mr-2 h-4 w-4" />
            New Item
          </Button>
        }
      >
        <div className="flex flex-1 items-center space-x-2 w-full max-w-sm mt-4 sm:mt-0">
          <Input
            placeholder="Search by name, SKU, barcode..."
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
            title="No inventory items found"
            description={
              search
                ? 'Try adjusting your search query.'
                : "You haven't added any items to your inventory yet."
            }
            actionLabel={search ? 'Clear Search' : 'New Item'}
            onAction={() => (search ? setSearchValue('') : navigate('/inventory/new'))}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data?.data || []}
            onRowClick={(row: InventoryItemResponseDTO) => navigate(`/inventory/${row.id}`)}
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
