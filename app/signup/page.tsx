'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { errorMessage } from '@/lib/fetch-json';
import { useFormState, validateEmail } from '@/lib/hooks/useFormState';
import { CATEGORY_OPTIONS, COUNTRY_OPTIONS } from '@/lib/options';
import { FormField } from '@/components/ui/FormField';
import { Select } from '@/components/ui/Select';

const INITIAL_FORM = {
  firstName: '',
  surname: '',
  homeCountry: '',
  dob: '',
  profession: '',
  email: '',
  password: '',
  confirmPassword: '',
};

type SignupForm = typeof INITIAL_FORM;

function validate(form: SignupForm) {
  let password: string | undefined;
  if (!form.password) password = 'Password is required.';
  else if (form.password.length < 8) password = 'Password must be at least 8 characters.';

  let confirmPassword: string | undefined;
  if (!form.confirmPassword) confirmPassword = 'Please confirm your password.';
  else if (form.password && form.password !== form.confirmPassword) {
    confirmPassword = 'Passwords do not match.';
  }

  return {
    firstName: form.firstName.trim() ? undefined : 'Full name is required.',
    surname: form.surname.trim() ? undefined : 'Surname is required.',
    homeCountry: form.homeCountry ? undefined : 'Home country is required.',
    dob: form.dob ? undefined : 'Date of birth is required.',
    profession: form.profession ? undefined : 'Profession is required.',
    email: validateEmail(form.email),
    password,
    confirmPassword,
  };
}

function mapSupabaseError(message: string): string {
  if (/already registered/i.test(message)) {
    return 'An account with this email already exists. Log in instead.';
  }
  if (/password should be at least/i.test(message)) {
    return 'Password must be at least 8 characters.';
  }
  return message;
}

export default function SignupPage() {
  const { form, fieldErrors, formError, setFormError, handleChange, bindValue, runValidation } =
    useFormState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    if (!runValidation(validate)) return;

    try {
      setLoading(true);
      const { error } = await createClient().auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          // Copied into public.profiles by the handle_new_user trigger.
          data: {
            full_name: `${form.firstName.trim()} ${form.surname.trim()}`,
            home_country: form.homeCountry,
            date_of_birth: form.dob,
            profession: form.profession,
          },
        },
      });

      if (error) {
        setFormError(mapSupabaseError(error.message));
        return;
      }

      setSuccess(true);
    } catch (err) {
      setFormError(errorMessage(err, 'Something went wrong while signing up.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-auth">
        <div className="auth-card wide">
          <h1>Check your email</h1>
          <p className="auth-subtext">
            Check your email to confirm your account. Once confirmed, you can log in
            and pick up where you left off.
          </p>
          <p className="auth-footer-text">
            <Link href="/login">Back to log in</Link>
          </p>
          <p className="auth-footer-text">
            Or continue as <Link href="/onboarding">Guest</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-auth">
      <div className="auth-card wide">
        <h1>Sign up</h1>
        <p className="auth-subtext">
          Save your move plans, track your checklist, and access them from anywhere in
          the Caribbean.
        </p>

        {formError && <div className="form-error">{formError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="signup-grid">
            <FormField
              label="Full Name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              autoComplete="given-name"
              error={fieldErrors.firstName}
              required
            />
            <FormField
              label="Surname"
              name="surname"
              value={form.surname}
              onChange={handleChange}
              autoComplete="family-name"
              error={fieldErrors.surname}
              required
            />
            <Select
              label="Home Country"
              name="homeCountry"
              value={form.homeCountry}
              onChange={bindValue('homeCountry')}
              options={COUNTRY_OPTIONS}
              placeholder="Select your country"
              error={fieldErrors.homeCountry}
              required
            />
            <FormField
              label="Date of Birth"
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              autoComplete="bday"
              error={fieldErrors.dob}
              required
            />
            <Select
              label="Profession (CSME skill category)"
              labelClassName="form-label full-row"
              name="profession"
              value={form.profession}
              onChange={bindValue('profession')}
              options={CATEGORY_OPTIONS}
              placeholder="Select your profession"
              error={fieldErrors.profession}
              required
            />
            <FormField
              label="Email"
              labelClassName="form-label full-row"
              type="email"
              name="email"
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
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              error={fieldErrors.password}
              required
            />
            <FormField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              error={fieldErrors.confirmPassword}
              required
            />
          </div>

          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
        <p className="auth-footer-text">
          Or continue as <Link href="/onboarding">Guest</Link>
        </p>
      </div>
    </div>
  );
}
