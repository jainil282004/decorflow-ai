import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { format } from 'date-fns';
import { useTrip, useDispatchTrip, useCompleteTrip } from './api/logisticsApi';
import {
  ArrowLeft,
  CheckSquare,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  UserCircle,
} from 'lucide-react';
import { Checkbox } from '../../components/ui/checkbox';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { useToast } from '../../hooks/use-toast';

export const TripDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: trip, isLoading } = useTrip(id as string);
  const dispatchMutation = useDispatchTrip();
  const completeMutation = useCompleteTrip();

  // Dispatch Checklists
  const [checkVehicle, setCheckVehicle] = useState(false);
  const [checkFuel, setCheckFuel] = useState(false);
  const [checkDocs, setCheckDocs] = useState(false);
  const [checkLoad, setCheckLoad] = useState(false);
  const [checkSafety, setCheckSafety] = useState(false);

  // Return Checklists
  const [postVehicle, setPostVehicle] = useState(false);
  const [postDamage, setPostDamage] = useState(false);
  const [postFuel, setPostFuel] = useState(false);
  const [postOdo, setPostOdo] = useState(false);

  if (isLoading)
    return (
      <div className="space-y-8 max-w-5xl mx-auto p-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] md:col-span-2" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  if (!trip)
    return (
      <div className="pt-12">
        <EmptyState
          title="Trip Not Found"
          description="The trip you are looking for does not exist."
          actionLabel="Back to Fleet"
          onAction={() => navigate('/fleet')}
        />
      </div>
    );

  const handleDispatch = async () => {
    if (!checkVehicle || !checkFuel || !checkDocs || !checkLoad || !checkSafety) {
      toast({
        title: 'Checklist incomplete',
        description: 'Please complete all pre-dispatch checks.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await dispatchMutation.mutateAsync({
        id: trip.id,
        data: {
          actualDeparture: new Date().toISOString(),
          checkVehicleInspection: true,
          checkFuel: true,
          checkDocuments: true,
          checkLoadVerification: true,
          checkSafetyEquipment: true,
        },
      });
      toast({ title: 'Trip dispatched successfully!' });
    } catch (e) {
      toast({ title: 'Error dispatching trip', variant: 'destructive' });
    }
  };

  const handleComplete = async () => {
    if (!postVehicle || !postDamage || !postFuel || !postOdo) {
      toast({
        title: 'Checklist incomplete',
        description: 'Please complete all post-return checks.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await completeMutation.mutateAsync({
        id: trip.id,
        data: {
          actualArrival: new Date().toISOString(),
          distance: 25, // Mocked distance
          postVehicleInspection: true,
          postDamageReport: true,
          postFuelLog: true,
          postOdometerUpdate: true,
        },
      });
      toast({ title: 'Trip completed successfully!' });
    } catch (e) {
      toast({ title: 'Error completing trip', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/fleet')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-serif">Trip Details</h1>
          <p className="text-muted-foreground">Event: {trip.event?.title}</p>
        </div>
        <Badge
          variant={
            trip.status === 'COMPLETED'
              ? 'default'
              : trip.status === 'DISPATCHED'
                ? 'outline'
                : 'secondary'
          }
          className="text-sm px-4 py-1"
        >
          {trip.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Journey Path</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-muted p-2 rounded-full">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Pickup Location</h4>
                  <p className="text-lg">{trip.pickupWarehouse?.name || 'Main Warehouse'}</p>
                  <p className="text-sm text-muted-foreground">
                    {trip.plannedDeparture
                      ? format(new Date(trip.plannedDeparture), 'PPP p')
                      : 'Unscheduled'}
                  </p>
                </div>
              </div>
              <div className="pl-6 border-l-2 border-dashed ml-3 h-8 -my-2 border-border" />
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Destination</h4>
                  <p className="text-lg">{trip.destinationVenue?.name || 'Event Venue'}</p>
                  <p className="text-sm text-muted-foreground">
                    {trip.plannedArrival
                      ? format(new Date(trip.plannedArrival), 'PPP p')
                      : 'Unscheduled'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {trip.status === 'PENDING' && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" /> Pre-Dispatch Checklist
                </CardTitle>
                <CardDescription>
                  All items must be verified by the dispatcher before the vehicle can leave.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    id: 'veh',
                    label: 'Vehicle Visual Inspection Passed',
                    state: checkVehicle,
                    set: setCheckVehicle,
                  },
                  {
                    id: 'fuel',
                    label: 'Fuel Levels Confirmed',
                    state: checkFuel,
                    set: setCheckFuel,
                  },
                  {
                    id: 'docs',
                    label: 'Driver Documents & Licenses Checked',
                    state: checkDocs,
                    set: setCheckDocs,
                  },
                  {
                    id: 'load',
                    label: 'Load Verification (Matches Packing List)',
                    state: checkLoad,
                    set: setCheckLoad,
                  },
                  {
                    id: 'safe',
                    label: 'Safety Equipment On Board',
                    state: checkSafety,
                    set: setCheckSafety,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-3 bg-white p-3 rounded-md border shadow-sm"
                  >
                    <Checkbox
                      id={item.id}
                      checked={item.state}
                      onCheckedChange={(val) => item.set(!!val)}
                    />
                    <label
                      htmlFor={item.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {item.label}
                    </label>
                  </div>
                ))}

                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={handleDispatch}
                  disabled={dispatchMutation.isPending}
                >
                  {dispatchMutation.isPending ? 'Dispatching...' : 'Confirm Dispatch'}
                </Button>
              </CardContent>
            </Card>
          )}

          {trip.status === 'DISPATCHED' && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" /> Post-Return Checklist
                </CardTitle>
                <CardDescription>
                  Verify vehicle condition and log mileage upon return.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    id: 'r-veh',
                    label: 'Return Vehicle Inspection Passed',
                    state: postVehicle,
                    set: setPostVehicle,
                  },
                  {
                    id: 'r-dam',
                    label: 'No New Damage Reported',
                    state: postDamage,
                    set: setPostDamage,
                  },
                  { id: 'r-fuel', label: 'Fuel Log Updated', state: postFuel, set: setPostFuel },
                  {
                    id: 'r-odo',
                    label: 'Odometer Reading Updated',
                    state: postOdo,
                    set: setPostOdo,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-3 bg-white p-3 rounded-md border shadow-sm"
                  >
                    <Checkbox
                      id={item.id}
                      checked={item.state}
                      onCheckedChange={(val) => item.set(!!val)}
                    />
                    <label
                      htmlFor={item.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {item.label}
                    </label>
                  </div>
                ))}

                <Button
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  onClick={handleComplete}
                  disabled={completeMutation.isPending}
                >
                  {completeMutation.isPending ? 'Completing...' : 'Confirm Completion'}
                </Button>
              </CardContent>
            </Card>
          )}

          {trip.status === 'COMPLETED' && (
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="flex flex-col items-center justify-center p-12 text-emerald-900">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                <h3 className="text-2xl font-serif">Trip Completed</h3>
                <p className="text-emerald-700 mt-2">All post-trip checks were verified.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4" /> Vehicle
                </h4>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">{trip.vehicle?.licensePlate}</p>
                  <p className="text-sm text-muted-foreground">
                    {trip.vehicle?.make} {trip.vehicle?.model}
                  </p>
                </div>
              </div>

              <div className="my-4 border-b border-border"></div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <UserCircle className="w-4 h-4" /> Driver
                </h4>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">{trip.driver?.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{trip.driver?.licenseNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audit Trail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Clock className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Trip Created</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(trip.createdAt), 'PP p')}
                  </p>
                </div>
              </div>

              {trip.actualDeparture && (
                <div className="flex gap-3">
                  <Truck className="w-4 h-4 mt-1 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Dispatched</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(trip.actualDeparture), 'PP p')}
                    </p>
                  </div>
                </div>
              )}

              {trip.actualArrival && (
                <div className="flex gap-3">
                  <CheckCircle2 className="w-4 h-4 mt-1 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium">Completed</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(trip.actualArrival), 'PP p')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
