import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { eventSchedules } from '../mockData';
import { Icon } from '../../../components/ui/icon';
import { cn } from '../../../lib/utils';

const statusConfig: Record<string, { dot: string; bg: string; text: string }> = {
  'In Progress': { dot: 'status-dot-active', bg: 'bg-success/10', text: 'text-success' },
  'Pending Setup': { dot: 'status-dot-warning', bg: 'bg-warning/10', text: 'text-warning' },
  Confirmed: { dot: 'status-dot-active', bg: 'bg-success/10', text: 'text-success' },
  Planning: { dot: 'status-dot-neutral', bg: 'bg-muted', text: 'text-muted-foreground' },
};

export function EventsWidget() {
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
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />

              {eventSchedules.today.map((event, idx) => {
                const status = statusConfig[event.status] || statusConfig['Planning'];
                return (
                  <div
                    key={event.id}
                    className={cn(
                      'flex items-start gap-4 py-3.5 relative group cursor-pointer',
                      'hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors',
                      idx < eventSchedules.today.length - 1 && 'border-b border-border/50'
                    )}
                  >
                    {/* Timeline dot */}
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
                          {event.location}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-sm font-semibold tabular-nums">{event.time}</span>
                        <span
                          className={cn(
                            'text-[10px] uppercase font-medium px-2 py-0.5 rounded-full',
                            status.bg,
                            status.text
                          )}
                        >
                          {event.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-0 mt-0">
            {eventSchedules.upcoming.map((event, idx) => {
              const status = statusConfig[event.status] || statusConfig['Planning'];
              return (
                <div
                  key={event.id}
                  className={cn(
                    'flex items-center justify-between py-3.5 group cursor-pointer',
                    'hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors',
                    idx < eventSchedules.upcoming.length - 1 && 'border-b border-border/50'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-muted/50 flex flex-col items-center justify-center shrink-0 border border-border/50">
                      <span className="text-[10px] text-muted-foreground uppercase leading-none">
                        {event.date.split(' ')[0]}
                      </span>
                      <span className="text-sm font-bold leading-none mt-0.5">
                        {event.date.split(' ')[1]}
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
                    {event.status}
                  </span>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
