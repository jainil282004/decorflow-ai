import { useParams, useNavigate } from 'react-router-dom';
import { useEvent, useDeleteEvent, useRestoreEvent } from './api/eventsApi';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/ui/button';
import { Icon } from '../../components/ui/icon';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { AlertCircle } from 'lucide-react';

export const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useEvent(id as string);
  const deleteMutation = useDeleteEvent();
  const restoreMutation = useRestoreEvent();

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[280px]" />
          <Skeleton className="h-[280px]" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-12 px-4">
        <EmptyState
          title="Could not load event"
          description="Something went wrong while fetching this event. Check your connection and try again."
          icon={<AlertCircle className="w-12 h-12 text-destructive/60" />}
          actionLabel="Try again"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="pt-12 px-4">
        <EmptyState
          title="Event not found"
          description="This event does not exist or may have been removed."
          actionLabel="Back to Events"
          onAction={() => navigate('/events')}
        />
      </div>
    );
  }

  const event = data.data;
  const isArchived = !!event.deletedAt;

  const handleArchiveToggle = async () => {
    if (isArchived) {
      await restoreMutation.mutateAsync(event.id);
    } else {
      if (confirm('Are you sure you want to archive this event?')) {
        await deleteMutation.mutateAsync(event.id);
      }
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        title={event.title}
        description={
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{event.type?.name}</Badge>
            <Badge variant={isArchived ? 'destructive' : 'default'}>{event.status?.name}</Badge>
            {isArchived && <Badge variant="destructive">Archived</Badge>}
          </div>
        }
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/events')}>
              Back
            </Button>
            <Button variant="outline" onClick={() => navigate(`/events/${event.id}/edit`)}>
              <Icon name="Pencil" className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant={isArchived ? 'default' : 'destructive'} onClick={handleArchiveToggle}>
              <Icon name={isArchived ? 'RefreshCw' : 'Archive'} className="mr-2 h-4 w-4" />
              {isArchived ? 'Restore' : 'Archive'}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* General Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Customer</span>
              <p>{event.customer?.name || '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Theme</span>
              <p>{event.theme || '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Priority</span>
              <p>{event.priority || '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Guest Count</span>
              <p>{event.guestCount || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="md:col-span-2 lg:col-span-1 lg:row-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Event Day Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 border-l border-border space-y-8 pb-4 mt-2">
              <div className="relative">
                <div className="absolute -left-[29px] bg-background border border-border w-2.5 h-2.5 rounded-full mt-2" />
                <h4 className="font-serif text-xl tracking-tight text-foreground">
                  {event.setupDate ? format(new Date(event.setupDate), 'h:mm a') : '08:00 AM'}
                </h4>
                <p className="font-medium text-foreground text-sm mt-1">Crew Arrival & Setup</p>
                <p className="text-sm text-muted-foreground font-light">
                  Mandap install and structural rigging
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-[29px] bg-background border border-border w-2.5 h-2.5 rounded-full mt-2" />
                <h4 className="font-serif text-xl tracking-tight text-foreground">11:00 AM</h4>
                <p className="font-medium text-foreground text-sm mt-1">Floral & Lighting Check</p>
                <p className="text-sm text-muted-foreground font-light">
                  Final touches before handover
                </p>
              </div>
              <div className="relative">
                <div
                  className="absolute -left-[31px] bg-primary w-3.5 h-3.5 rounded-full mt-2"
                  style={{ boxShadow: '0 0 0 4px rgba(176, 141, 87, 0.15)' }}
                />
                <h4 className="font-serif text-xl tracking-tight text-primary">
                  {event.startTime || '02:00 PM'}
                </h4>
                <p className="font-medium text-foreground text-sm mt-1">Event Start</p>
                <p className="text-sm text-muted-foreground font-light">Guests arrive</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[29px] bg-background border border-border w-2.5 h-2.5 rounded-full mt-2" />
                <h4 className="font-serif text-xl tracking-tight text-foreground">
                  {event.endTime || '11:00 PM'}
                </h4>
                <p className="font-medium text-foreground text-sm mt-1">Event Concludes</p>
                <p className="text-sm text-muted-foreground font-light">Guest departure</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[29px] bg-background border border-border w-2.5 h-2.5 rounded-full mt-2" />
                <h4 className="font-serif text-xl tracking-tight text-foreground">
                  {event.dismantleDate
                    ? format(new Date(event.dismantleDate), 'h:mm a')
                    : '11:30 PM'}
                </h4>
                <p className="font-medium text-foreground text-sm mt-1">Breakdown</p>
                <p className="text-sm text-muted-foreground font-light">Strike and load out</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financials */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Budget</span>
              <p>{event.budget ? `$${event.budget.toFixed(2)}` : '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Expected Revenue</span>
              <p>{event.expectedRevenue ? `$${event.expectedRevenue.toFixed(2)}` : '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Total Quoted Amount</span>
              <p>${event.totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Deposit Paid</span>
              <p>${event.depositAmount.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Venue Info */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Venue Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {event.venue ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Venue Name</span>
                  <p>{event.venue.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Type</span>
                  <p>{event.venue.type || '-'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Address</span>
                  <p>{event.venue.address}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Setting</span>
                  <p>{event.venue.indoorOutdoor || '-'}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-sm font-medium text-muted-foreground">Parking Notes</span>
                  <p>{event.venue.parkingNotes || '-'}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Site Instructions
                  </span>
                  <p>{event.venue.siteInstructions || '-'}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No venue specified.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
