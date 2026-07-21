import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useCreateQuotation } from '../finance/api/financeApi';
import { useCustomers } from '../customers/api/customersApi';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const itemSchema = z.object({
  description: z.string().min(1, 'Required'),
  quantity: z.coerce.number().min(1),
  unitPrice: z.coerce.number().min(0),
});

const quotationFormSchema = z.object({
  customerId: z.string().min(1, 'Required').uuid('Invalid ID'),
  date: z.string().min(1, 'Required'),
  validUntil: z.string().min(1, 'Required'),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, 'At least one item required'),
});

export const QuotationFormPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createMutation = useCreateQuotation();
  const { data: customersResponse } = useCustomers(1, 100, '');
  const customers = customersResponse?.data;

  const form = useForm({
    resolver: zodResolver(quotationFormSchema),
    defaultValues: {
      customerId: '',
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchedItems = form.watch('items');
  const subtotal = watchedItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const tax = subtotal * 0.18; // Mock 18% GST
  const total = subtotal + tax;

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      date: new Date(data.date).toISOString(),
      validUntil: new Date(data.validUntil).toISOString(),
      subtotalAmount: subtotal,
      taxAmount: tax,
      totalAmount: total,
      items: data.items.map((i: any) => ({
        ...i,
        taxRate: 18,
        totalPrice: i.quantity * i.unitPrice,
      })),
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast({ title: 'Quotation created' });
        navigate('/finance/quotations');
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="New Quotation" description="Create a new estimate for a client" />

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
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid Until</FormLabel>
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (18%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
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
              Save Quotation
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
