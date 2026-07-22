import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '../components/ui/icon';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../stores/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { cn } from '../lib/utils';
import { ThemeToggle } from '../components/ThemeToggle';
import { useOrganization, useBranches } from '../features/saas/api/saasApi';
import { NotificationBell } from '../features/notifications/components/NotificationBell';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

export const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: org } = useOrganization();
  const { data: branches } = useBranches();
  const [activeBranch, setActiveBranch] = useState<string>('all');

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const navItems = [
    { icon: 'LayoutDashboard', label: 'Dashboard', path: '/' },
    { icon: 'Users', label: 'Customers', path: '/customers' },
    { icon: 'Package', label: 'Inventory', path: '/inventory' },
    // TODO(Step 5 Path B): Warehouse hidden until warehouse backend exists — route /warehouse remains.
    // { icon: 'Warehouse', label: 'Warehouse', path: '/warehouse' },
    { icon: 'Calendar', label: 'Events', path: '/events' },
    { icon: 'Truck', label: 'Vehicles', path: '/vehicles' },
    { icon: 'UsersRound', label: 'Employees', path: '/employees' },
    { icon: 'Banknote', label: 'Finance', path: '/finance' },
  ] as const;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-300 ease-in-out md:static md:translate-x-0',
          !isSidebarOpen && '-translate-x-full md:w-20'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2 text-primary font-bold overflow-hidden whitespace-nowrap">
            {org?.logoUrl ? (
              <img src={org.logoUrl} alt="Logo" className="h-6 w-auto shrink-0" />
            ) : (
              <img
                src="/logo-mark.png"
                alt="DecorFlow Logo"
                className="h-6 w-6 shrink-0 object-contain"
              />
            )}
            {isSidebarOpen && (
              <span className="text-xl tracking-tight">{org?.name || 'DecorFlow'}</span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                className={cn('justify-start', !isSidebarOpen && 'md:justify-center px-0')}
                onClick={() => navigate(item.path)}
              >
                <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                {isSidebarOpen && <span className="ml-3">{item.label}</span>}
              </Button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:px-6">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <Icon name="Menu" className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>

          <div className="flex-1" />

          {branches && branches.length > 0 && (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Branch:</span>
              <Select value={activeBranch} onValueChange={setActiveBranch}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Global (All Branches)</SelectItem>
                  {branches.map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <NotificationBell />
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl || ''} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <Icon name="User" className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings/organization')}>
                <Icon name="Settings" className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <Icon name="LogOut" className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
