import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/ui/button';
import { Plus, ShoppingCart, Store, ClipboardList, AlertTriangle, Box } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { format } from 'date-fns';
import { useOrders, useVendors, useRequisitions, useLowStock } from './api/procurementApi';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';

export const ProcurementDashboard = () => {
  const navigate = useNavigate();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: vendors, isLoading: vendorsLoading } = useVendors();
  const { data: requisitions } = useRequisitions();
  const { data: lowStock } = useLowStock();
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Procurement & Vendors"
        description="Manage purchase orders, internal requisitions, and vendor relationships."
      >
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/procurement/requisitions/new')}>
            <ClipboardList className="w-4 h-4 mr-2" /> New Requisition
          </Button>
          <Button onClick={() => navigate('/procurement/orders/new')}>
            <Plus className="w-4 h-4 mr-2" /> Create PO
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active POs</p>
                <h3 className="text-2xl font-bold">
                  {orders?.filter((o: any) => !['RECEIVED', 'CANCELLED'].includes(o.status))
                    .length || 0}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <Store className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendors</p>
                <h3 className="text-2xl font-bold">{vendors?.length || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <ClipboardList className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requisitions</p>
                <h3 className="text-2xl font-bold">
                  {requisitions?.filter((r: any) => r.status === 'PENDING').length || 0}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Alerts</p>
                <h3 className="text-2xl font-bold">{lowStock?.length || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-background border">
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingCart className="w-4 h-4" /> Purchase Orders
          </TabsTrigger>
          <TabsTrigger value="vendors" className="gap-2">
            <Store className="w-4 h-4" /> Vendors
          </TabsTrigger>
          <TabsTrigger value="requisitions" className="gap-2">
            <ClipboardList className="w-4 h-4" /> Requisitions
          </TabsTrigger>
          <TabsTrigger value="grn" className="gap-2">
            <Box className="w-4 h-4" /> Goods Receipt (GRN)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="p-4 space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-[200px] w-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : orders?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <EmptyState
                        title="No purchase orders found"
                        description="You have not created any purchase orders yet."
                        actionLabel="Create PO"
                        onAction={() => navigate('/procurement/orders/new')}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  orders?.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        PO-{order.id.substring(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>{order.vendor?.name}</TableCell>
                      <TableCell>{format(new Date(order.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>₹{order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === 'RECEIVED'
                              ? 'default'
                              : order.status === 'DRAFT'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="p-4 space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-[200px] w-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : vendors?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <EmptyState
                        title="No vendors found"
                        description="You have not added any vendors yet."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  vendors?.map((vendor: any) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">
                        {vendor.name}
                        {vendor.isPreferred && (
                          <Badge variant="secondary" className="ml-2 text-[10px]">
                            Preferred
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{vendor.contactPerson || '-'}</div>
                        <div className="text-xs text-muted-foreground">
                          {vendor.phone || vendor.email || '-'}
                        </div>
                      </TableCell>
                      <TableCell>{vendor.categories || '-'}</TableCell>
                      <TableCell>{vendor.rating}/5.0</TableCell>
                      <TableCell>
                        <Badge variant={vendor.isActive ? 'default' : 'secondary'}>
                          {vendor.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/procurement/vendors/${vendor.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="requisitions">
          <Card className="p-12 text-center text-muted-foreground border-dashed">
            <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground mb-1">Purchase Requisitions</h3>
            <p>Internal requests from warehouse managers for stock replenishment.</p>
          </Card>
        </TabsContent>

        <TabsContent value="grn">
          <Card className="p-12 text-center text-muted-foreground border-dashed">
            <Box className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground mb-1">Goods Receipt Notes (GRN)</h3>
            <p>Receive PO items into warehouse inventory, track damages and short quantities.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
