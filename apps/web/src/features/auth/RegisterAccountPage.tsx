import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerAccountSchema } from '@decorflow/shared';
import type { RegisterAccountDTO } from '@decorflow/shared';
import { apiClient } from '../../lib/axios';
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
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader2, Shield, Truck, Package } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useToast } from '../../hooks/use-toast';

export const RegisterAccountPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState('');
  const [hasError, setHasError] = useState(false);

  const form = useForm<RegisterAccountDTO>({
    resolver: zodResolver(registerAccountSchema),
    defaultValues: {
      accountType: 'OWNER',
      createNewOrganization: false,
    },
  });

  const accountType = form.watch('accountType');
  const createNewOrganization = form.watch('createNewOrganization');

  const onSubmit = async (data: RegisterAccountDTO) => {
    try {
      setError('');
      setHasError(false);

      const payload = { ...data };
      if (payload.accountType !== 'OWNER' || !payload.createNewOrganization) {
        payload.createNewOrganization = false;
        delete payload.organizationName;
      }

      await apiClient.post('/auth/register', payload);

      toast({
        title: 'Account created!',
        description: 'Redirecting to login...',
      });

      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Failed to register account';
      setError(msg);
      setHasError(true);
      setTimeout(() => setHasError(false), 600);
    }
  };

  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-3xl font-serif font-medium tracking-tight mb-2">Create Account</h1>
        <p className="text-muted-foreground text-sm">Join the system using the master password.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <Alert
              variant="destructive"
              className={cn(
                'border-destructive/20 bg-destructive/5 text-destructive',
                hasError && 'animate-shake'
              )}
            >
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <FormLabel className="text-muted-foreground text-xs uppercase tracking-[0.12em] font-semibold">
              Account Type
            </FormLabel>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'OWNER', title: 'Owner', desc: 'Full system access', icon: Shield },
                { id: 'DRIVER', title: 'Driver', desc: 'Can manage trips & delivery', icon: Truck },
                {
                  id: 'WAREHOUSE',
                  title: 'Warehouse',
                  desc: 'Manage inventory & packing',
                  icon: Package,
                },
              ].map((role) => (
                <div
                  key={role.id}
                  onClick={() => form.setValue('accountType', role.id as any)}
                  className={cn(
                    'relative flex items-center p-4 border rounded-lg cursor-pointer transition-all',
                    accountType === role.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  )}
                >
                  <role.icon
                    className={cn(
                      'w-5 h-5 mr-4',
                      accountType === role.id ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{role.title}</h3>
                    <p className="text-xs text-muted-foreground">{role.desc}</p>
                  </div>
                  {accountType === role.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
              ))}
            </div>
          </div>

          {accountType === 'OWNER' && (
            <>
              <div className="space-y-3 pt-2">
                <FormLabel className="text-muted-foreground text-xs uppercase tracking-[0.12em] font-semibold">
                  Organisation Setup
                </FormLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => {
                      form.setValue('createNewOrganization', false);
                      form.clearErrors('organizationName');
                    }}
                    className={cn(
                      'relative flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all text-center',
                      !createNewOrganization
                        ? 'border-primary bg-primary/5 ring-1 ring-primary text-primary'
                        : 'border-border hover:border-primary/50 hover:bg-muted/30 text-muted-foreground'
                    )}
                  >
                    <span className="text-sm font-medium">Join existing</span>
                  </div>
                  <div
                    onClick={() => form.setValue('createNewOrganization', true)}
                    className={cn(
                      'relative flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all text-center',
                      createNewOrganization
                        ? 'border-primary bg-primary/5 ring-1 ring-primary text-primary'
                        : 'border-border hover:border-primary/50 hover:bg-muted/30 text-muted-foreground'
                    )}
                  >
                    <span className="text-sm font-medium">Add new</span>
                  </div>
                </div>
              </div>

              {createNewOrganization && (
                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs uppercase tracking-[0.12em] font-semibold">
                        Organisation Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="My Decor Company"
                          className="h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </>
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs uppercase tracking-[0.12em] font-semibold">
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    className="h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs uppercase tracking-[0.12em] font-semibold">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="hello@decorflow.com"
                    className="h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs uppercase tracking-[0.12em] font-semibold">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="masterPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs uppercase tracking-[0.12em] font-semibold">
                  Master Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Secret provided by owner"
                    className="h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-11 mt-4 font-medium shadow-sm hover:shadow-md transition-all"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>

          <div className="text-center mt-6">
            <a
              href="/login"
              className="text-sm text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors"
            >
              Already have an account? Sign in
            </a>
          </div>
        </form>
      </Form>
    </>
  );
};
