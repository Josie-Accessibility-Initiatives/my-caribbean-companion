"use client";

import type { Category } from "@/lib/api";

interface Step3CategoryProps {
  value: string;
  onChange: (value: string) => void;
  categories: Category[];
}

export default function Step3Category({
  value,
  onChange,
  categories,
}: Step3CategoryProps) {
  const selected = categories.find((c) => c.code === value);

  return (
    <div className="wizard-step">
      <label className="form-label">
        <span>What is your professional category?</span>
        <select
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          className="form-select"
          required
        >
          <option value="">Select your category</option>
          {categories.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      {selected?.description && (
        <div className="planner-card secondary" style={{ marginTop: "0.75rem" }}>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#4b5563" }}>
            {selected.description}
          </p>
        </div>
      )}
    </div>
  );
}
