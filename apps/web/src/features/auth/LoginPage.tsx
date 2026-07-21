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

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-[11px] uppercase tracking-wider text-muted-foreground/60">
                or continue with
              </span>
            </div>
          </div>

          {/* Social login buttons (visual only) */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 gap-2.5 text-sm font-medium border-border/60 hover:bg-muted/30"
              disabled
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 gap-2.5 text-sm font-medium border-border/60 hover:bg-muted/30"
              disabled
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.18 0-.36-.02-.53-.06-.01-.08-.02-.2-.02-.3 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.06.28.06.37h-.8zm4.565 17.89c-.33.96-1.02 1.95-1.77 2.65-.87.82-1.77 1.09-2.87 1.09-1.18 0-1.93-.36-2.67-.72-.76-.37-1.53-.74-2.84-.74s-2.17.39-2.95.76c-.72.34-1.4.67-2.45.71-1.05.04-1.88-.29-2.72-1.08-.97-.93-1.83-2.2-2.48-3.66C-.15 15.98-.4 13.38.56 11.34c.7-1.47 2.04-2.57 3.54-2.79 1.01-.15 2.05.24 2.93.57.66.25 1.24.47 1.7.47.36 0 .87-.18 1.5-.4 1-.35 2.24-.78 3.46-.66 1.78.17 3.07.95 3.87 2.21-1.57.98-2.32 2.43-2.2 4.34.14 2.07 1.35 3.63 3.21 4.19z" />
              </svg>
              Apple
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
