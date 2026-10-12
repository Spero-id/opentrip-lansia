import * as React from "react"
import { cn } from "cn"

// Base UI tidak menyediakan komponen Label mandiri (label hidup di Field.Label),
// jadi Label ini native <label> dengan styling yang sama — tanpa dependensi Radix.
const Label = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<"label">
>(({ className, ...props }, ref) => (
  // eslint-disable-next-line jsx-a11y/label-has-associated-control
  <label
    ref={ref}
    data-slot="label"
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }
