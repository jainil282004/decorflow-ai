import { PageHeader } from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useInventoryAnalytics } from './api/analyticsApi';
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

export const InventoryAnalyticsDashboard = () => {
  const { data: analytics, isLoading } = useInventoryAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-2" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  const items = analytics?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Analytics"
        description="Warehouse utilization, aging, and item statistics"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Inventory by Quantity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Reserved</TableHead>
                  <TableHead className="text-right">Damaged</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="p-0">
                      <EmptyState
                        title="No inventory data"
                        description="Start adding items to your inventory to see analytics."
                      />
                    </TableCell>
                  </TableRow>
                )}
                {items.map((item: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.currentQuantity}</TableCell>
                    <TableCell className="text-right text-green-600">
                      {item.availableQuantity}
                    </TableCell>
                    <TableCell className="text-right text-blue-600">
                      {item.reservedQuantity}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {item.damagedQuantity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">Items needing repair</span>
                  <span className="font-semibold text-red-600">
                    {items.reduce((acc: number, cur: any) => acc + cur.damagedQuantity, 0)}
                  </span>
                </li>
                <li className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">Low stock warnings</span>
                  <span className="font-semibold text-yellow-600">3</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
