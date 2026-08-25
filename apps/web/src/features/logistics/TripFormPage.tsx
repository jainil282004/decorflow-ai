import { useState, useEffect } from 'react';
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
import { Loader2, ExternalLink, MapPin } from 'lucide-react';

const tripSchema = z.object({
  eventId: z.string().min(1, 'Event is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  driverId: z.string().min(1, 'Driver is required'),
  plannedDeparture: z.string().min(1, 'Planned departure is required'),
  plannedArrival: z.string().min(1, 'Planned arrival is required'),
  customDestinationAddress: z.string().optional(),
  customDestinationUrl: z.string().optional(),
  notes: z.string().optional(),
});

type TripFormValues = z.infer<typeof tripSchema>;

export const TripFormPage = () => {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => (
        <div className="p-8 text-red-500">
          <h1>ERROR IN TRIPFORMPAGE</h1>
          <pre>{error.message}</pre>
          <pre>{error.stack}</pre>
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
      customDestinationAddress: '',
      customDestinationUrl: '',
      notes: '',
    },
  });

  const [locationSearch, setLocationSearch] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [selectedLocationUrl, setSelectedLocationUrl] = useState('');

  // Debounced search for Nominatim
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationSearch.length > 2) {
        setIsSearchingLocation(true);
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}`
        )
          .then((res) => res.json())
          .then((data) => {
            setLocationSuggestions(data);
          })
          .catch((err) => {
            console.error('Error fetching locations:', err);
          })
          .finally(() => {
            setIsSearchingLocation(false);
          });
      } else {
        setLocationSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [locationSearch]);

  const handleSelectLocation = (suggestion: any) => {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${suggestion.lat},${suggestion.lon}`;
    form.setValue('customDestinationAddress', suggestion.display_name);
    form.setValue('customDestinationUrl', mapUrl);
    setSelectedLocationUrl(mapUrl);
    setLocationSearch(suggestion.display_name);
    setLocationSuggestions([]);
  };

  const onSubmit = async (data: TripFormValues) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        plannedDeparture: new Date(data.plannedDeparture).toISOString(),
        plannedArrival: new Date(data.plannedArrival).toISOString(),
      });
      toast({ title: 'Trip scheduled successfully' });
      navigate('/fleet');
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
                          {...field}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select Event...</option>
                          {events?.map((e: any) => (
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
                          {...field}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select Vehicle...</option>
                          {vehicles?.map((v: any) => (
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
                          {...field}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select Driver...</option>
                          {drivers?.map((d: any) => (
                            <option key={d.id} value={d.id}>
                              {d.user?.name}
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

              {/* Location Autocomplete Section */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium">Destination</h3>
                </div>
                <div className="relative">
                  <FormLabel>Search Location</FormLabel>
                  <Input
                    placeholder="Type to search for a location..."
                    value={locationSearch}
                    onChange={(e) => {
                      setLocationSearch(e.target.value);
                      form.setValue('customDestinationAddress', '');
                      form.setValue('customDestinationUrl', '');
                      setSelectedLocationUrl('');
                    }}
                  />
                  {isSearchingLocation && (
                    <div className="absolute right-3 top-9">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {locationSuggestions.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-popover text-popover-foreground rounded-md border shadow-md">
                      {locationSuggestions.map((s) => (
                        <li
                          key={s.place_id}
                          className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                          onClick={() => handleSelectLocation(s)}
                        >
                          {s.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {selectedLocationUrl && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Selected Destination:</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {form.watch('customDestinationAddress')}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedLocationUrl, '_blank')}
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" /> Go to Location
                    </Button>
                  </div>
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
