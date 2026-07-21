import { useParams, useNavigate } from 'react-router-dom';
import {
  useInventoryItem,
  useDeleteInventoryItem,
  useRestoreInventoryItem,
} from './api/inventoryApi';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Icon } from '../../components/ui/icon';

export const InventoryDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useInventoryItem(id as string);
  const deleteMutation = useDeleteInventoryItem();
  const restoreMutation = useRestoreInventoryItem();

  if (isLoading) return <div className="p-8">Loading inventory details...</div>;
  if (isError || !data?.data)
    return <div className="p-8 text-destructive">Failed to load inventory item.</div>;

  const item = data.data;

  const handleArchiveToggle = async () => {
    if (item.deletedAt) {
      await restoreMutation.mutateAsync(item.id);
    } else {
      if (confirm('Are you sure you want to archive this inventory item?')) {
        await deleteMutation.mutateAsync(item.id);
      }
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        title={item.name}
        description={`SKU: ${item.sku}`}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(`/inventory/${item.id}/edit`)}>
              <Icon name="Pencil" className="mr-2 h-4 w-4" />
              Edit Item
            </Button>
            <Button
              variant={item.deletedAt ? 'secondary' : 'destructive'}
              onClick={handleArchiveToggle}
            >
              <Icon name={item.deletedAt ? 'RefreshCw' : 'Trash'} className="mr-2 h-4 w-4" />
              {item.deletedAt ? 'Restore' : 'Archive'}
            </Button>
          </>
        }
      >
        <div className="mt-2 flex gap-2">
          <Badge variant={item.status === 'AVAILABLE' ? 'default' : 'secondary'}>
            {item.status}
          </Badge>
          {item.deletedAt && <Badge variant="destructive">Archived</Badge>}
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Real-time Stock Quantities */}
        <Card className="col-span-3 md:col-span-1">
          <CardHeader>
            <CardTitle>Current Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Available</span>
              <span className="font-semibold">
                {item.availableQuantity} {item.unit}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Reserved</span>
              <span className="font-semibold text-amber-600">
                {item.reservedQuantity} {item.unit}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Damaged</span>
              <span className="font-semibold text-destructive">
                {item.damagedQuantity} {item.unit}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-muted-foreground">Total Owned</span>
              <span className="font-bold text-lg">
                {item.currentQuantity} {item.unit}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Value */}
        <Card className="col-span-3 md:col-span-1">
          <CardHeader>
            <CardTitle>Valuation & Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Purchase Cost</span>
              <span className="font-semibold">${item.purchasePrice?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Rental Price</span>
              <span className="font-semibold text-green-600">${item.rentalPrice?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-muted-foreground">Replacement Value</span>
              <span className="font-semibold">${item.replacementCost?.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Metadata & Identification */}
        <Card className="col-span-3 md:col-span-1">
          <CardHeader>
            <CardTitle>Identification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Barcode</span>
              <span className="font-mono">{item.barcode || '-'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">QR Code</span>
              <span className="font-mono">{item.qrCode || '-'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Category</span>
              <span>{item.category?.name || '-'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {item.description || 'No description provided.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {item.notes || 'No internal notes.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
