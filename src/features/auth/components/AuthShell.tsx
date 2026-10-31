"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  aside: ReactNode;
  children: ReactNode;
  contentClassName?: string;
  /** Mobile-only brand row (desktop shows the logo inside the aside). */
  brand?: ReactNode;
}

export default function AuthShell({ aside, children, contentClassName, brand }: AuthShellProps) {
  return (
    <div className="fixed inset-0 overflow-hidden lg:static lg:h-screen bg-background flex flex-col lg:flex">
      <div className="flex flex-col flex-1 min-h-0 lg:h-full lg:flex-none w-full lg:grid lg:grid-cols-2 lg:grid-rows-1 overflow-hidden">
        {aside}
        {/* A single always-visible wrapper owns the auto margins. Keying them
            on first/last DOM children silently broke once a mobile-only child
            (lg:hidden brand) became the first child - a display:none element
            creates no margin box on that breakpoint, so the mt-auto vanished
            and the column top-anchored. Auto margins here center the block
            when it fits and collapse to 0 on overflow so the column stays
            scrollable from the very top (justify-content would keep
            centering and clip the top away). */}
        <div
          className={cn(
            "relative flex-1 min-h-0 overflow-y-auto bg-background p-10 flex flex-col lg:w-full lg:mx-auto lg:max-w-xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
            contentClassName
          )}
        >
          <div className="mt-auto mb-auto">
            {brand}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
