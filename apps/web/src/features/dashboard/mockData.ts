export const summaryStats = {
  todayEvents: 12,
  activeEvents: 4,
  upcomingEvents: 48,
  monthlyRevenue: 145200,
  outstandingPayments: 32400,
  lowStockItems: 8,
  vehiclesOnRoute: 3,
  pendingTasks: 15,
};

export const eventSchedules = {
  today: [
    {
      id: '1',
      title: 'Smith Wedding',
      time: '09:00 AM',
      location: 'Grand Hotel',
      status: 'In Progress',
    },
    {
      id: '2',
      title: 'Corporate Gala',
      time: '02:00 PM',
      location: 'Convention Center',
      status: 'Pending Setup',
    },
    {
      id: '3',
      title: 'Birthday Bash',
      time: '06:00 PM',
      location: 'Sunset Beach',
      status: 'Pending Setup',
    },
  ],
  upcoming: [
    { id: '4', title: 'Johnson Anniversary', date: 'Oct 24', status: 'Confirmed' },
    { id: '5', title: 'Tech Conference 2026', date: 'Oct 26', status: 'Planning' },
  ],
};

export const operationalAlerts = {
  inventory: [
    { id: '1', item: 'Chiavari Chair (Gold)', currentStock: 12, minimumStock: 50 },
    { id: '2', item: 'LED Uplights', currentStock: 4, minimumStock: 20 },
  ],
  missingReturns: [
    {
      id: '1',
      event: 'Davis Wedding',
      items: '2x Velvet Sofa, 1x Chandelier',
      delay: '2 days late',
    },
  ],
  cleaningQueue: [{ id: '1', batch: 'Table Linens (White)', items: 120, status: 'In Queue' }],
};

export const financialTrends = [
  { name: 'Jan', revenue: 65000 },
  { name: 'Feb', revenue: 72000 },
  { name: 'Mar', revenue: 85000 },
  { name: 'Apr', revenue: 105000 },
  { name: 'May', revenue: 145000 },
  { name: 'Jun', revenue: 132000 },
];

export const teamStatus = {
  onDuty: 24,
  driversAssigned: 5,
  openTasks: 15,
  completedTasksToday: 42,
};

export const activityFeed = [
  {
    id: '1',
    type: 'Customer',
    message: 'New customer "Acme Corp" created',
    time: '10m ago',
    user: 'Sarah M.',
  },
  {
    id: '2',
    type: 'Event',
    message: 'Smith Wedding scheduled for Oct 28',
    time: '1h ago',
    user: 'John D.',
  },
  {
    id: '3',
    type: 'Finance',
    message: 'Payment of $5,000 received for INV-004',
    time: '2h ago',
    user: 'System',
  },
  {
    id: '4',
    type: 'Inventory',
    message: '100x Banquet Chairs returned to Warehouse',
    time: '3h ago',
    user: 'Mike R.',
  },
  {
    id: '5',
    type: 'Task',
    message: 'Setup completed for Corporate Gala',
    time: '4h ago',
    user: 'Team Alpha',
  },
];
