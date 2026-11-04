"use client";

import { Select } from "@/components/ui/Select";
import { countryName } from "@/lib/constants";
import { COUNTRY_OPTIONS } from "@/lib/options";

interface Step2DestinationProps {
  value: string;
  onChange: (value: string) => void;
  excludeCode: string;
}

export default function Step2Destination({
  value,
  onChange,
  excludeCode,
}: Step2DestinationProps) {
  return (
    <div className="wizard-step">
      <Select
        label="Where are you moving TO?"
        value={value}
        onChange={onChange}
        options={COUNTRY_OPTIONS}
        exclude={[excludeCode]}
        placeholder="Select destination country"
        required
      />
      {excludeCode && (
        <p className="checklist-description">
          Home country selected:{" "}
          <strong className="text-strong">{countryName(excludeCode)}</strong>
        </p>
      )}
    </div>
  );
}
