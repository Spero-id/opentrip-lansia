"use client";

import { useState } from "react";
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

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>
      <div className="relative">
        <Input
          {...inputProps}
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
      {/* Always render this slot so the form height stays stable when an error appears */}
      <div className="min-h-[32px] pt-1.5">
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
