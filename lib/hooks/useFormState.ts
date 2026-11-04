'use client';

import { useState, type ChangeEvent } from 'react';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/**
 * Controlled form state for simple auth/profile forms: field values, per-field
 * errors (cleared as the user edits that field) and a form-level error.
 */
export function useFormState<T extends Record<string, string>>(initial: T) {
  const [form, setForm] = useState<T>(initial);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<T>>({});
  const [formError, setFormError] = useState('');

  /** Set one field, clearing its error and the form-level error. */
  const setValue = (name: keyof T, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setFormError('');
  };

  /** onChange handler for inputs whose `name` matches a form field. */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setValue(e.target.name as keyof T, e.target.value);

  /** onChange for <Select>, which reports the value only. */
  const bindValue = (name: keyof T) => (value: string) => setValue(name, value);

  /**
   * Run a validator (return a message or undefined per field); stores the
   * errors and returns whether the form is valid.
   */
  const runValidation = (
    validate: (values: T) => Partial<Record<keyof T, string | undefined>>
  ): boolean => {
    const errors = Object.fromEntries(
      Object.entries(validate(form)).filter(([, message]) => message)
    ) as FieldErrors<T>;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return {
    form,
    setForm,
    fieldErrors,
    formError,
    setFormError,
    handleChange,
    bindValue,
    runValidation,
  };
}

export const MIN_PASSWORD_LENGTH = 8;

/** Rules for choosing a password (signup and password reset). */
export function validateNewPassword(
  password: string,
  confirmPassword: string
): { password?: string; confirmPassword?: string } {
  let passwordError: string | undefined;
  if (!password) passwordError = 'Password is required.';
  else if (password.length < MIN_PASSWORD_LENGTH) {
    passwordError = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  let confirmError: string | undefined;
  if (!confirmPassword) confirmError = 'Please confirm your password.';
  else if (password && password !== confirmPassword) confirmError = 'Passwords do not match.';

  return { password: passwordError, confirmPassword: confirmError };
}

/** Shared email validation used by login and signup. */
export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Email is required.';
  if (!EMAIL_RE.test(email.trim())) return 'Enter a valid email address.';
  return undefined;
}
