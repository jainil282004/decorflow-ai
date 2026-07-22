import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@decorflow/shared';
import type { LoginDTO } from '@decorflow/shared';
import { useAuthStore } from '../../stores/authStore';
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
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [error, setError] = useState('');
  const [hasError, setHasError] = useState(false);

  const form = useForm<LoginDTO>({
    resolver: zodResolver(loginSchema),
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginDTO) => {
    try {
      setError('');
      setHasError(false);
      const response = await apiClient.post('/auth/login', data);

      const { accessToken, user } = response.data.data;

      // Fetch permissions for the RBAC store
      // We set auth first so the interceptor has the token for the subsequent request
      setAuth(user, accessToken, []);

      try {
        const permResponse = await apiClient.get('/auth/permissions');
        setAuth(user, accessToken, permResponse.data.data);
      } catch (e) {
        console.error('Failed to load permissions', e);
      }

      navigate('/dashboard'); // Redirect after login
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to login';
      setError(msg);
      setHasError(true);
      // Reset shake animation
      setTimeout(() => setHasError(false), 600);
    }
  };

  return (
    <>
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-3xl font-serif font-medium tracking-tight mb-2">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Sign in to manage events, inventory, and operations.
        </p>
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
                <div className="flex items-center justify-between">
                  <FormLabel className="text-muted-foreground text-xs uppercase tracking-[0.12em] font-semibold">
                    Password
                  </FormLabel>
                  <a
                    href="/forgot-password"
                    className="text-xs text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
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

          {/* Remember me */}
          <div className="flex items-center gap-2.5">
            <Checkbox id="remember" className="rounded-[4px]" />
            <Label
              htmlFor="remember"
              className="text-sm text-muted-foreground cursor-pointer select-none"
            >
              Remember me for 30 days
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full h-11 mt-2 font-medium shadow-sm hover:shadow-md transition-all"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>

          {/* TODO: Re-add Google/Apple OAuth buttons when backend OAuth is implemented. */}
        </form>
      </Form>
    </>
  );
};
