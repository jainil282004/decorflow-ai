import { useGlobalActivityFeed } from '../api/activityApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Activity } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ActivityLogResponseDTO } from '@decorflow/shared';

export function GlobalFeedWidget() {
  const { data, isLoading } = useGlobalActivityFeed(1, 20);

  const feed = data?.data || [];

  return (
    <Card className="col-span-full xl:col-span-4 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Activity Feed</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground animate-pulse">
              Loading feed...
            </div>
          ) : feed.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No recent activity.</div>
          ) : (
            <div className="flex flex-col">
              {feed.map((item: ActivityLogResponseDTO & { user: any }) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 border-b last:border-0 hover:bg-accent/50 transition-colors"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={item.user?.avatarUrl || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {item.user?.name ? item.user.name.substring(0, 2).toUpperCase() : 'SYS'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 space-y-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium leading-none truncate">
                        {item.user?.name || 'System'}
                        <span className="font-normal text-muted-foreground ml-1">
                          {item.action.toLowerCase()} a {item.entityType.toLowerCase()}
                        </span>
                      </p>
                      <time className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </time>
                    </div>
                    {item.details && (
                      <p className="text-xs text-muted-foreground truncate">{item.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
