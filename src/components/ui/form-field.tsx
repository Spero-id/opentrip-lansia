"use client"

import * as React from "react"
import { cn } from "cn"
import { Label } from "./label"
import { Input } from "./input"
import { Textarea } from "./textarea"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./select"
import { Checkbox } from "./checkbox"
import { Switch } from "./switch"
import { RadioGroup, RadioGroupItem } from "./radio-group"

export interface FormFieldProps {
  label: string
  name: string
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "date" | "textarea" | "select" | "checkbox" | "switch" | "radio"
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  description?: string
  value?: unknown
  onChange?: (value: unknown) => void
  options?: Array<{ value: string; label: string }>
  radioOptions?: Array<{ value: string; label: string }>
}

function FormField({
  label,
  name,
  type = "text",
  placeholder,
  required,
  disabled,
  error,
  description,
  value,
  onChange,
  options,
  radioOptions,
}: FormFieldProps) {
  const id = `field-${name}`
  const errorId = error ? `${id}-error` : undefined
  const descriptionId = description ? `${id}-description` : undefined
  const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    let newValue: unknown
    if (target.type === "checkbox") {
      newValue = (target as HTMLInputElement).checked
    } else {
      newValue = target.value
    }
    onChange?.(newValue)
  }

  const handleCheckboxChange = (checked: boolean) => {
    onChange?.(checked)
  }

  const handleSwitchChange = (checked: boolean) => {
    onChange?.(checked)
  }

  const handleRadioChange = (val: string) => {
    onChange?.(val)
  }

  const handleSelectChange = (val: string) => {
    onChange?.(val)
  }

  const InputComponent = () => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            id={id}
            name={name}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            value={value as string}
            onChange={handleChange}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy}
            className="w-full"
          />
        )
      case "select":
        return (
          <Select
            onValueChange={(val: string) => onChange?.(val)}
            value={value as string}
            disabled={disabled}
          >
            <SelectTrigger id={id} aria-invalid={!!error} aria-describedby={ariaDescribedBy}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "checkbox":
        return (
          <Checkbox
            id={id}
            name={name}
            checked={value as boolean}
            onCheckedChange={(checked) => onChange?.(checked)}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy}
          />
        )
      case "switch":
        return (
          <Switch
            id={id}
            name={name}
            checked={value as boolean}
            onCheckedChange={(checked) => onChange?.(checked)}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy}
          />
        )
      case "radio":
        return (
          <RadioGroup
            onValueChange={handleRadioChange}
            value={value as string}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy}
          >
            <div className="space-y-2">
              {radioOptions?.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value={opt.value} className="h-4 w-4" />
                  <span className="text-sm text-foreground">{opt.label}</span>
                </label>
              ))}
            </div>
          </RadioGroup>
        )
      default:
        return (
          <Input
            id={id}
            name={name}
            type={type}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            value={value as string}
            onChange={handleChange}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy}
            className="w-full"
          />
        )
    }
  }

  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
      </Label>
      <InputComponent />
      {description && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export { FormField }