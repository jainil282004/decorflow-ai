import { Outlet, NavLink } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Icon } from '../components/ui/icon';
import { cn } from '../lib/utils';

export const SettingsLayout = () => {
  const settingsNavItems = [
    { label: 'General', path: '/settings', icon: 'Settings' },
    { label: 'Company Profile', path: '/settings/company', icon: 'Building' },
    { label: 'Security', path: '/settings/security', icon: 'Shield' },
    { label: 'Roles & Permissions', path: '/settings/roles', icon: 'Key' },
    { label: 'Billing', path: '/settings/billing', icon: 'CreditCard' },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account settings and set preferences."
      />

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {settingsNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/settings'}
                className={({ isActive }) =>
                  cn(
                    'justify-start hover:bg-muted/50 rounded-md px-3 py-2 flex items-center text-sm font-medium transition-colors',
                    isActive ? 'bg-muted text-primary' : 'text-muted-foreground'
                  )
                }
              >
                <Icon name={item.icon} className="mr-2 h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
