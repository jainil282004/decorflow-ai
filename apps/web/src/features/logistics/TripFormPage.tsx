import { ErrorBoundary } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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

import { useCreateTrip, useVehicles, useDrivers } from './api/logisticsApi';
import { useEvents } from '../events/api/eventsApi';
import { useToast } from '../../hooks/use-toast';
import { Loader2, MapPin } from 'lucide-react';

const tripSchema = z.object({
  eventId: z.string().min(1, 'Event is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  driverId: z.string().min(1, 'Driver is required'),
  plannedDeparture: z.string().min(1, 'Planned departure is required'),
  plannedArrival: z.string().min(1, 'Planned arrival is required'),
  notes: z.string().optional(),
});

type TripFormValues = z.infer<typeof tripSchema>;

export const TripFormPage = () => {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => (
        <div className="p-8 text-red-500">
          <h1>ERROR IN TRIPFORMPAGE</h1>
          <pre>{(error as Error).message}</pre>
          <pre>{(error as Error).stack}</pre>
        </div>
      )}
    >
      <TripFormPageInner />
    </ErrorBoundary>
  );
};

const TripFormPageInner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createMutation = useCreateTrip();

  const { data: eventsResponse } = useEvents(1, 100, '');
  const events = eventsResponse?.data || [];
  const { data: vehicles } = useVehicles();
  const { data: drivers } = useDrivers();

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      eventId: '',
      vehicleId: '',
      driverId: '',
      plannedDeparture: '',
      plannedArrival: '',
      notes: '',
    },
  });

  const selectedEventId = form.watch('eventId');
  const selectedEvent = events.find((e: any) => e.id === selectedEventId);
  const destinationVenue = selectedEvent?.venue;

  const onSubmit = async (data: TripFormValues) => {
    try {
      const res = await createMutation.mutateAsync({
        ...data,
        destinationVenueId: destinationVenue?.id,
        plannedDeparture: new Date(data.plannedDeparture).toISOString(),
        plannedArrival: new Date(data.plannedArrival).toISOString(),
      });
      toast({ title: 'Trip scheduled successfully' });
      navigate(`/fleet/trips/${res.data.id}`);
    } catch (error: any) {
      toast({
        title: 'Error scheduling trip',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <PageHeader
        title="Schedule New Trip"
        description="Assign a vehicle and driver for an event"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="eventId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Select an event...</option>
                          {events.map((e: any) => (
                            <option key={e.id} value={e.id}>
                              {e.title}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-6"></div>

                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Select a vehicle...</option>
                          {(vehicles || []).map((v: any) => (
                            <option key={v.id} value={v.id}>
                              {v.licensePlate} - {v.make} {v.model}
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
                  name="driverId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Select a driver...</option>
                          {(drivers || []).map((d: any) => (
                            <option key={d.id} value={d.id}>
                              {d.user?.name || 'Unknown Driver'}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="plannedDeparture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Planned Departure Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="plannedArrival"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Planned Arrival Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input placeholder="Any additional instructions..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium">Destination</h3>
                </div>
                {destinationVenue ? (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium text-sm">{destinationVenue.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{destinationVenue.address}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select an event to see its destination venue.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/fleet')}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Schedule Trip
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
