import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Checkbox } from '../../components/ui/checkbox';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardContent } from '../../components/ui/card';
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
import { useCreateInvoice, useQuotations, useQuotation } from '../finance/api/financeApi';
import { useCustomers } from '../customers/api/customersApi';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { DEFAULT_TAX_RATE, DEFAULT_TAX_RATE_PERCENT } from '../../config/tax';

const itemSchema = z.object({
  description: z.string().min(1, 'Required'),
  quantity: z.coerce.number().min(1),
  unitPrice: z.coerce.number().min(0),
});

const invoiceFormSchema = z.object({
  customerId: z.string().min(1, 'Required').uuid('Invalid ID'),
  date: z.string().min(1, 'Required'),
  dueDate: z.string().min(1, 'Required'),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, 'At least one item required'),
  discountTotal: z.coerce.number().min(0).optional(),
  applyTax: z.boolean(),
});

export const InvoiceFormPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createMutation = useCreateInvoice();
  const { data: customersResponse } = useCustomers(1, 100, '');
  const customers = customersResponse?.data;

  const form = useForm({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customerId: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      discountTotal: 0,
      applyTax: true,
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const { data: quotations } = useQuotations();
  const approvedQuotations = (quotations ?? []).filter(
    (q: any) => q.status === 'APPROVED' || q.status === 'SENT'
  );
  const [selectedQuotationId, setSelectedQuotationId] = useState('');
  const { data: selectedQuotation } = useQuotation(selectedQuotationId);

  useEffect(() => {
    if (!selectedQuotation) return;
    form.setValue('customerId', selectedQuotation.customerId);
    form.setValue('discountTotal', selectedQuotation.discountTotal ?? 0);
    replace(
      selectedQuotation.items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }))
    );
    toast({ title: `Filled in from quotation ${selectedQuotation.number}` });
  }, [selectedQuotation]);

  const watchedItems = form.watch('items');
  const subtotal = watchedItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const applyTax = form.watch('applyTax');
  const discountTotal = form.watch('discountTotal') || 0;
  const tax = applyTax ? subtotal * (DEFAULT_TAX_RATE_PERCENT / 100) : 0;
  const total = Math.max(0, subtotal + tax - discountTotal);

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      date: new Date(data.date).toISOString(),
      dueDate: new Date(data.dueDate).toISOString(),
      subtotalAmount: subtotal,
      taxAmount: tax,
      totalAmount: total,
      discountTotal: data.discountTotal || 0,
      quotationId: selectedQuotationId || undefined,
      items: data.items.map((i: any) => ({
        ...i,
        taxRate: applyTax ? DEFAULT_TAX_RATE_PERCENT : 0,
        totalPrice: i.quantity * i.unitPrice,
      })),
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast({ title: 'Invoice created' });
        navigate('/finance/invoices');
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="New Invoice" description="Create a new invoice for a client" />

      {approvedQuotations.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Fill in from an existing quotation
              </label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedQuotationId}
                onChange={(e) => setSelectedQuotationId(e.target.value)}
              >
                <option value="">Start blank...</option>
                {approvedQuotations.map((q: any) => (
                  <option key={q.id} value={q.id}>
                    {q.number} — {q.customer?.name} (₹{q.totalAmount?.toFixed(2)})
                  </option>
                ))}
              </select>
              <p className="text-[0.8rem] text-muted-foreground">
                Picking a quotation fills the form below. You can still edit anything before saving.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Select a customer...</option>
                          {customers?.map((c: any) => (
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
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Line Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start">
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Qty"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value ? parseFloat(e.target.value) : 0)
                              }
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem className="w-32">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Price"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value ? parseFloat(e.target.value) : 0)
                              }
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <FormField
                    control={form.control}
                    name="applyTax"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Apply tax (18%)</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discountTotal"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <FormLabel className="text-muted-foreground font-normal">
                          Discount (₹)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="w-24 h-8 text-right"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : 0)
                            }
                            value={field.value || ''}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {applyTax && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tax ({DEFAULT_TAX_RATE_PERCENT}%)
                      </span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                  )}
                  {discountTotal > 0 && (
                    <div className="flex justify-between text-success">
                      <span className="text-muted-foreground">Discount</span>
                      <span>-₹{discountTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Invoice
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
