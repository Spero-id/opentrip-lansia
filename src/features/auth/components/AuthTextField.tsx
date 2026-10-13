"use client";

import { Input } from "@/components/ui/input";

interface AuthTextFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export default function AuthTextField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: AuthTextFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full"
      />
    </div>
  );
}
