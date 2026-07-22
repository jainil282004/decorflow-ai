import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Icon } from '../../../components/ui/icon';
import { cn } from '../../../lib/utils';
import { useInventoryItems } from '../../inventory/api/inventoryApi';

export function OperationsWidget() {
  const { data: inventoryResult, isLoading } = useInventoryItems(1, 100, '');
  const items = inventoryResult?.data ?? [];
  const lowStock = items
    .filter((item) => item.availableQuantity <= item.minStock)
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      item: item.name,
      currentStock: item.availableQuantity,
      minimumStock: item.minStock,
    }));

  // No dedicated "missing / overdue returns" endpoint exists yet.
  const missingReturns: never[] = [];

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Icon name="AlertCircle" className="h-4 w-4 text-destructive stroke-[1.5]" />
          </div>
          Operations Alerts
          <span className="ml-auto text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
            {lowStock.length + missingReturns.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inventory Alerts */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3 flex items-center gap-2">
            <Icon name="PackageX" className="h-3.5 w-3.5" /> Low Stock
          </h4>
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading inventory…</p>
            ) : lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">No low-stock items.</p>
            ) : (
              lowStock.map((alert) => {
                const percentage =
                  alert.minimumStock > 0 ? (alert.currentStock / alert.minimumStock) * 100 : 0;
                const isCritical = percentage < 30;
                return (
                  <div key={alert.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="truncate pr-2 text-sm">{alert.item}</span>
                      <span
                        className={cn(
                          'font-semibold shrink-0 text-xs tabular-nums',
                          isCritical ? 'text-destructive' : 'text-warning'
                        )}
                      >
                        {alert.currentStock} / {alert.minimumStock}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700',
                          isCritical ? 'bg-destructive' : 'bg-warning'
                        )}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Missing Returns */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3 flex items-center gap-2">
            <Icon name="Truck" className="h-3.5 w-3.5" /> Missing Returns
          </h4>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">No missing returns to show.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
