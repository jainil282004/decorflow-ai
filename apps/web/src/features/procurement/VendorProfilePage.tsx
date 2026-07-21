import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  CreditCard,
  Star,
  FileText,
  ShoppingCart,
} from 'lucide-react';
import { useVendor } from './api/procurementApi';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';

export const VendorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: vendor, isLoading } = useVendor(id!);

  if (isLoading)
    return (
      <div className="space-y-6 max-w-5xl mx-auto p-4">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px] lg:col-span-2" />
        </div>
      </div>
    );
  if (!vendor)
    return (
      <div className="pt-12">
        <EmptyState
          title="Vendor Not Found"
          description="The vendor you are looking for does not exist."
          actionLabel="Back to Vendors"
          onAction={() => navigate('/procurement')}
        />
      </div>
    );

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/procurement')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-serif text-primary tracking-tight">Vendor Profile</h1>
          <p className="text-sm text-muted-foreground">
            Detailed information and performance metrics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center justify-between">
                {vendor.name}
                {vendor.isPreferred && <Badge variant="secondary">Preferred</Badge>}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge
                  variant={vendor.isActive ? 'default' : 'secondary'}
                  className="rounded-sm font-normal"
                >
                  {vendor.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {vendor.categories && (
                  <span className="text-xs uppercase tracking-wider">{vendor.categories}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <span className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Vendor Rating
                </span>
                <span className="font-semibold">{vendor.rating} / 5.0</span>
              </div>

              <div className="space-y-3 pt-2">
                {vendor.contactPerson && (
                  <div className="flex items-start gap-3 text-sm">
                    <UserIcon className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Contact Person</p>
                      <p className="text-muted-foreground">{vendor.contactPerson}</p>
                    </div>
                  </div>
                )}

                {vendor.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${vendor.email}`} className="hover:underline">
                      {vendor.email}
                    </a>
                  </div>
                )}

                {vendor.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${vendor.phone}`} className="hover:underline">
                      {vendor.phone}
                    </a>
                  </div>
                )}

                {vendor.address && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{vendor.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                Tax & Banking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <Building2 className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">GST / Tax ID</p>
                  <p className="text-muted-foreground font-mono">
                    {vendor.taxId || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">PAN Number</p>
                  <p className="text-muted-foreground font-mono">
                    {vendor.panNumber || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <CreditCard className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Bank Details</p>
                  <p className="text-muted-foreground">{vendor.bankDetails || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Recent Purchase Orders</CardTitle>
                <CardDescription>History of transactions with this vendor</CardDescription>
              </div>
              <Button size="sm">Create PO</Button>
            </CardHeader>
            <CardContent>
              {vendor.purchases?.length === 0 ? (
                <EmptyState
                  title="No purchase history"
                  description="You have not created any purchase orders with this vendor yet."
                />
              ) : (
                <div className="space-y-4 mt-4">
                  {vendor.purchases?.map((po: any) => (
                    <div
                      key={po.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">PO-{po.id.substring(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(po.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">₹{po.totalAmount.toLocaleString()}</p>
                        <Badge
                          variant={po.status === 'RECEIVED' ? 'default' : 'outline'}
                          className="mt-1 text-[10px]"
                        >
                          {po.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-primary/80 mb-2">Total PO Volume</p>
                <h4 className="text-3xl font-serif">
                  ₹
                  {vendor.purchases
                    ?.reduce((acc: number, p: any) => acc + p.totalAmount, 0)
                    .toLocaleString()}
                </h4>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  On-Time Delivery Rate
                </p>
                <h4 className="text-3xl font-serif">N/A</h4>
                <p className="text-xs text-muted-foreground mt-1">Requires more GRN data</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Temp simple icon fallback
const UserIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
