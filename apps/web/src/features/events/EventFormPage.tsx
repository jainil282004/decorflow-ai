import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateEventSchema } from '@decorflow/shared';
import type { CreateEventDTO } from '@decorflow/shared';
import {
  useEvent,
  useCreateEvent,
  useUpdateEvent,
  useEventTypes,
  useEventStatuses,
} from './api/eventsApi';
import { useCustomers } from '../customers/api/customersApi';
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
import { format } from 'date-fns';

export const EventFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data, isLoading } = useEvent(id as string);
  const { data: customers } = useCustomers(1, 100, '');
  const { data: eventTypes } = useEventTypes();
  const { data: eventStatuses } = useEventStatuses();
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();

  const form = useForm<CreateEventDTO>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues: {
      customerId: '',
      title: '',
      typeId: '',
      statusId: '',
      theme: '',
      priority: '',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      totalAmount: 0,
      depositAmount: 0,
    },
  });

  useEffect(() => {
    if (data?.data) {
      const event = data.data;
      form.reset({
        customerId: event.customerId,
        title: event.title,
        typeId: event.typeId,
        statusId: event.statusId,
        theme: event.theme || '',
        priority: event.priority || '',
        startDate: event.startDate,
        endDate: event.endDate,
        setupDate: event.setupDate,
        dismantleDate: event.dismantleDate,
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        guestCount: event.guestCount || undefined,
        budget: event.budget || undefined,
        expectedRevenue: event.expectedRevenue || undefined,
        venueId: event.venueId,
        totalAmount: event.totalAmount,
        depositAmount: event.depositAmount,
      });
    }
  }, [data, form]);

  const onSubmit = async (values: CreateEventDTO) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id, payload: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      navigate('/events');
    } catch (error) {
      console.error('Failed to save event', error);
    }
  };

  if (isEditing && isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        title={isEditing ? 'Edit Event' : 'New Event'}
        description={isEditing ? 'Update event details' : 'Create a new event'}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/events')}>
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {isEditing ? 'Save Changes' : 'Create Event'}
            </Button>
          </>
        }
      />

      <Form {...form}>
        <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Smith Wedding" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          {customers?.data?.map((c: any) => (
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
                  name="typeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Select a type...</option>
                          {eventTypes?.map((t: any) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
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
                  name="statusId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Status</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Select a status...</option>
                          {eventStatuses?.map((s: any) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Timeline Info */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val ? new Date(val).toISOString() : '');
                            }}
                            value={
                              field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ''
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val ? new Date(val).toISOString() : '');
                            }}
                            value={
                              field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ''
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
          </div>
        </form>
      </Form>
    </div>
  );
};
