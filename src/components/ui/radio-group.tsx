"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { cn } from "cn"

function RadioGroup({
  className,
  ...props
}: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid gap-2", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-input bg-background shadow-sm focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator className="flex items-center justify-center">
        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
