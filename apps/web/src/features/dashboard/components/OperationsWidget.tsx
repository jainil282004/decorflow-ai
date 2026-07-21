import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Icon } from '../../../components/ui/icon';
import { operationalAlerts } from '../mockData';
import { cn } from '../../../lib/utils';

export function OperationsWidget() {
  return (
    <Card className="col-span-1">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Icon name="AlertCircle" className="h-4 w-4 text-destructive stroke-[1.5]" />
          </div>
          Operations Alerts
          <span className="ml-auto text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
            {operationalAlerts.inventory.length + operationalAlerts.missingReturns.length}
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
            {operationalAlerts.inventory.map((alert) => {
              const percentage = (alert.currentStock / alert.minimumStock) * 100;
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
            })}
          </div>
        </div>

        {/* Missing Returns */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3 flex items-center gap-2">
            <Icon name="Truck" className="h-3.5 w-3.5" /> Missing Returns
          </h4>
          <div className="space-y-3">
            {operationalAlerts.missingReturns.map((alert) => (
              <div
                key={alert.id}
                className="flex flex-col text-sm border-l-2 border-warning pl-3 py-1 rounded-r-md hover:bg-muted/30 transition-colors -ml-0.5"
              >
                <span className="font-medium text-sm">{alert.event}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{alert.items}</span>
                <span className="text-xs text-warning font-semibold mt-1 flex items-center gap-1">
                  <span className="status-dot status-dot-warning !w-[5px] !h-[5px]" />
                  {alert.delay}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
