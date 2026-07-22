import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Icon } from '../../../components/ui/icon';
import { cn } from '../../../lib/utils';
import { useEvents } from '../../events/api/eventsApi';
import type { EventResponseDTO } from '@decorflow/shared';

const statusConfig: Record<string, { dot: string; bg: string; text: string }> = {
  'In Progress': { dot: 'status-dot-active', bg: 'bg-success/10', text: 'text-success' },
  'Pending Setup': { dot: 'status-dot-warning', bg: 'bg-warning/10', text: 'text-warning' },
  Confirmed: { dot: 'status-dot-active', bg: 'bg-success/10', text: 'text-success' },
  Planning: { dot: 'status-dot-neutral', bg: 'bg-muted', text: 'text-muted-foreground' },
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function isEventActiveToday(event: EventResponseDTO, today = new Date()) {
  const start = startOfDay(new Date(event.startDate));
  const end = endOfDay(new Date(event.endDate));
  const t0 = startOfDay(today);
  const t1 = endOfDay(today);
  return start <= t1 && end >= t0;
}

function isUpcoming(event: EventResponseDTO, today = new Date()) {
  return startOfDay(new Date(event.startDate)) > endOfDay(today);
}

function formatEventTime(event: EventResponseDTO) {
  if (event.startTime) return event.startTime;
  return new Date(event.startDate).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatUpcomingDate(iso: string) {
  const d = new Date(iso);
  return {
    month: d.toLocaleString('en-US', { month: 'short' }),
    day: String(d.getDate()),
  };
}

function statusStyle(name?: string | null) {
  if (name && statusConfig[name]) return statusConfig[name];
  return statusConfig['Planning'];
}

export function EventsWidget() {
  const { data: eventsResult, isLoading } = useEvents(1, 100, '');
  const events = eventsResult?.data ?? [];

  const todayEvents = events.filter((e) => isEventActiveToday(e));
  const upcomingEvents = events
    .filter((e) => isUpcoming(e))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 8);

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
            <Icon name="CalendarDays" className="h-4 w-4 text-info stroke-[1.5]" />
          </div>
          Event Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 h-9">
            <TabsTrigger value="today" className="text-xs">
              Today
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="text-xs">
              Upcoming
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-0 mt-0">
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-4">Loading events…</p>
            ) : todayEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No events scheduled for today.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />

                {todayEvents.map((event, idx) => {
                  const statusName = event.status?.name || 'Planning';
                  const status = statusStyle(statusName);
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        'flex items-start gap-4 py-3.5 relative group cursor-pointer',
                        'hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors',
                        idx < todayEvents.length - 1 && 'border-b border-border/50'
                      )}
                    >
                      <div className="relative z-10 mt-1.5">
                        <div
                          className={cn(
                            'w-[22px] h-[22px] rounded-full border-2 border-background flex items-center justify-center',
                            status.bg
                          )}
                        >
                          <div className={cn('status-dot !w-[6px] !h-[6px]', status.dot)} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {event.title}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Icon name="MapPin" className="h-3 w-3 shrink-0" />
                            {event.venue?.name || 'No venue'}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-sm font-semibold tabular-nums">
                            {formatEventTime(event)}
                          </span>
                          <span
                            className={cn(
                              'text-[10px] uppercase font-medium px-2 py-0.5 rounded-full',
                              status.bg,
                              status.text
                            )}
                          >
                            {statusName}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-0 mt-0">
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-4">Loading events…</p>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No upcoming events.</p>
            ) : (
              upcomingEvents.map((event, idx) => {
                const statusName = event.status?.name || 'Planning';
                const status = statusStyle(statusName);
                const dateParts = formatUpcomingDate(event.startDate);
                return (
                  <div
                    key={event.id}
                    className={cn(
                      'flex items-center justify-between py-3.5 group cursor-pointer',
                      'hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors',
                      idx < upcomingEvents.length - 1 && 'border-b border-border/50'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-muted/50 flex flex-col items-center justify-center shrink-0 border border-border/50">
                        <span className="text-[10px] text-muted-foreground uppercase leading-none">
                          {dateParts.month}
                        </span>
                        <span className="text-sm font-bold leading-none mt-0.5">
                          {dateParts.day}
                        </span>
                      </div>
                      <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {event.title}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] uppercase font-medium px-2 py-0.5 rounded-full shrink-0',
                        status.bg,
                        status.text
                      )}
                    >
                      {statusName}
                    </span>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
