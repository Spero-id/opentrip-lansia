"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PasswordFieldProps
  extends Omit<React.ComponentProps<typeof Input>, "type"> {
  error?: string;
  label?: string;
}

export default function PasswordField({
  error,
  label = "Password",
  ...inputProps
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const fieldId = useId();

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-foreground mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <Input
          {...inputProps}
          id={fieldId}
          type={showPassword ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          className="w-full pr-11"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </Button>
      </div>
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}
