"use client";

import { Select } from "@/components/ui/Select";
import { CATEGORIES } from "@/lib/constants";
import { CATEGORY_OPTIONS } from "@/lib/options";

interface Step3CategoryProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Step3Category({ value, onChange }: Step3CategoryProps) {
  const selected = CATEGORIES.find((c) => c.code === value);

  return (
    <div className="wizard-step">
      <Select
        label="What is your professional category?"
        value={value}
        onChange={onChange}
        options={CATEGORY_OPTIONS}
        placeholder="Select your category"
        required
      />
      {selected?.description && (
        <div className="planner-card secondary mt-1">
          <p className="no-margin text-body">{selected.description}</p>
        </div>
      )}
    </div>
  );
}
