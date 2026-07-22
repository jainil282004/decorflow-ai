import { useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { PageHeader } from '../../components/PageHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { useToast } from '../../hooks/use-toast';
import { useCleaningJobs, useCleaningReminders, useUpdateCleaningJob } from './api/cleaningApi';
import { Sparkles, CheckCircle2, Play, AlertCircle, RefreshCw } from 'lucide-react';

const itemLabel = (job: any) => job.variant?.item?.name || job.variant?.name || 'Washable item';

const eventLabel = (job: any) =>
  job.inspectionItem?.returnInspection?.event?.title || 'Event return';

const formatWashDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
  if (isYesterday(date)) return `Yesterday, ${format(date, 'h:mm a')}`;
  return format(date, 'dd/MM/yyyy h:mm a');
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'PENDING':
      return (
        <Badge variant="outline" className="text-amber-700 border-amber-300">
          Not washed
        </Badge>
      );
    case 'CLEANING':
      return (
        <Badge className="bg-blue-100 text-blue-800 border-transparent hover:bg-blue-100">
          Washing
        </Badge>
      );
    case 'DONE':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-transparent hover:bg-emerald-100">
          Washed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const CleaningDashboard = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState('reminders');
  const updateJob = useUpdateCleaningJob();

  const {
    data: reminders,
    isLoading: remindersLoading,
    isError: remindersError,
    refetch: refetchReminders,
  } = useCleaningReminders();
  const {
    data: queueData,
    isLoading: queueLoading,
    isError: queueError,
    refetch: refetchQueue,
  } = useCleaningJobs(1, 50, {
    status: undefined,
  });
  const {
    data: historyData,
    isLoading: historyLoading,
    isError: historyError,
    refetch: refetchHistory,
  } = useCleaningJobs(1, 50, {
    recentlyWashed: true,
  });

  const queueJobs = (queueData?.data || []).filter(
    (job: any) => job.status === 'PENDING' || job.status === 'CLEANING'
  );
  const historyJobs = historyData?.data || [];

  const handleUpdate = async (id: string, status: 'CLEANING' | 'DONE') => {
    try {
      await updateJob.mutateAsync({ id, data: { status } });
      toast({
        title: status === 'DONE' ? 'Marked as washed' : 'Cleaning started',
      });
    } catch (error: any) {
      toast({
        title:
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          'Could not update cleaning job',
        variant: 'destructive',
      });
    }
  };

  const renderActions = (job: any) => (
    <div className="flex justify-end gap-2">
      {job.status === 'PENDING' && (
        <Button
          size="sm"
          variant="outline"
          disabled={updateJob.isPending}
          onClick={() => handleUpdate(job.id, 'CLEANING')}
        >
          <Play className="mr-1.5 h-3.5 w-3.5" />
          Start
        </Button>
      )}
      {(job.status === 'PENDING' || job.status === 'CLEANING') && (
        <Button
          size="sm"
          disabled={updateJob.isPending}
          onClick={() => handleUpdate(job.id, 'DONE')}
        >
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          Mark washed
        </Button>
      )}
    </div>
  );

  const renderTable = (
    jobs: any[],
    loading: boolean,
    error: boolean,
    onRetry: () => void,
    emptyTitle: string,
    emptyDesc: string
  ) => {
    if (loading) {
      return (
        <div className="space-y-3 p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-10 px-4">
          <EmptyState
            title="Could not load cleaning jobs"
            description="Something went wrong while fetching wash data. Check your connection and try again."
            icon={<AlertCircle className="w-12 h-12 text-destructive/60" />}
            actionLabel="Try again"
            onAction={() => onRetry()}
          />
        </div>
      );
    }

    if (!jobs.length) {
      return (
        <div className="py-10">
          <EmptyState
            title={emptyTitle}
            description={emptyDesc}
            icon={<Sparkles className="w-12 h-12 text-muted-foreground/50" />}
          />
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Event</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last wash</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job: any) => (
            <TableRow key={job.id}>
              <TableCell>
                <div className="font-medium">{itemLabel(job)}</div>
                {job.variant?.item?.requiresCleaning && (
                  <div className="text-xs text-muted-foreground">Washable material</div>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{eventLabel(job)}</TableCell>
              <TableCell className="text-right tabular-nums">{job.quantity}</TableCell>
              <TableCell className="text-sm">
                {job.dueDate ? format(new Date(job.dueDate), 'dd/MM/yyyy') : 'ASAP'}
                {job.isOverdue && job.status !== 'DONE' && (
                  <Badge variant="destructive" className="ml-2 text-[10px]">
                    Overdue
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status={job.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatWashDate(job.lastWashDate)}
                {job.washCount > 0 && <span className="ml-1 text-xs">({job.washCount}x)</span>}
              </TableCell>
              <TableCell>{renderActions(job)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cleaning"
        description="Wash reminders for cloths, carpets, chandarva, and other cleanable materials after events."
      />

      {(remindersError || queueError || historyError) && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          <span className="text-muted-foreground flex-1">Some cleaning data failed to load.</span>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => {
              if (remindersError) refetchReminders();
              if (queueError) refetchQueue();
              if (historyError) refetchHistory();
            }}
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Need washing</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {remindersLoading || remindersError ? '—' : (reminders?.length ?? 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Pending or in progress after event returns
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overdue</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {remindersLoading || remindersError
                ? '—'
                : (reminders?.filter((job: any) => job.isOverdue).length ?? 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Past due date — wash these first
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Recently washed</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {historyLoading || historyError ? '—' : historyJobs.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Check if something was washed yesterday
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="reminders" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Reminders
          </TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="history">Recently washed</TabsTrigger>
        </TabsList>

        <TabsContent value="reminders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Wash reminders</CardTitle>
              <CardDescription>
                Items that still need washing after an event. Mark washed when done so the team
                knows it was cleaned.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {renderTable(
                reminders || [],
                remindersLoading,
                remindersError,
                () => refetchReminders(),
                'No items need cleaning right now',
                'When packing returns mark items as Needs Cleaning, they show up here.'
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Cleaning queue</CardTitle>
              <CardDescription>All pending and in-progress wash jobs.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {renderTable(
                queueJobs,
                queueLoading,
                queueError,
                () => refetchQueue(),
                'No items need cleaning right now',
                'The wash queue is empty — nothing is waiting to be cleaned.'
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently washed</CardTitle>
              <CardDescription>
                Use last wash date to confirm whether cloths or carpets were cleaned yesterday.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {renderTable(
                historyJobs,
                historyLoading,
                historyError,
                () => refetchHistory(),
                'No wash history yet',
                'Completed washes will appear here with date and wash count.'
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
