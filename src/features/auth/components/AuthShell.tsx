"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  aside: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}

export default function AuthShell({ aside, children, contentClassName }: AuthShellProps) {
  return (
    <div className="fixed inset-0 overflow-hidden lg:static lg:h-screen bg-background flex flex-col lg:flex">
      <div className="flex flex-col flex-1 min-h-0 lg:h-full lg:flex-none w-full lg:grid lg:grid-cols-2 lg:grid-rows-1 overflow-hidden">
        {aside}
        {/* Auto margins center the form vertically when it fits, and collapse to 0 on
            overflow so the column stays scrollable from the very top (justify-content
            would keep centering and clip the top away). */}
        <div
          className={cn(
            "relative flex-1 min-h-0 overflow-y-auto bg-background p-10 flex flex-col [&>*:first-child]:mt-auto [&>*:last-child]:mb-auto lg:w-full lg:mx-auto lg:max-w-xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
            contentClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
