import { useEffect } from 'react';
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
import { Save } from 'lucide-react';
import { BranchSettings } from './BranchSettings';

interface OrgFormData {
  name: string;
  logoUrl?: string;
  timeZone: string;
  currency: string;
  language: string;
}

export const OrganizationSettings = () => {
  const { data: org, isLoading } = useOrganization();
  const updateOrgMutation = useUpdateOrganization();

  const form = useForm<OrgFormData>({
    defaultValues: {
      name: '',
      logoUrl: '',
      timeZone: 'UTC',
      currency: 'USD',
      language: 'en',
    },
  });

  useEffect(() => {
    if (org) {
      form.reset({
        name: org.name || '',
        logoUrl: org.logoUrl || '',
        timeZone: org.timeZone || 'UTC',
        currency: org.currency || 'USD',
        language: org.language || 'en',
      });
    }
  }, [org, form.reset]);

  if (isLoading)
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );

  const onSubmit = (data: OrgFormData) => {
    updateOrgMutation.mutate(data);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex justify-between items-start mb-6">
            <PageHeader
              title="Organization Settings"
              description="Manage your tenant configuration, branding, and regional defaults"
            />
            <Button type="submit" disabled={updateOrgMutation.isPending}>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Update your company details and logo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Logo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/logo.png" {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Provide a direct URL to your company logo (PNG, SVG, or JPG).
                      </p>
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
