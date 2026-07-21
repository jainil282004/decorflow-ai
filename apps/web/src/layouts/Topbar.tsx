import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Icon } from '../components/ui/icon';
import { ThemeToggle } from '../components/ThemeToggle';
import { GlobalSearch } from '../components/GlobalSearch';
import { NotificationsPanel } from '../components/NotificationsPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useAuthStore } from '../stores/authStore';
import { navigationConfig } from '../config/navigation';

interface TopbarProps {
  setMobileOpen: (open: boolean) => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function Topbar({ setMobileOpen }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  // Generate basic breadcrumb text based on current route
  const currentNav = navigationConfig
    .flatMap((g) => g.items)
    .find((item) => location.pathname.startsWith(item.path));

  const greeting = getGreeting();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur-lg backdrop-saturate-150 px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          onClick={() => setMobileOpen(true)}
        >
          <Icon name="Menu" className="h-5 w-5" />
        </Button>

        {/* Desktop: Greeting + Breadcrumb */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Icon name="Home" className="h-4 w-4" />
            </button>
            {currentNav && (
              <>
                <Icon name="ChevronRight" className="h-3.5 w-3.5 text-border" />
                <span className="font-medium text-foreground">{currentNav.label}</span>
              </>
            )}
          </div>
        </div>

        {/* Mobile: Compact greeting */}
        <div className="md:hidden">
          <span className="text-sm font-medium text-foreground">
            {greeting}
            {user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="w-full sm:w-auto">
          <GlobalSearch />
        </div>

        <NotificationsPanel />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full shrink-0 ml-1">
              <div className="relative">
                <Avatar className="h-8 w-8 ring-2 ring-border ring-offset-1 ring-offset-background transition-all hover:ring-primary/30">
                  <AvatarImage src={user?.avatarUrl || ''} alt={user?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-background" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 p-1.5">
            <DropdownMenuLabel className="font-normal px-3 py-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatarUrl || ''} alt={user?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  <p className="text-sm font-semibold leading-none truncate">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate('/profile')}
              className="rounded-md px-3 py-2 cursor-pointer"
            >
              <Icon name="User" className="mr-2.5 h-4 w-4 text-muted-foreground" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/settings/organization')}
              className="rounded-md px-3 py-2 cursor-pointer"
            >
              <Icon name="Settings" className="mr-2.5 h-4 w-4 text-muted-foreground" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/settings/subscription')}
              className="rounded-md px-3 py-2 cursor-pointer"
            >
              <Icon name="CreditCard" className="mr-2.5 h-4 w-4 text-muted-foreground" />
              Subscription
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="rounded-md px-3 py-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5"
            >
              <Icon name="LogOut" className="mr-2.5 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
