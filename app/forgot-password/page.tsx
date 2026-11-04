'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { errorMessage } from '@/lib/fetch-json';
import { useFormState, validateEmail } from '@/lib/hooks/useFormState';
import { FormField } from '@/components/ui/FormField';

function mapSupabaseError(message: string): string {
  if (/rate limit|too many|security purposes/i.test(message)) {
    return 'Too many reset requests. Please wait a few minutes and try again.';
  }
  return message;
}

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const linkExpired = searchParams.get('error') === 'link_expired';

  const { form, fieldErrors, formError, setFormError, handleChange, runValidation } =
    useFormState({ email: '' });
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    if (!runValidation((values) => ({ email: validateEmail(values.email) }))) return;

    const email = form.email.trim();
    try {
      setLoading(true);
      const { error } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) {
        setFormError(mapSupabaseError(error.message));
        return;
      }
      setSentTo(email);
    } catch (err) {
      setFormError(errorMessage(err, 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    // Same message whether or not the account exists, so emails can't be probed.
    return (
      <div className="page-auth">
        <div className="auth-card">
          <h1>Check your email</h1>
          <p className="auth-subtext">
            If an account exists for <strong>{sentTo}</strong>, we&apos;ve sent a link to
            reset your password. The link expires in 1 hour.
          </p>
          <p className="auth-subtext">
            Didn&apos;t get it? Check your spam folder, or{' '}
            <button type="button" className="link-button" onClick={() => setSentTo(null)}>
              try again
            </button>
            .
          </p>
          <p className="auth-footer-text">
            <Link href="/login">Back to log in</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-auth">
      <div className="auth-card">
        <h1>Forgot password?</h1>
        <p className="auth-subtext">
          Enter the email you signed up with and we&apos;ll send you a link to reset your
          password.
        </p>

        {linkExpired && !formError && (
          <div className="form-error">
            That reset link is invalid or has expired. Request a new one below.
          </div>
        )}
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
          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? 'Sending link…' : 'Send reset link'}
          </button>
        </form>

        <p className="auth-footer-text">
          Remembered it? <Link href="/login">Back to log in</Link>
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
