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
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <PageHeader
        title="Schedule New Trip"
        description="Assign a vehicle and driver for an event"
      />
      <div className="p-8 bg-green-100 text-green-800">
        <h1>TRIP FORMPAGE INNER RENDERED</h1>
        <p>If you see this, the routing and lazy loading work!</p>
      </div>
    </div>
  );
};
