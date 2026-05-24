'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { mergePlanToSupabase } from '@/lib/persistence';

type FormState = {
  email: string;
  password: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name as keyof FormState]) return prev;
      const next = { ...prev };
      delete next[name as keyof FormState];
      return next;
    });
    if (formError) setFormError('');
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!form.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!EMAIL_RE.test(form.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (!form.password) {
      errors.password = 'Password is required.';
    }
    return errors;
  };

  const mapSupabaseError = (message: string): string => {
    if (/invalid login credentials/i.test(message)) {
      return 'Incorrect email or password. Please try again.';
    }
    if (/email not confirmed/i.test(message)) {
      return 'Please check your email and confirm your account before logging in.';
    }
    return message;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (error) {
        setFormError(mapSupabaseError(error.message));
        return;
      }

      if (data.user) {
        try {
          await mergePlanToSupabase(data.user.id);
        } catch (mergeErr) {
          console.error('Failed to merge guest plan into Supabase:', mergeErr);
        }
      }

      router.replace(redirectTo);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong while logging in.';
      setFormError(message);
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
          <label className="form-label">
            Email
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
            {fieldErrors.email && (
              <span className="form-error">{fieldErrors.email}</span>
            )}
          </label>

          <label className="form-label">
            Password
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
            {fieldErrors.password && (
              <span className="form-error">{fieldErrors.password}</span>
            )}
          </label>

          <p className="auth-footer-text" style={{ marginTop: 0 }}>
            <Link href="/forgot-password">Forgot password?</Link>
          </p>

          <button
            type="submit"
            className="btn-primary full-width"
            disabled={loading}
          >
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
