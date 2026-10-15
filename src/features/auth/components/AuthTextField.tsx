"use client";

import { useId } from "react";
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
  const fieldId = useId();

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-foreground mb-2"
      >
        {label}
      </label>
      <Input
        {...inputProps}
        id={fieldId}
        type={type}
        aria-invalid={error ? true : undefined}
        className="w-full"
      />
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}
