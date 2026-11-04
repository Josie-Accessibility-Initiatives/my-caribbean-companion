import type { ReactNode, SelectHTMLAttributes } from "react";

export type SelectOption = { value: string; label: string };

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & {
  label?: ReactNode;
  options: SelectOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  /** Hide these option values (e.g. the home country when picking a destination). */
  exclude?: string[];
  error?: string;
  labelClassName?: string;
};

/** Labelled <select> with a placeholder option, used by every country/profession picker. */
export function Select({
  label,
  options,
  placeholder,
  onChange,
  exclude,
  error,
  labelClassName = "form-label",
  className = "form-select",
  ...rest
}: SelectProps) {
  const visible = exclude?.length
    ? options.filter((o) => !exclude.includes(o.value))
    : options;

  const select = (
    <select className={className} onChange={(e) => onChange(e.target.value)} {...rest}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {visible.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );

  if (!label) return select;

  return (
    <label className={labelClassName}>
      {typeof label === "string" ? <span>{label}</span> : label}
      {select}
      {error && <span className="form-error">{error}</span>}
    </label>
  );
}
