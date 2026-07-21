import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/ui/button';
import { Plus, Truck, UserCircle, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { format } from 'date-fns';
import { useVehicles, useDrivers, useTrips } from './api/logisticsApi';

export const FleetDashboard = () => {
  const navigate = useNavigate();
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { data: drivers, isLoading: driversLoading } = useDrivers();
  const { data: trips, isLoading: tripsLoading } = useTrips();
  const [activeTab, setActiveTab] = useState('trips');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Fleet & Dispatch"
        description="Manage your vehicles, drivers, and active dispatch trips."
      >
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/fleet/vehicles/new')}>
            <Plus className="w-4 h-4 mr-2" /> Add Vehicle
          </Button>
          <Button onClick={() => navigate('/fleet/trips/new')}>
            <Plus className="w-4 h-4 mr-2" /> Schedule Trip
          </Button>
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-background border">
          <TabsTrigger value="trips" className="gap-2">
            <MapPin className="w-4 h-4" /> Active Trips
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="gap-2">
            <Truck className="w-4 h-4" /> Vehicles
          </TabsTrigger>
          <TabsTrigger value="drivers" className="gap-2">
            <UserCircle className="w-4 h-4" /> Drivers
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarIcon className="w-4 h-4" /> Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trips" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Dispatch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif text-amber-600">
                  {trips?.filter((t: any) => t.status === 'PENDING').length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  On Route
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif text-blue-600">
                  {trips?.filter((t: any) => t.status === 'DISPATCHED').length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif text-emerald-600">
                  {trips?.filter((t: any) => t.status === 'COMPLETED').length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            {tripsLoading ? (
              <div className="p-8 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : trips?.length === 0 ? (
              <EmptyState
                title="No active trips"
                description="There are no active dispatch trips at the moment."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Vehicle & Driver</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.map((trip: any) => (
                    <TableRow
                      key={trip.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/fleet/trips/${trip.id}`)}
                    >
                      <TableCell className="font-medium">
                        {trip.event?.title || 'Unknown Event'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {trip.vehicle?.licensePlate} ({trip.vehicle?.make})
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {trip.driver?.user?.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {trip.plannedDeparture
                          ? format(new Date(trip.plannedDeparture), 'MMM d, h:mm a')
                          : '-'}
                      </TableCell>
                      <TableCell>{trip.destinationVenue?.name || 'Warehouse'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            trip.status === 'COMPLETED'
                              ? 'default'
                              : trip.status === 'DISPATCHED'
                                ? 'outline'
                                : 'secondary'
                          }
                          className={
                            trip.status === 'DISPATCHED' ? 'border-blue-500 text-blue-700' : ''
                          }
                        >
                          {trip.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/fleet/trips/${trip.id}`);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card>
            {vehiclesLoading ? (
              <div className="p-8 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : vehicles?.length === 0 ? (
              <EmptyState
                title="No vehicles"
                description="There are no vehicles in your fleet yet."
                actionLabel="Add Vehicle"
                onAction={() => navigate('/fleet/vehicles/new')}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Make & Model</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Assigned Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle: any) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.licensePlate}</TableCell>
                      <TableCell>
                        {vehicle.make} {vehicle.model}
                      </TableCell>
                      <TableCell>{vehicle.type?.name || '-'}</TableCell>
                      <TableCell>
                        {vehicle.assignedDriver ? (
                          vehicle.assignedDriver.user.name
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={vehicle.status === 'ACTIVE' ? 'default' : 'destructive'}>
                          {vehicle.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="drivers">
          <Card>
            {driversLoading ? (
              <div className="p-8 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : drivers?.length === 0 ? (
              <EmptyState title="No drivers" description="There are no drivers in your system." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>License No.</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((driver: any) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">{driver.user?.name}</TableCell>
                      <TableCell>{driver.licenseNumber}</TableCell>
                      <TableCell>{driver.contactNumber || driver.user?.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            driver.availabilityStatus === 'AVAILABLE'
                              ? 'default'
                              : driver.availabilityStatus === 'ON_TRIP'
                                ? 'outline'
                                : 'secondary'
                          }
                          className={
                            driver.availabilityStatus === 'ON_TRIP'
                              ? 'border-blue-500 text-blue-700'
                              : ''
                          }
                        >
                          {driver.availabilityStatus.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card className="p-12 text-center text-muted-foreground border-dashed">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground mb-1">Schedule View Coming Soon</h3>
            <p>
              The interactive calendar for tracking fleet usage across dates will be available in
              the next minor update.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
