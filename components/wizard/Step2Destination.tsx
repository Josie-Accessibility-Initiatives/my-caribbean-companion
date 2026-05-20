"use client";

import type { Country } from "@/lib/api";

interface Step2DestinationProps {
  value: string;
  onChange: (value: string) => void;
  countries: Country[];
  excludeCode: string;
}

export default function Step2Destination({
  value,
  onChange,
  countries,
  excludeCode,
}: Step2DestinationProps) {
  const filtered = countries.filter((c) => c.code !== excludeCode);
  const home = countries.find((c) => c.code === excludeCode);

  return (
    <div className="wizard-step">
      <label className="form-label">
        <span>Where are you moving TO?</span>
        <select
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          className="form-select"
          required
        >
          <option value="">Select destination country</option>
          {filtered.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      {home && (
        <p className="checklist-description">
          Home country selected:{" "}
          <strong style={{ color: "#111827" }}>{home.name}</strong>
        </p>
      )}
    </div>
  );
}
