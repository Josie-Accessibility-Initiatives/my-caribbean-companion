import type { InputHTMLAttributes, ReactNode } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  error?: string;
  labelClassName?: string;
};

/** Labelled text input with an inline error message. */
export function FormField({
  label,
  error,
  labelClassName = "form-label",
  className = "form-input",
  ...input
}: FormFieldProps) {
  return (
    <label className={labelClassName}>
      {label}
      <input className={className} {...input} />
      {error && <span className="form-error">{error}</span>}
    </label>
  );
}
