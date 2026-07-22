import * as LucideIcons from 'lucide-react';

export type IconName = keyof typeof LucideIcons;

export interface NavItem {
  label: string;
  path: string;
  icon: IconName;
  permissions?: string[]; // If empty, anyone logged in can see it
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigationConfig: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' }],
  },
  {
    label: 'CRM',
    items: [
      { label: 'Customers', path: '/customers', icon: 'Users', permissions: ['customers:read'] },
      { label: 'Events', path: '/events', icon: 'Calendar', permissions: ['event.view'] },
      {
        label: 'Quotations',
        path: '/finance/quotations',
        icon: 'FileText',
        permissions: ['invoice.view'],
      },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { label: 'Catalog', path: '/inventory', icon: 'Package', permissions: ['inventory.view'] },
      // TODO(Step 5 Path B): Warehouses + Reservations hidden from nav until warehouse/reservations
      // backend exists. Routes/pages remain at /warehouse and /inventory/reservations — re-add here:
      // { label: 'Warehouses', path: '/warehouse', icon: 'Warehouse', permissions: ['inventory.view'] },
      // { label: 'Reservations', path: '/inventory/reservations', icon: 'CalendarClock', permissions: ['inventory.view'] },
      { label: 'Packing', path: '/packing', icon: 'BoxSelect', permissions: ['packing.view'] },
      { label: 'Cleaning', path: '/cleaning', icon: 'Sparkles', permissions: ['inventory.view'] },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Fleet', path: '/fleet', icon: 'Truck', permissions: ['vehicle.view'] },
      {
        label: 'Employees',
        path: '/workforce',
        icon: 'UsersRound',
        permissions: ['employee.view'],
      },
      {
        label: 'Procurement',
        path: '/procurement',
        icon: 'ShoppingCart',
        permissions: ['vendor.view'],
      },
    ],
  },
  {
    label: 'Financials',
    items: [
      { label: 'Finance', path: '/finance', icon: 'Banknote', permissions: ['finance.view'] },
      { label: 'Reports', path: '/reports', icon: 'BarChart3', permissions: ['reports.view'] },
    ],
  },
  {
    label: 'Settings',
    items: [
      {
        label: 'Organization',
        path: '/settings/organization',
        icon: 'Building2',
        permissions: ['organization.settings'],
      },
      {
        label: 'Users',
        path: '/settings/users',
        icon: 'Users',
        permissions: ['organization.settings'],
      },
      {
        label: 'Subscription',
        path: '/settings/subscription',
        icon: 'CreditCard',
        permissions: ['organization.settings'],
      },
    ],
  },
];
