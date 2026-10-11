

export function inputCls(error: string | null | undefined, extra = ""): string {
  return [
    "w-full px-3.5 py-2.5 rounded-xl border text-sm font-normal text-foreground placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 transition-all",
    error
      ? "border-red-300 bg-background focus:border-red-400 focus:ring-red-100"
      : "border-border bg-muted focus:border-primary focus:ring-ring/10",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}
