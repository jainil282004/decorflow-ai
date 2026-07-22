import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '@decorflow/shared';
import type { ResetPasswordDTO } from '@decorflow/shared';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader2 } from 'lucide-react';

function getApiErrorMessage(err: any, fallback: string) {
  return err?.response?.data?.error?.message || err?.response?.data?.message || fallback;
}

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token')?.trim() || '', [searchParams]);

  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const form = useForm<ResetPasswordDTO>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: '',
      confirmPassword: '',
    },
  });

  const tokenMissing = !token;

  const onSubmit = async (data: ResetPasswordDTO) => {
    if (!token) {
      setStatus('error');
      setMessage('This reset link is invalid or incomplete. Request a new password reset.');
      return;
    }

    try {
      setStatus('idle');
      setMessage('');
      await apiClient.post('/auth/reset-password', {
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setStatus('success');
      setMessage('Your password has been updated. You can sign in with your new password.');
    } catch (err: any) {
      const apiMessage = getApiErrorMessage(err, 'Could not reset password');
      const isExpiredOrInvalid =
        /invalid|expired|token/i.test(apiMessage) || err?.response?.status === 400;
      setStatus('error');
      setMessage(
        isExpiredOrInvalid
          ? 'This reset link is invalid or has expired. Please request a new password reset.'
          : apiMessage
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
          <CardDescription>Choose a new password for your account</CardDescription>
        </CardHeader>

        {tokenMissing ? (
          <>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  This reset link is invalid or incomplete. Request a new password reset.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button asChild className="w-full">
                <Link to="/forgot-password">Request a new link</Link>
              </Button>
              <Link
                to="/login"
                className="text-sm text-center text-muted-foreground hover:text-primary transition-colors"
              >
                Back to login
              </Link>
            </CardFooter>
          </>
        ) : status === 'success' ? (
          <>
            <CardContent className="space-y-4">
              <Alert className="bg-green-50 text-green-900 border-green-200">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button asChild className="w-full">
                <Link to="/login">Sign in</Link>
              </Button>
            </CardFooter>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                {status === 'error' && (
                  <Alert variant="destructive">
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          disabled={form.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          disabled={form.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update password
                </Button>
                {status === 'error' && /expired|invalid/i.test(message) && (
                  <Link
                    to="/forgot-password"
                    className="text-sm text-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    Request a new reset link
                  </Link>
                )}
                <Link
                  to="/login"
                  className="text-sm text-center text-muted-foreground hover:text-primary transition-colors"
                >
                  Back to login
                </Link>
              </CardFooter>
            </form>
          </Form>
        )}
      </Card>
    </div>
  );
};
