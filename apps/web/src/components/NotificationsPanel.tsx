import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Icon } from './ui/icon';
import { ScrollArea } from './ui/scroll-area';

const mockNotifications = [
  {
    id: '1',
    title: 'New Customer Lead',
    message: 'John Doe from Acme Corp requested a quote.',
    time: '2m ago',
    unread: true,
  },
  {
    id: '2',
    title: 'Inventory Alert',
    message: 'Chiavari Chairs are running low on stock.',
    time: '1h ago',
    unread: true,
  },
  {
    id: '3',
    title: 'Payment Received',
    message: 'Invoice #INV-2026-001 has been paid in full.',
    time: '3h ago',
    unread: false,
  },
];

export function NotificationsPanel() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Icon name="Bell" className="h-5 w-5" />
          <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
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
          >
            Mark all as read
          </Button>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="flex flex-col">
            {mockNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex flex-col gap-1 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${notification.unread ? 'bg-primary/5' : ''}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <span
                    className={`text-sm font-medium ${notification.unread ? 'text-primary' : ''}`}
                  >
                    {notification.title}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                    {notification.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-2 border-t">
          <Button variant="ghost" className="w-full text-xs" size="sm">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
