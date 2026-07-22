import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PageHeader } from '../../components/PageHeader';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useOrganization, useUpdateOrganization } from './api/saasApi';
import { useToast } from '../../hooks/use-toast';
import { ImagePlus, Save, Trash2 } from 'lucide-react';
import { BranchSettings } from './BranchSettings';

interface OrgFormData {
  name: string;
  logoUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  website?: string;
  timeZone: string;
  currency: string;
  language: string;
}

const MAX_LOGO_BYTES = 80_000; // stay under live Express default ~100kb JSON limit until API is redeployed

async function fileToCompressedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxSide = 384;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process image');
  // White background so transparent PNGs don't turn black as JPEG
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Always JPEG — PNG data URLs often exceed the API body limit
  let quality = 0.85;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  while (dataUrl.length > MAX_LOGO_BYTES && quality > 0.4) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  if (dataUrl.length > MAX_LOGO_BYTES) {
    throw new Error(
      'Logo is still too large after compression. Use a simpler image or paste a URL.'
    );
  }

  return dataUrl;
}

export const OrganizationSettings = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const { data: org, isLoading } = useOrganization();
  const updateOrgMutation = useUpdateOrganization();

  const form = useForm<OrgFormData>({
    defaultValues: {
      name: '',
      logoUrl: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
      website: '',
      timeZone: 'UTC',
      currency: 'INR',
      language: 'en',
    },
  });

  const logoPreview = form.watch('logoUrl');

  useEffect(() => {
    if (org) {
      form.reset({
        name: org.name || '',
        logoUrl: org.logoUrl || '',
        email: org.email || '',
        phone: org.phone || '',
        address: org.address || '',
        taxId: org.taxId || '',
        website: org.website || '',
        timeZone: org.timeZone || 'UTC',
        currency: org.currency || 'INR',
        language: org.language || 'en',
      });
    }
  }, [org, form]);

  if (isLoading)
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );

  const onSubmit = (data: OrgFormData) => {
    // Guard: never send oversized data-URL logos (old live API rejects >~100kb bodies)
    let logoUrl = data.logoUrl || null;
    if (logoUrl?.startsWith('data:') && logoUrl.length > MAX_LOGO_BYTES) {
      toast({
        title:
          'Logo too large to save — clearing it so other settings can save. Re-upload a smaller image or use a URL.',
        variant: 'destructive',
      });
      logoUrl = null;
      form.setValue('logoUrl', '');
    }

    updateOrgMutation.mutate(
      {
        name: data.name,
        timeZone: data.timeZone,
        currency: data.currency,
        language: data.language,
        logoUrl,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        taxId: data.taxId || null,
        website: data.website || null,
      },
      {
        onSuccess: () => toast({ title: 'Organization settings saved' }),
        onError: (err: any) => {
          const apiMessage =
            err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            'Could not save settings';
          // Old live error handler put the real text in `code` for 413s
          const code = err?.response?.data?.error?.code;
          const title =
            err?.response?.status === 413 || code === 'request entity too large'
              ? 'Logo is too large for the server. Remove the logo or use an image URL, then save again.'
              : apiMessage === 'INTERNAL_ERROR' && code
                ? String(code)
                : apiMessage;
          toast({
            title,
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleLogoFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please choose an image file (PNG, JPG, or WEBP)', variant: 'destructive' });
      return;
    }
    try {
      setUploadingLogo(true);
      const dataUrl = await fileToCompressedDataUrl(file);
      form.setValue('logoUrl', dataUrl, { shouldDirty: true });
      toast({ title: 'Logo ready — click Save Changes to apply it on invoices' });
    } catch (error: any) {
      toast({
        title: error?.message || 'Could not process logo',
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
            <PageHeader
              title="Organization Settings"
              description="Manage branding and details shown on quotations and invoices"
            />
            <Button type="submit" disabled={updateOrgMutation.isPending}>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company & logo</CardTitle>
                <CardDescription>
                  Your logo appears on quotations, invoices, PDF/print, and Excel headers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Ruturaj Farm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Company logo preview"
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <span className="px-2 text-center text-[10px] uppercase tracking-wide text-muted-foreground">
                        No logo
                      </span>
                    )}
                  </div>
                  <div className="space-y-3 flex-1 w-full">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) => handleLogoFile(e.target.files?.[0])}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingLogo}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImagePlus className="mr-2 h-4 w-4" />
                        {uploadingLogo ? 'Processing…' : 'Upload logo'}
                      </Button>
                      {logoPreview && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => form.setValue('logoUrl', '', { shouldDirty: true })}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <FormField
                      control={form.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Or paste image URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/logo.png"
                              {...field}
                              value={
                                field.value?.startsWith('data:')
                                  ? '(uploaded image — save to keep)'
                                  : field.value || ''
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value.startsWith('(uploaded')) return;
                                field.onChange(value);
                              }}
                              disabled={Boolean(field.value?.startsWith('data:'))}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Images are compressed automatically. Or paste a direct image link
                            instead.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="hello@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="9999999999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GSTIN / Tax ID</FormLabel>
                        <FormControl>
                          <Input placeholder="22AAAAA0000A1Z5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Shown on quotations and invoices" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional & Localization</CardTitle>
                <CardDescription>Configure timezones and financial currencies.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="timeZone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Zone</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="Asia/Kolkata">IST (Asia/Kolkata)</SelectItem>
                            <SelectItem value="America/New_York">EST (America/New_York)</SelectItem>
                            <SelectItem value="Europe/London">GMT (Europe/London)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Currency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>

      <div className="mt-6">
        <BranchSettings />
      </div>
    </div>
  );
};
