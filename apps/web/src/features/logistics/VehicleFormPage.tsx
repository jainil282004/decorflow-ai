import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCreateVehicle, useDrivers, useVehicleTypes } from './api/logisticsApi';
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
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useToast } from '../../hooks/use-toast';
import type { CreateVehicleDTO } from '@decorflow/shared';

const selectClassName =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

type VehicleFormValues = {
  typeId: string;
  make: string;
  model: string;
  licensePlate: string;
  year?: number;
  capacity?: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';
  fuelType?: string;
  assignedDriverId?: string;
  notes?: string;
};

export const VehicleFormPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: types, isLoading: typesLoading } = useVehicleTypes();
  const { data: drivers, isLoading: driversLoading } = useDrivers();
  const createMutation = useCreateVehicle();

  const form = useForm<VehicleFormValues>({
    defaultValues: {
      typeId: '',
      make: '',
      model: '',
      licensePlate: '',
      status: 'ACTIVE',
      fuelType: '',
      notes: '',
      assignedDriverId: undefined,
    },
  });

  const onSubmit = (data: VehicleFormValues) => {
    if (!data.licensePlate.trim()) {
      form.setError('licensePlate', { message: 'Registration number is required' });
      return;
    }
    if (!data.typeId) {
      form.setError('typeId', { message: 'Select a vehicle type' });
      return;
    }
    if (!data.make.trim()) {
      form.setError('make', { message: 'Make is required' });
      return;
    }
    if (!data.model.trim()) {
      form.setError('model', { message: 'Model is required' });
      return;
    }

    const payload: CreateVehicleDTO = {
      typeId: data.typeId,
      make: data.make.trim(),
      model: data.model.trim(),
      licensePlate: data.licensePlate.trim().toUpperCase(),
      status: data.status || 'ACTIVE',
      ...(typeof data.year === 'number' && !Number.isNaN(data.year) ? { year: data.year } : {}),
      ...(typeof data.capacity === 'number' && !Number.isNaN(data.capacity)
        ? { capacity: data.capacity }
        : {}),
      ...(data.fuelType ? { fuelType: data.fuelType } : {}),
      ...(data.assignedDriverId ? { assignedDriverId: data.assignedDriverId } : {}),
      ...(data.notes?.trim() ? { notes: data.notes.trim() } : {}),
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast({ title: 'Vehicle added to your fleet' });
        navigate('/fleet');
      },
      onError: (err: any) => {
        toast({
          title:
            err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            'Could not add vehicle',
          variant: 'destructive',
        });
      },
    });
  };

  const loading = typesLoading || driversLoading;

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      <PageHeader
        title="Add Vehicle"
        description="Register your pickup, truck, or van with plate number and optional driver."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/fleet')}>
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={createMutation.isPending || loading}
            >
              {createMutation.isPending ? 'Saving…' : 'Save Vehicle'}
            </Button>
          </>
        }
      />

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Vehicle details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration / license plate</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. GJ-01-AB-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="typeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle type</FormLabel>
                      <FormControl>
                        <select className={selectClassName} {...field} disabled={typesLoading}>
                          <option value="">Select type…</option>
                          {(types || []).map((t: any) => (
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <select className={selectClassName} {...field}>
                          <option value="ACTIVE">Active</option>
                          <option value="MAINTENANCE">Maintenance</option>
                          <option value="RETIRED">Retired</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Tata, Mahindra, Isuzu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Ace, Bolero Pickup" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1980}
                          max={2100}
                          placeholder="Optional"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? undefined : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel type</FormLabel>
                      <FormControl>
                        <select className={selectClassName} {...field} value={field.value || ''}>
                          <option value="">Optional</option>
                          <option value="Diesel">Diesel</option>
                          <option value="Petrol">Petrol</option>
                          <option value="CNG">CNG</option>
                          <option value="Electric">Electric</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity (people / load units)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Optional"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? undefined : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedDriverId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned driver</FormLabel>
                      <FormControl>
                        <select
                          className={selectClassName}
                          value={field.value || ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? e.target.value : undefined)
                          }
                          disabled={driversLoading}
                        >
                          <option value="">Unassigned</option>
                          {(drivers || []).map((d: any) => (
                            <option key={d.id} value={d.id}>
                              {d.user?.name || d.licenseNumber}
                              {d.contactNumber ? ` — ${d.contactNumber}` : ''}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                      {!driversLoading && !(drivers || []).length && (
                        <p className="text-sm text-muted-foreground">
                          No drivers yet. You can still save the vehicle and assign a driver later.
                        </p>
                      )}
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
                      <Input
                        placeholder="e.g. Company pickup — used for event setup"
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
        </form>
      </Form>
    </div>
  );
};
