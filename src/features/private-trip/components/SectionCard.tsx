import type { ReactNode } from "react";

export default function SectionCard({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-5">
        <span
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `color-mix(in srgb, var(--primary) 8%, transparent)` }}
        >
          {icon}
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}
