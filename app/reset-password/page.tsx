'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { FormField } from '@/components/ui/FormField';
import { LoadingCard } from '@/components/ui/LoadingCard';
import { createClient } from '@/lib/supabase/client';
import { errorMessage } from '@/lib/fetch-json';
import {
  MIN_PASSWORD_LENGTH,
  useFormState,
  validateNewPassword,
} from '@/lib/hooks/useFormState';

function mapSupabaseError(message: string): string {
  if (/different from the old password/i.test(message)) {
    return 'Your new password must be different from your current one.';
  }
  if (/session|jwt|not authenticated/i.test(message)) {
    return 'Your reset link has expired. Please request a new one.';
  }
  return message;
}

/**
 * Reached from the emailed reset link via /auth/callback, which signs the
 * user in with a short-lived recovery session before redirecting here.
 */
export default function ResetPasswordPage() {
  const { user, loading } = useAuth();
  const { form, fieldErrors, formError, setFormError, handleChange, runValidation } =
    useFormState({ password: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    if (!runValidation((v) => validateNewPassword(v.password, v.confirmPassword))) return;

    try {
      setSaving(true);
      const { error } = await createClient().auth.updateUser({ password: form.password });
      if (error) {
        setFormError(mapSupabaseError(error.message));
        return;
      }
      setDone(true);
    } catch (err) {
      setFormError(errorMessage(err, 'Something went wrong. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingCard message="Checking your reset link…" />;

  if (done) {
    return (
      <div className="page-auth">
        <div className="auth-card">
          <h1>Password updated</h1>
          <div className="form-success" role="status">
            Your password has been changed and you&apos;re signed in.
          </div>
          <Link href="/dashboard" className="btn-primary full-width">
            Go to my dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-auth">
        <div className="auth-card">
          <h1>Reset link expired</h1>
          <p className="auth-subtext">
            This page only works from the link in your password reset email, and each
            link can be used once within an hour.
          </p>
          <Link href="/forgot-password" className="btn-primary full-width">
            Request a new link
          </Link>
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
        <h1>Choose a new password</h1>
        <p className="auth-subtext">
          Setting a new password for <strong>{user.email}</strong>.
        </p>

        {formError && <div className="form-error">{formError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="New password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            error={fieldErrors.password}
            required
          />
          <FormField
            label="Confirm new password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
            required
          />
          <button type="submit" className="btn-primary full-width" disabled={saving}>
            {saving ? 'Updating password…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
