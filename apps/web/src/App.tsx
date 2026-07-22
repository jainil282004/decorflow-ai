import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PermissionRoute } from './routes/PermissionRoute';
import { AuthLayout } from './layouts/AuthLayout';
import { AppShell } from './layouts/AppShell';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import { PageLoader } from './components/PageLoader';

// Auth Pages (Keep regular imports for critical auth flow, or lazy load if preferred. Let's lazy load them too)
const LoginPage = React.lazy(() =>
  import('./features/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const ForgotPasswordPage = React.lazy(() =>
  import('./features/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const ResetPasswordPage = React.lazy(() =>
  import('./features/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
);
const ProfilePage = React.lazy(() =>
  import('./features/auth/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const UnauthorizedPage = React.lazy(() =>
  import('./features/auth/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage }))
);

// Errors
const NotFoundPage = React.lazy(() =>
  import('./features/errors/ErrorPages').then((m) => ({ default: m.NotFoundPage }))
);
const ForbiddenPage = React.lazy(() =>
  import('./features/errors/ErrorPages').then((m) => ({ default: m.ForbiddenPage }))
);
const ServerErrorPage = React.lazy(() =>
  import('./features/errors/ErrorPages').then((m) => ({ default: m.ServerErrorPage }))
);

// Dashboard
const DashboardPage = React.lazy(() =>
  import('./features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const NotificationCenter = React.lazy(() =>
  import('./features/notifications/NotificationCenter').then((m) => ({
    default: m.NotificationCenter,
  }))
);

// Customers
const CustomerListPage = React.lazy(() =>
  import('./features/customers/CustomerListPage').then((m) => ({ default: m.CustomerListPage }))
);
const CustomerDetailsPage = React.lazy(() =>
  import('./features/customers/CustomerDetailsPage').then((m) => ({
    default: m.CustomerDetailsPage,
  }))
);
const CustomerFormPage = React.lazy(() =>
  import('./features/customers/CustomerFormPage').then((m) => ({ default: m.CustomerFormPage }))
);

// Events
const EventListPage = React.lazy(() =>
  import('./features/events/EventListPage').then((m) => ({ default: m.EventListPage }))
);
const EventDetailsPage = React.lazy(() =>
  import('./features/events/EventDetailsPage').then((m) => ({ default: m.EventDetailsPage }))
);
const EventFormPage = React.lazy(() =>
  import('./features/events/EventFormPage').then((m) => ({ default: m.EventFormPage }))
);

// Inventory
const InventoryListPage = React.lazy(() =>
  import('./features/inventory/InventoryListPage').then((m) => ({ default: m.InventoryListPage }))
);
const InventoryFormPage = React.lazy(() =>
  import('./features/inventory/InventoryFormPage').then((m) => ({ default: m.InventoryFormPage }))
);
const InventoryDetailsPage = React.lazy(() =>
  import('./features/inventory/InventoryDetailsPage').then((m) => ({
    default: m.InventoryDetailsPage,
  }))
);

// Packing
const PackingDashboard = React.lazy(() =>
  import('./features/packing/PackingDashboard').then((m) => ({ default: m.PackingDashboard }))
);
const PackingDetailsPage = React.lazy(() =>
  import('./features/packing/PackingDetailsPage').then((m) => ({ default: m.PackingDetailsPage }))
);
const PackingFormPage = React.lazy(() =>
  import('./features/packing/PackingFormPage').then((m) => ({ default: m.PackingFormPage }))
);
const CleaningDashboard = React.lazy(() =>
  import('./features/cleaning/CleaningDashboard').then((m) => ({ default: m.CleaningDashboard }))
);

// Fleet
const FleetDashboard = React.lazy(() =>
  import('./features/logistics/FleetDashboard').then((m) => ({ default: m.FleetDashboard }))
);
const VehicleFormPage = React.lazy(() =>
  import('./features/logistics/VehicleFormPage').then((m) => ({ default: m.VehicleFormPage }))
);
const TripDetailsPage = React.lazy(() =>
  import('./features/logistics/TripDetailsPage').then((m) => ({ default: m.TripDetailsPage }))
);

// Workforce
const WorkforceDashboard = React.lazy(() =>
  import('./features/workforce/WorkforceDashboard').then((m) => ({ default: m.WorkforceDashboard }))
);
const EmployeeFormPage = React.lazy(() =>
  import('./features/workforce/EmployeeFormPage').then((m) => ({ default: m.EmployeeFormPage }))
);
const TeamFormPage = React.lazy(() =>
  import('./features/workforce/TeamFormPage').then((m) => ({ default: m.TeamFormPage }))
);
const TaskBoard = React.lazy(() =>
  import('./features/workforce/TaskBoard').then((m) => ({ default: m.TaskBoard }))
);

// Procurement
const ProcurementDashboard = React.lazy(() =>
  import('./features/procurement/ProcurementDashboard').then((m) => ({
    default: m.ProcurementDashboard,
  }))
);
const VendorProfilePage = React.lazy(() =>
  import('./features/procurement/VendorProfilePage').then((m) => ({ default: m.VendorProfilePage }))
);

// Finance
const FinanceDashboard = React.lazy(() =>
  import('./features/finance/FinanceDashboard').then((m) => ({ default: m.FinanceDashboard }))
);
const InvoiceDashboard = React.lazy(() =>
  import('./features/finance/InvoiceDashboard').then((m) => ({ default: m.InvoiceDashboard }))
);
const InvoiceFormPage = React.lazy(() =>
  import('./features/finance/InvoiceFormPage').then((m) => ({ default: m.InvoiceFormPage }))
);
const InvoiceDetailsPage = React.lazy(() =>
  import('./features/finance/InvoiceDetailsPage').then((m) => ({ default: m.InvoiceDetailsPage }))
);
const PayablesDashboard = React.lazy(() =>
  import('./features/finance/PayablesDashboard').then((m) => ({ default: m.PayablesDashboard }))
);

// Quotations (New)
const QuotationListPage = React.lazy(() =>
  import('./features/quotations/QuotationListPage').then((m) => ({ default: m.QuotationListPage }))
);
const QuotationFormPage = React.lazy(() =>
  import('./features/quotations/QuotationFormPage').then((m) => ({ default: m.QuotationFormPage }))
);
const QuotationDetailsPage = React.lazy(() =>
  import('./features/quotations/QuotationDetailsPage').then((m) => ({
    default: m.QuotationDetailsPage,
  }))
);

// Reports
const ExecutiveDashboard = React.lazy(() =>
  import('./features/reports/ExecutiveDashboard').then((m) => ({ default: m.ExecutiveDashboard }))
);
const FinancialDashboard = React.lazy(() =>
  import('./features/reports/FinancialDashboard').then((m) => ({ default: m.FinancialDashboard }))
);
const InventoryAnalyticsDashboard = React.lazy(() =>
  import('./features/reports/InventoryAnalyticsDashboard').then((m) => ({
    default: m.InventoryAnalyticsDashboard,
  }))
);
const ReportBuilder = React.lazy(() =>
  import('./features/reports/ReportBuilder').then((m) => ({ default: m.ReportBuilder }))
);

// SaaS
const OrganizationSettings = React.lazy(() =>
  import('./features/saas/OrganizationSettings').then((m) => ({ default: m.OrganizationSettings }))
);
const UserDirectory = React.lazy(() =>
  import('./features/saas/UserDirectory').then((m) => ({ default: m.UserDirectory }))
);
const SubscriptionManager = React.lazy(() =>
  import('./features/saas/SubscriptionManager').then((m) => ({ default: m.SubscriptionManager }))
);
const PlatformAdminDashboard = React.lazy(() =>
  import('./features/saas/PlatformAdminDashboard').then((m) => ({
    default: m.PlatformAdminDashboard,
  }))
);

// Placeholder for missing routes
const ComingSoonPage = React.lazy(() =>
  import('./features/errors/ComingSoonPage').then((m) => ({ default: m.ComingSoonPage }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

const PageSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="decorflow-theme">
        <BrowserRouter>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route
                path="/login"
                element={
                  <PageSuspense>
                    <LoginPage />
                  </PageSuspense>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PageSuspense>
                    <ForgotPasswordPage />
                  </PageSuspense>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PageSuspense>
                    <ResetPasswordPage />
                  </PageSuspense>
                }
              />
              <Route
                path="/unauthorized"
                element={
                  <PageSuspense>
                    <UnauthorizedPage />
                  </PageSuspense>
                }
              />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route element={<PermissionRoute />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route
                    path="/profile"
                    element={
                      <PageSuspense>
                        <ProfilePage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <PageSuspense>
                        <DashboardPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/dashboard/notifications"
                    element={
                      <PageSuspense>
                        <NotificationCenter />
                      </PageSuspense>
                    }
                  />

                  {/* Finance */}
                  <Route
                    path="/finance"
                    element={
                      <PageSuspense>
                        <FinanceDashboard />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/finance/invoices"
                    element={
                      <PageSuspense>
                        <InvoiceDashboard />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/finance/invoices/new"
                    element={
                      <PageSuspense>
                        <InvoiceFormPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/finance/invoices/:id"
                    element={
                      <PageSuspense>
                        <InvoiceDetailsPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/finance/payables"
                    element={
                      <PageSuspense>
                        <PayablesDashboard />
                      </PageSuspense>
                    }
                  />

                  {/* Quotations */}
                  <Route
                    path="/finance/quotations"
                    element={
                      <PageSuspense>
                        <QuotationListPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/finance/quotations/new"
                    element={
                      <PageSuspense>
                        <QuotationFormPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/finance/quotations/:id"
                    element={
                      <PageSuspense>
                        <QuotationDetailsPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/finance/quotations/:id/edit"
                    element={
                      <PageSuspense>
                        <QuotationFormPage />
                      </PageSuspense>
                    }
                  />

                  {/* Reports & Analytics */}
                  <Route
                    path="/reports"
                    element={
                      <PageSuspense>
                        <ExecutiveDashboard />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/reports/financial"
                    element={
                      <PageSuspense>
                        <FinancialDashboard />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/reports/inventory"
                    element={
                      <PageSuspense>
                        <InventoryAnalyticsDashboard />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/reports/builder"
                    element={
                      <PageSuspense>
                        <ReportBuilder />
                      </PageSuspense>
                    }
                  />

                  {/* SaaS & Settings */}
                  <Route
                    path="/settings/organization"
                    element={
                      <PageSuspense>
                        <OrganizationSettings />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/settings/users"
                    element={
                      <PageSuspense>
                        <UserDirectory />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/settings/subscription"
                    element={
                      <PageSuspense>
                        <SubscriptionManager />
                      </PageSuspense>
                    }
                  />

                  {/* Super Admin */}
                  <Route
                    path="/admin/platform"
                    element={
                      <PageSuspense>
                        <PlatformAdminDashboard />
                      </PageSuspense>
                    }
                  />

                  {/* Events Module */}
                  <Route
                    path="/events"
                    element={
                      <PageSuspense>
                        <EventListPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/events/new"
                    element={
                      <PageSuspense>
                        <EventFormPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/events/:id"
                    element={
                      <PageSuspense>
                        <EventDetailsPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/events/:id/edit"
                    element={
                      <PageSuspense>
                        <EventFormPage />
                      </PageSuspense>
                    }
                  />

                  {/* Customers CRM */}
                  <Route
                    path="/customers"
                    element={
                      <PageSuspense>
                        <CustomerListPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/customers/new"
                    element={
                      <PageSuspense>
                        <CustomerFormPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/customers/:id"
                    element={
                      <PageSuspense>
                        <CustomerDetailsPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/customers/:id/edit"
                    element={
                      <PageSuspense>
                        <CustomerFormPage />
                      </PageSuspense>
                    }
                  />

                  {/* Inventory Module */}
                  <Route
                    path="/inventory"
                    element={
                      <PageSuspense>
                        <InventoryListPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/inventory/new"
                    element={
                      <PageSuspense>
                        <InventoryFormPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/inventory/:id"
                    element={
                      <PageSuspense>
                        <InventoryDetailsPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/inventory/:id/edit"
                    element={
                      <PageSuspense>
                        <InventoryFormPage />
                      </PageSuspense>
                    }
                  />

                  {/* Additional Sidebar Routes (Placeholders) */}
                  <Route
                    path="/warehouse"
                    element={
                      <PageSuspense>
                        <ComingSoonPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/inventory/reservations"
                    element={
                      <PageSuspense>
                        <ComingSoonPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/cleaning"
                    element={
                      <PageSuspense>
                        <CleaningDashboard />
                      </PageSuspense>
                    }
                  />

                  {/* Warehouse Operations */}
                  <Route
                    path="/packing"
                    element={
                      <PageSuspense>
                        <PackingDashboard />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/packing/new"
                    element={
                      <PageSuspense>
                        <PackingFormPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/packing/:id"
                    element={
                      <PageSuspense>
                        <PackingDetailsPage />
                      </PageSuspense>
                    }
                  />

                  {/* Logistics & Fleet */}
                  <Route
                    path="/fleet"
                    element={
                      <PageSuspense>
                        <FleetDashboard />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/fleet/vehicles/new"
                    element={
                      <PageSuspense>
                        <VehicleFormPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/fleet/trips/:id"
                    element={
                      <PageSuspense>
                        <TripDetailsPage />
                      </PageSuspense>
                    }
                  />

                  {/* Workforce & Tasks */}
                  <Route
                    path="/workforce"
                    element={
                      <PageSuspense>
                        <WorkforceDashboard />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/workforce/employees/new"
                    element={
                      <PageSuspense>
                        <EmployeeFormPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/workforce/teams/new"
                    element={
                      <PageSuspense>
                        <TeamFormPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/tasks"
                    element={
                      <PageSuspense>
                        <TaskBoard />
                      </PageSuspense>
                    }
                  />

                  {/* Procurement */}
                  <Route
                    path="/procurement"
                    element={
                      <PageSuspense>
                        <ProcurementDashboard />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/procurement/vendors/:id"
                    element={
                      <PageSuspense>
                        <VendorProfilePage />
                      </PageSuspense>
                    }
                  />

                  {/* Error Testing Routes */}
                  <Route
                    path="/403"
                    element={
                      <PageSuspense>
                        <ForbiddenPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="/500"
                    element={
                      <PageSuspense>
                        <ServerErrorPage />
                      </PageSuspense>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <PageSuspense>
                        <NotFoundPage />
                      </PageSuspense>
                    }
                  />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
