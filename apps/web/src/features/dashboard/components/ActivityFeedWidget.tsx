import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Icon } from '../../../components/ui/icon';
import { activityFeed } from '../mockData';

export function ActivityFeedWidget() {
  const getIconForType = (type: string) => {
    switch (type) {
      case 'Customer':
        return 'UserPlus';
      case 'Event':
        return 'CalendarCheck';
      case 'Finance':
        return 'DollarSign';
      case 'Inventory':
        return 'PackageCheck';
      case 'Task':
        return 'CheckCircle2';
      default:
        return 'Activity';
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'Customer':
        return 'text-blue-500 bg-blue-500/10';
      case 'Event':
        return 'text-purple-500 bg-purple-500/10';
      case 'Finance':
        return 'text-emerald-500 bg-emerald-500/10';
      case 'Inventory':
        return 'text-amber-500 bg-amber-500/10';
      case 'Task':
        return 'text-zinc-500 bg-zinc-500/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="Activity" className="h-5 w-5 text-muted-foreground" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityFeed.map((activity, index) => {
            const isLast = index === activityFeed.length - 1;

            return (
              <div key={activity.id} className="relative flex gap-4">
                {!isLast && (
                  <div className="absolute left-4 top-10 bottom-[-16px] w-px bg-border" />
                )}

                <div
                  className={`relative z-10 flex shrink-0 items-center justify-center h-8 w-8 rounded-full ${getColorForType(activity.type)}`}
                >
                  <Icon name={getIconForType(activity.type) as any} className="h-4 w-4" />
                </div>

                <div className="flex flex-col pt-1 pb-2">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{activity.time}</span>
                    <span>•</span>
                    <span>{activity.user}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
