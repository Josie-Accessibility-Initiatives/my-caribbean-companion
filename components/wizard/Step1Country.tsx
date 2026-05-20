"use client";

import type { Country } from "@/lib/api";

interface Step1CountryProps {
  value: string;
  onChange: (value: string) => void;
  countries: Country[];
}

export default function Step1Country({
  value,
  onChange,
  countries,
}: Step1CountryProps) {
  return (
    <div className="wizard-step">
      <label className="form-label">
        <span>Where are you moving FROM?</span>
        <select
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          className="form-select"
          required
        >
          <option value="">Select your home country</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
