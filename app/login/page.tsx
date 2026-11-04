'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { mergePlanToSupabase } from '@/lib/persistence';
import { errorMessage } from '@/lib/fetch-json';
import { useFormState, validateEmail } from '@/lib/hooks/useFormState';
import { FormField } from '@/components/ui/FormField';

function mapSupabaseError(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return 'Incorrect email or password. Please try again.';
  }
  if (/email not confirmed/i.test(message)) {
    return 'Please check your email and confirm your account before logging in.';
  }
  return message;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const { form, fieldErrors, formError, setFormError, handleChange, runValidation } =
    useFormState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    const valid = runValidation((values) => ({
      email: validateEmail(values.email),
      password: values.password ? undefined : 'Password is required.',
    }));
    if (!valid) return;

    try {
      setLoading(true);
      const { data, error } = await createClient().auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (error) {
        setFormError(mapSupabaseError(error.message));
        return;
      }

      // mergePlanToSupabase logs and swallows its own errors.
      if (data.user) await mergePlanToSupabase(data.user.id);

      router.replace(redirectTo);
    } catch (err) {
      setFormError(errorMessage(err, 'Something went wrong while logging in.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-auth">
      <div className="auth-card">
        <h1>Log in</h1>
        <p className="auth-subtext">
          Access your saved plans and track your migration progress.
        </p>

        {formError && <div className="form-error">{formError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="Email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            error={fieldErrors.email}
            required
          />

          <FormField
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            error={fieldErrors.password}
            required
          />

          <p className="auth-footer-text mt-0">
            <Link href="/forgot-password">Forgot password?</Link>
          </p>

          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="auth-footer-text">
          Don&apos;t have an account? <Link href="/signup">Sign up</Link>
        </p>
        <p className="auth-footer-text">
          Or continue as <Link href="/onboarding">Guest</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
