import * as React from "react"
import { cn } from "cn"

const textareaVariants = {
  sm: "min-h-[60px] px-2.5 text-xs rounded-md",
  default: "min-h-[80px] px-3 text-sm rounded-md",
  lg: "min-h-[100px] px-4 text-base rounded-lg",
  xl: "min-h-[120px] px-6 text-lg rounded-xl",
}

type TextareaSize = "sm" | "default" | "lg" | "xl"

function Textarea({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"textarea"> & { size?: "sm" | "default" | "lg" | "xl" }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex w-full border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        textareaVariants[size],
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
export type { TextareaSize }