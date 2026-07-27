import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useToast } from '../../hooks/use-toast';

const selectClassName =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

type CategoryOption = { id: string; name: string; parentId?: string | null };

/** Form-friendly schema: empty subcategory / prices allowed while typing. */
const InventoryFormSchema = z.object({
  categoryId: z.string().min(1, 'Select a category'),
  subcategoryId: z.string().optional().nullable(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().min(2, 'SKU is required'),
  description: z.string().optional().nullable(),
  purchasePrice: z.union([z.number().nonnegative(), z.nan()]).optional().nullable(),
  rentalPrice: z.union([z.number().nonnegative(), z.nan()]).optional().nullable(),
  replacementCost: z.union([z.number().nonnegative(), z.nan()]).optional().nullable(),
  barcode: z.string().optional().nullable(),
  qrCode: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  batchNumber: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  minStock: z.union([z.number().int().nonnegative(), z.nan()]).optional().nullable(),
  maxStock: z.union([z.number().int().nonnegative(), z.nan()]).optional().nullable(),
  bufferHours: z.union([z.number().int().nonnegative(), z.nan()]).optional().nullable(),
  notes: z.string().optional().nullable(),
  requiresCleaning: z.boolean().optional(),
});

type InventoryFormValues = z.infer<typeof InventoryFormSchema>;

function parseOptionalNumber(raw: string): number | undefined {
  if (raw === '') return undefined;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : undefined;
}

function parseOptionalInt(raw: string): number | undefined {
  if (raw === '') return undefined;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : undefined;
}

function toPayload(values: InventoryFormValues): CreateInventoryItemDTO {
  // Build payload without client-side UUID re-validation (that caused the "Invalid uuid" popup).
  const subcategoryId = values.subcategoryId?.trim() ? values.subcategoryId.trim() : null;
  const amount = (n: number | null | undefined) => (n == null || Number.isNaN(n) ? undefined : n);

  return {
    categoryId: values.categoryId,
    subcategoryId,
    name: values.name,
    sku: values.sku,
    description: values.description || null,
    purchasePrice: amount(values.purchasePrice),
    rentalPrice: amount(values.rentalPrice),
    replacementCost: amount(values.replacementCost),
    barcode: values.barcode || null,
    qrCode: values.qrCode || null,
    serialNumber: values.serialNumber || null,
    batchNumber: values.batchNumber || null,
    unit: values.unit || null,
    minStock: amount(values.minStock) as number | undefined,
    maxStock: values.maxStock == null || Number.isNaN(values.maxStock) ? null : values.maxStock,
    bufferHours: amount(values.bufferHours) as number | undefined,
    notes: values.notes || null,
    requiresCleaning: values.requiresCleaning ?? false,
  };
}

export const InventoryFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const { data, isLoading } = useInventoryItem(id as string);
  const { data: categories } = useInventoryCategories();
  const createMutation = useCreateInventoryItem();
  const updateMutation = useUpdateInventoryItem();

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(InventoryFormSchema),
    defaultValues: {
      categoryId: '',
      subcategoryId: '',
      name: '',
      sku: '',
      description: '',
      purchasePrice: undefined,
      rentalPrice: undefined,
      replacementCost: undefined,
      barcode: '',
      qrCode: '',
      serialNumber: '',
      batchNumber: '',
      unit: 'pcs',
      minStock: undefined,
      maxStock: null,
      bufferHours: undefined,
      notes: '',
      requiresCleaning: false,
    },
  });

  const selectedCategoryId = useWatch({ control: form.control, name: 'categoryId' });
  const allCategories = (categories ?? []) as CategoryOption[];
  const hasHierarchy = allCategories.some((c) => !!c.parentId);
  const parentCategories = hasHierarchy ? allCategories.filter((c) => !c.parentId) : allCategories;
  const subcategories = hasHierarchy
    ? allCategories.filter((c) => c.parentId === selectedCategoryId)
    : [];

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
        bufferHours: item.bufferHours ?? undefined,
        notes: item.notes || '',
        requiresCleaning: item.requiresCleaning ?? false,
      });
    }
  }, [data, form]);

  useEffect(() => {
    const current = form.getValues('subcategoryId');
    if (!current) return;
    if (!subcategories.some((c) => c.id === current)) {
      form.setValue('subcategoryId', '');
    }
  }, [selectedCategoryId, subcategories, form]);

  const onSubmit = async (values: InventoryFormValues) => {
    const payload = toPayload(values);

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id, payload });
        toast({ title: 'Item updated' });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: 'Item created' });
      }
      navigate('/inventory');
    } catch (err: any) {
      const apiMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.error?.details)
          ? err.response.data.error.details
              .map((d: { message?: string }) => d.message)
              .filter(Boolean)
              .join(', ')
          : null);
      toast({
        title: apiMsg || 'Could not save catalog item',
        variant: 'destructive',
      });
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
                        <select className={selectClassName} {...field}>
                          <option value="">Select a category...</option>
                          {parentCategories.map((c) => (
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
                        <select
                          className={selectClassName}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          disabled={!selectedCategoryId || !hasHierarchy}
                        >
                          <option value="">None</option>
                          {subcategories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Leave as None if you do not use subcategories.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

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
                            min={0}
                            placeholder="Optional"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(parseOptionalNumber(e.target.value))}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
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
                            min={0}
                            placeholder="Optional"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(parseOptionalNumber(e.target.value))}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
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
                            min={0}
                            placeholder="Optional"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(parseOptionalNumber(e.target.value))}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

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
                            min={0}
                            placeholder="Optional"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(parseOptionalInt(e.target.value))}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
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
                            min={0}
                            placeholder="Optional"
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const n = parseOptionalInt(e.target.value);
                              field.onChange(n === undefined ? null : n);
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
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
                            min={0}
                            placeholder="e.g. 12"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(parseOptionalInt(e.target.value))}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
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
