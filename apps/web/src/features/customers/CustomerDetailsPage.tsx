import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer, useDeleteCustomer, useRestoreCustomer } from './api/customersApi';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/ui/button';
import { Icon } from '../../components/ui/icon';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { AlertCircle } from 'lucide-react';

export function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, isError, refetch } = useCustomer(id!);

  const archiveMutation = useDeleteCustomer();
  const restoreMutation = useRestoreCustomer();

  if (isLoading) {
    return (
      <div className="space-y-6 pb-8 p-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[280px]" />
          <Skeleton className="h-[280px]" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-12">
        <EmptyState
          title="Could not load customer"
          description="Something went wrong while fetching this customer. Check your connection and try again."
          icon={<AlertCircle className="w-12 h-12 text-destructive/60" />}
          actionLabel="Try again"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  if (!response?.data) {
    return (
      <div className="pt-12">
        <EmptyState
          title="Customer not found"
          description="This customer does not exist or may have been removed."
          actionLabel="Back to Customers"
          onAction={() => navigate('/customers')}
        />
      </div>
    );
  }

  const customer = response.data;

  const toggleArchive = () => {
    if (customer.isActive) {
      if (confirm('Are you sure you want to archive this customer?')) {
        archiveMutation.mutate(customer.id);
      }
    } else {
      restoreMutation.mutate(customer.id);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div
        className="flex items-center gap-4 text-sm text-muted-foreground mb-4 cursor-pointer hover:text-primary transition-colors w-fit"
        onClick={() => navigate('/customers')}
      >
        <Icon name="ArrowLeft" className="h-4 w-4" /> Back to Customers
      </div>

      <PageHeader
        title={customer.name}
        description={
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={customer.type === 'BUSINESS' ? 'default' : 'secondary'}>
              {customer.type}
            </Badge>
            <Badge variant={customer.isActive ? 'outline' : 'destructive'}>
              {customer.isActive ? 'Active' : 'Archived'}
            </Badge>
          </div>
        }
      >
        <Button variant="outline" onClick={() => navigate(`/customers/${customer.id}/edit`)}>
          <Icon name="Edit" className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button variant={customer.isActive ? 'destructive' : 'default'} onClick={toggleArchive}>
          <Icon name={customer.isActive ? 'Archive' : 'ArchiveRestore'} className="mr-2 h-4 w-4" />
          {customer.isActive ? 'Archive' : 'Restore'}
        </Button>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Info */}
        <div className="col-span-1 lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs uppercase tracking-widest font-semibold mb-1">
                  Email Address
                </span>
                <span className="font-medium">{customer.email || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs uppercase tracking-widest font-semibold mb-1">
                  Phone Number
                </span>
                <span className="font-medium">{customer.phone || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs uppercase tracking-widest font-semibold mb-1">
                  Tax ID (GST)
                </span>
                <span className="font-medium">{customer.taxId || 'N/A'}</span>
              </div>
              {customer.notes && (
                <div className="flex flex-col pt-4 border-t border-border mt-4">
                  <span className="text-muted-foreground text-xs uppercase tracking-widest font-semibold mb-1">
                    Internal Notes
                  </span>
                  <p className="text-sm leading-relaxed text-foreground/90">{customer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Addresses & Contacts */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.addresses?.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {customer.addresses.map((address) => (
                    <div
                      key={address.id}
                      className="p-4 border border-border rounded-xl bg-muted/20"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="bg-background">
                          {address.type}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <p>{address.line1}</p>
                        {address.line2 && <p>{address.line2}</p>}
                        <p>
                          {address.city}, {address.state} {address.zip}
                        </p>
                        <p className="text-muted-foreground">{address.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground font-light">No addresses found.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.contacts?.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {customer.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex flex-col p-4 border border-border rounded-xl bg-background hover:bg-muted/30 transition-colors"
                    >
                      <span className="font-serif font-medium text-lg">{contact.name}</span>
                      <span className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                        {contact.role || 'Contact'}
                      </span>
                      <div className="text-sm flex flex-col gap-1.5 text-foreground/80">
                        {contact.email && (
                          <span className="flex items-center gap-2">
                            <Icon name="Mail" className="w-4 h-4 text-primary" /> {contact.email}
                          </span>
                        )}
                        {contact.phone && (
                          <span className="flex items-center gap-2">
                            <Icon name="Phone" className="w-4 h-4 text-primary" /> {contact.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No additional contacts found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
