import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCustomerSchema } from '@decorflow/shared';
import type { CreateCustomerDTO } from '@decorflow/shared';
import { useCustomer, useCreateCustomer, useUpdateCustomer } from './api/customersApi';
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
import { Icon } from '../../components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export function CustomerFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: response, isLoading: isLoadingCustomer } = useCustomer(id || '');
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const form = useForm<CreateCustomerDTO>({
    resolver: zodResolver(CreateCustomerSchema),
    defaultValues: {
      type: 'INDIVIDUAL',
      name: '',
      email: '',
      phone: '',
      taxId: '',
      notes: '',
      addresses: [],
      contacts: [],
    },
  });

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({
    control: form.control,
    name: 'addresses',
  });

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control: form.control,
    name: 'contacts',
  });

  useEffect(() => {
    if (isEditing && response?.data) {
      const c = response.data;
      form.reset({
        type: c.type as 'INDIVIDUAL' | 'BUSINESS',
        name: c.name,
        email: c.email || '',
        phone: c.phone || '',
        taxId: c.taxId || '',
        notes: c.notes || '',
        addresses:
          c.addresses?.map((a) => ({
            type: a.type as 'BILLING' | 'SHIPPING' | 'EVENT' | 'OFFICE' | 'OTHER',
            line1: a.line1,
            line2: a.line2 || '',
            city: a.city,
            state: a.state,
            zip: a.zip,
            country: a.country,
          })) || [],
        contacts:
          c.contacts?.map((contact) => ({
            name: contact.name,
            role: contact.role || '',
            email: contact.email || '',
            phone: contact.phone || '',
          })) || [],
      });
    }
  }, [isEditing, response, form.reset]);

  const onSubmit = (data: CreateCustomerDTO) => {
    if (isEditing) {
      updateMutation.mutate(
        { id, dto: data },
        {
          onSuccess: () => navigate(`/customers/${id}`),
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: (res) => navigate(`/customers/${res.data.id}`),
      });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isEditing && isLoadingCustomer) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div
        className="flex items-center gap-4 text-sm text-muted-foreground mb-4 cursor-pointer hover:text-primary transition-colors w-fit"
        onClick={() => navigate(isEditing ? `/customers/${id}` : '/customers')}
      >
        <Icon name="ArrowLeft" className="h-4 w-4" /> Cancel
      </div>

      <PageHeader
        title={isEditing ? 'Edit Customer' : 'Create Customer'}
        description="Fill out the primary details, addresses, and contacts below."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="INDIVIDUAL">Individual</option>
                        <option value="BUSINESS">Business</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe or Acme Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 234 567 8900" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID (e.g. GST)</FormLabel>
                    <FormControl>
                      <Input placeholder="Tax ID Number" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        value={field.value || ''}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Internal notes..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Addresses</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendAddress({
                    type: 'BILLING',
                    line1: '',
                    city: '',
                    state: '',
                    zip: '',
                    country: 'India',
                  })
                }
              >
                <Icon name="Plus" className="h-4 w-4 mr-2" /> Add Address
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {addressFields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative p-4 border rounded-md bg-muted/10 grid gap-4 md:grid-cols-2"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive"
                    onClick={() => removeAddress(index)}
                  >
                    <Icon name="Trash2" className="h-4 w-4" />
                  </Button>

                  <FormField
                    control={form.control}
                    name={`addresses.${index}.type` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="BILLING">Billing</option>
                            <option value="SHIPPING">Shipping</option>
                            <option value="EVENT">Event</option>
                            <option value="OFFICE">Office</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`addresses.${index}.line1` as const}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Line 1 *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`addresses.${index}.line2` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Line 2</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`addresses.${index}.city` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`addresses.${index}.state` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`addresses.${index}.zip` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`addresses.${index}.country` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              {addressFields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No addresses added yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Contacts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Additional Contacts</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendContact({ name: '', role: '', email: '', phone: '' })}
              >
                <Icon name="Plus" className="h-4 w-4 mr-2" /> Add Contact
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {contactFields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative p-4 border rounded-md bg-muted/10 grid gap-4 md:grid-cols-2"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive"
                    onClick={() => removeContact(index)}
                  >
                    <Icon name="Trash2" className="h-4 w-4" />
                  </Button>

                  <FormField
                    control={form.control}
                    name={`contacts.${index}.name` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`contacts.${index}.role` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role (e.g. Manager)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`contacts.${index}.email` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`contacts.${index}.phone` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              {contactFields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No additional contacts added yet.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Customer'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
