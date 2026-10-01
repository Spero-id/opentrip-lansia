import type { ReactNode, ComponentType } from "react";

interface SectionHeadingProps {
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
  className?: string;
}

export default function SectionHeading({ icon: _Icon, children, className = "" }: SectionHeadingProps) {
  return (
    <div className={`mb-6 flex items-center gap-3 ${className}`}>
      
      <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
        {children}
      </h2>
    </div>
  );
}