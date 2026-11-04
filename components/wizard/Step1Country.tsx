"use client";

import { Select } from "@/components/ui/Select";
import { COUNTRY_OPTIONS } from "@/lib/options";

interface Step1CountryProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Step1Country({ value, onChange }: Step1CountryProps) {
  return (
    <div className="wizard-step">
      <Select
        label="Where are you moving FROM?"
        value={value}
        onChange={onChange}
        options={COUNTRY_OPTIONS}
        placeholder="Select your home country"
        required
      />
    </div>
  );
}
