import * as React from "react"
import { cn } from "cn"

export interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  contentClassName?: string
}

function FormSection({
  title,
  description,
  children,
  className,
  titleClassName,
  descriptionClassName,
  contentClassName,
}: FormSectionProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 shadow-sm", className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className={cn("text-lg font-semibold text-foreground", titleClassName)}>
              {title}
            </h3>
          )}
          {description && (
            <p className={cn("text-sm text-muted-foreground mt-1", descriptionClassName)}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className={cn("space-y-4", contentClassName)}>
        {children}
      </div>
    </div>
  )
}

export { FormSection }