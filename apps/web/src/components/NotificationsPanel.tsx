import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Icon } from './ui/icon';
import { ScrollArea } from './ui/scroll-area';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '../features/notifications/api/notificationApi';
import type { NotificationResponseDTO } from '@decorflow/shared';

export function NotificationsPanel() {
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications(1, 10);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.data || [];
  const unreadCount = data?.meta?.unreadCount || 0;

  const handleNotificationClick = (notification: NotificationResponseDTO) => {
    if (!notification.isRead) {
      markRead.mutate(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Icon name="Bell" className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-sm">Notifications</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-xs text-muted-foreground"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending || unreadCount === 0}
          >
            Mark all as read
          </Button>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="flex flex-col">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-muted-foreground">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex flex-col gap-1 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-primary/5' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between items-start gap-4">
                    <span
                      className={`text-sm font-medium ${!notification.isRead ? 'text-primary' : ''}`}
                    >
                      {notification.title}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            className="w-full text-xs"
            size="sm"
            onClick={() => navigate('/dashboard/notifications')}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
