import { useState } from 'react';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from './api/notificationApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Bell, Check, Trash2, ShieldAlert, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { NotificationResponseDTO } from '@decorflow/shared';

export function NotificationCenter() {
  const [page] = useState(1);
  const { data, isLoading } = useNotifications(page, 50);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotif = useDeleteNotification();

  const { data: prefs } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();

  const notifications = data?.data || [];
  const unreadCount = data?.meta?.unreadCount || 0;

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <ShieldAlert className="h-5 w-5 text-destructive" />;
      case 'HIGH':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'NORMAL':
        return <Info className="h-5 w-5 text-primary" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'border-l-destructive';
      case 'HIGH':
        return 'border-l-orange-500';
      case 'NORMAL':
        return 'border-l-primary';
      default:
        return 'border-l-transparent';
    }
  };

  return (
    <div className="container py-8 max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communication Center</h1>
          <p className="text-muted-foreground">
            Manage your notifications and activity preferences.
          </p>
        </div>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="inbox">
            Inbox{' '}
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <CardTitle className="text-lg">Recent Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark all read
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground animate-pulse">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium">All caught up!</h3>
                  <p>You have no new notifications.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notif: NotificationResponseDTO) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'p-4 flex gap-4 transition-colors hover:bg-accent/50 group border-l-4',
                        getPriorityColor(notif.priority),
                        !notif.isRead ? 'bg-primary/5' : 'bg-transparent'
                      )}
                    >
                      <div className="mt-1">{getPriorityIcon(notif.priority)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium leading-none">{notif.title}</h4>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(notif.createdAt), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{notif.message}</p>
                        {notif.module && (
                          <Badge variant="outline" className="mt-2 text-[10px] uppercase">
                            {notif.module}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.isRead && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => markRead.mutate(notif.id)}
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteNotif.mutate(notif.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how and when you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {prefs ? (
                <>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="in-app" className="flex flex-col space-y-1">
                      <span>In-App Notifications</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Receive notifications within the dashboard.
                      </span>
                    </Label>
                    <Switch
                      id="in-app"
                      checked={prefs.inAppEnabled}
                      onCheckedChange={(c) => updatePrefs.mutate({ inAppEnabled: c })}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="email" className="flex flex-col space-y-1">
                      <span>Email Notifications</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Receive daily summaries and urgent alerts via email.
                      </span>
                    </Label>
                    <Switch
                      id="email"
                      checked={prefs.emailEnabled}
                      onCheckedChange={(c) => updatePrefs.mutate({ emailEnabled: c })}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="sms" className="flex flex-col space-y-1">
                      <span>SMS Notifications</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Receive critical alerts via SMS (charges may apply).
                      </span>
                    </Label>
                    <Switch
                      id="sms"
                      checked={prefs.smsEnabled}
                      onCheckedChange={(c) => updatePrefs.mutate({ smsEnabled: c })}
                    />
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <Label>Minimum Priority Threshold</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Only receive notifications matching or exceeding this priority.
                    </p>
                    <Select
                      value={prefs.priorityThreshold}
                      onValueChange={(val: any) => updatePrefs.mutate({ priorityThreshold: val })}
                    >
                      <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low (All)</SelectItem>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="animate-pulse">Loading preferences...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
