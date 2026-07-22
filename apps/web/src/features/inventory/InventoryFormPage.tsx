import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateInventoryItemSchema } from '@decorflow/shared';
import type { CreateInventoryItemDTO } from '@decorflow/shared';
import {
  useInventoryItem,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useInventoryCategories,
} from './api/inventoryApi';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';

export const InventoryFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data, isLoading } = useInventoryItem(id as string);
  const { data: categories } = useInventoryCategories();
  const createMutation = useCreateInventoryItem();
  const updateMutation = useUpdateInventoryItem();

  const form = useForm<CreateInventoryItemDTO>({
    resolver: zodResolver(CreateInventoryItemSchema),
    defaultValues: {
      categoryId: '',
      subcategoryId: '',
      name: '',
      sku: '',
      description: '',
      purchasePrice: 0,
      rentalPrice: 0,
      replacementCost: 0,
      barcode: '',
      qrCode: '',
      serialNumber: '',
      batchNumber: '',
      unit: 'pcs',
      minStock: 0,
      maxStock: null,
      bufferHours: 0,
      notes: '',
      requiresCleaning: false,
    },
  });

  useEffect(() => {
    if (data?.data) {
      const item = data.data;
      form.reset({
        categoryId: item.categoryId,
        subcategoryId: item.subcategoryId || '',
        name: item.name,
        sku: item.sku,
        description: item.description || '',
        purchasePrice: item.purchasePrice,
        rentalPrice: item.rentalPrice,
        replacementCost: item.replacementCost,
        barcode: item.barcode || '',
        qrCode: item.qrCode || '',
        serialNumber: item.serialNumber || '',
        batchNumber: item.batchNumber || '',
        unit: item.unit || 'pcs',
        minStock: item.minStock,
        maxStock: item.maxStock,
        bufferHours: item.bufferHours || 0,
        notes: item.notes || '',
        requiresCleaning: item.requiresCleaning ?? false,
      });
    }
  }, [data, form]);

  const onSubmit = async (values: CreateInventoryItemDTO) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id, payload: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      navigate('/inventory');
    } catch (error) {
      console.error('Failed to save inventory item', error);
    }
  };

  if (isEditing && isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        title={isEditing ? 'Edit Item' : 'New Item'}
        description={isEditing ? 'Update inventory metadata' : 'Register new inventory stock'}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/inventory')}>
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {isEditing ? 'Save Changes' : 'Create Item'}
            </Button>
          </>
        }
      />

      <Form {...form}>
        <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Identity Info */}
            <Card>
              <CardHeader>
                <CardTitle>Identity & Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Round Banquet Table" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="TAB-RND-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <FormControl>
                          <Input placeholder="pcs" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Select a category...</option>
                          {categories?.map((c: any) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subcategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Optional subcategory UUID"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing Info */}
            <Card>
              <CardHeader>
                <CardTitle>Financials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="purchasePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Cost</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rentalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rental Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="replacementCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Replacement Cost</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tracking Codes */}
            <Card>
              <CardHeader>
                <CardTitle>Tracking & Barcodes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Barcode</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="qrCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>QR Code</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="serialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serial Number</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="batchNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch / Lot Number</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stock Metrics Info */}
            <Card>
              <CardHeader>
                <CardTitle>Stock Control Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Stock (Alert Level)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseInt(e.target.value) : 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Stock Capacity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseInt(e.target.value) : null)
                            }
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bufferHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Buffer Turnaround (Hours)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 12"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseInt(e.target.value) : 0)
                            }
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          Time needed between events (cleaning, drying, etc.)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requiresCleaning"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 md:col-span-2">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Requires washing / cleaning</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Enable for cloths, carpets, chandarva, flooring covers, and similar
                            washable materials. They will appear in Cleaning reminders after event
                            returns.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="pt-2">
                      <FormLabel>Internal Notes</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
};
