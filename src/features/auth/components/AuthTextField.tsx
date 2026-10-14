"use client";

import { Input } from "@/components/ui/input";

interface AuthTextFieldProps
  extends Omit<React.ComponentProps<typeof Input>, "type"> {
  label: string;
  type?: string;
  error?: string;
}

export default function AuthTextField({
  label,
  type = "text",
  error,
  ...inputProps
}: AuthTextFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>
      <Input
        {...inputProps}
        type={type}
        aria-invalid={error ? true : undefined}
        className="w-full"
      />
      {/* Always render this slot so the form height stays stable when an error appears */}
      <div className="min-h-[32px] pt-1.5">
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
