'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import countries from '@/data/countries.json';

type Country = {
  id: number;
  code: string;
  name: string;
};

type FormState = {
  firstName: string;
  surname: string;
  homeCountry: string;
  dob: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM: FormState = {
  firstName: '',
  surname: '',
  homeCountry: '',
  dob: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function SignupPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const countryOptions = useMemo(
    () =>
      (countries as Country[])
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

    if (!form.firstName.trim()) errors.firstName = 'Full name is required.';
    if (!form.surname.trim()) errors.surname = 'Surname is required.';
    if (!form.homeCountry) errors.homeCountry = 'Home country is required.';
    if (!form.dob) errors.dob = 'Date of birth is required.';

    if (!form.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!EMAIL_RE.test(form.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }

    if (!form.password) {
      errors.password = 'Password is required.';
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (form.password && form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    return errors;
  };

  const mapSupabaseError = (message: string): string => {
    if (/already registered/i.test(message)) {
      return 'An account with this email already exists. Log in instead.';
    }
    if (/password should be at least/i.test(message)) {
      return 'Password must be at least 8 characters.';
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
      const { error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name: `${form.firstName.trim()} ${form.surname.trim()}`,
            home_country: form.homeCountry,
            date_of_birth: form.dob,
          },
        },
      });

      if (error) {
        setFormError(mapSupabaseError(error.message));
        return;
      }

      setSuccess(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong while signing up.';
      setFormError(message);
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
            <label className="form-label">
              Full Name
              <input
                type="text"
                name="firstName"
                className="form-input"
                value={form.firstName}
                onChange={handleChange}
                autoComplete="given-name"
                required
              />
              {fieldErrors.firstName && (
                <span className="form-error">{fieldErrors.firstName}</span>
              )}
            </label>

            <label className="form-label">
              Surname
              <input
                type="text"
                name="surname"
                className="form-input"
                value={form.surname}
                onChange={handleChange}
                autoComplete="family-name"
                required
              />
              {fieldErrors.surname && (
                <span className="form-error">{fieldErrors.surname}</span>
              )}
            </label>

            <label className="form-label">
              Home Country
              <select
                name="homeCountry"
                className="form-select"
                value={form.homeCountry}
                onChange={handleChange}
                required
              >
                <option value="">Select your country</option>
                {countryOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              {fieldErrors.homeCountry && (
                <span className="form-error">{fieldErrors.homeCountry}</span>
              )}
            </label>

            <label className="form-label">
              Date of Birth
              <input
                type="date"
                name="dob"
                className="form-input"
                value={form.dob}
                onChange={handleChange}
                autoComplete="bday"
                required
              />
              {fieldErrors.dob && (
                <span className="form-error">{fieldErrors.dob}</span>
              )}
            </label>

            <label className="form-label full-row">
              Email
              <input
                type="email"
                name="email"
                className="form-input"
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
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
              {fieldErrors.password && (
                <span className="form-error">{fieldErrors.password}</span>
              )}
            </label>

            <label className="form-label">
              Confirm Password
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              {fieldErrors.confirmPassword && (
                <span className="form-error">{fieldErrors.confirmPassword}</span>
              )}
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary full-width"
            disabled={loading}
          >
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
