"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthAsideProps {
  image: string;
  title: ReactNode;
  description: string;
  wrapperClassName?: string;
  gradientClassName?: string;
}

export default function AuthAside({
  image,
  title,
  description,
  wrapperClassName,
  gradientClassName,
}: AuthAsideProps) {
  return (
    <div
      className={cn(
        "shrink-0 relative hidden lg:flex flex-col justify-between p-6 lg:p-10 h-56 lg:min-h-[650px] lg:h-auto bg-cover bg-center",
        wrapperClassName
      )}
      style={{
        backgroundImage: `url('${image}')`,
      }}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/70",
          gradientClassName
        )}
      />

      <Link
        href="/"
        className="relative z-10 flex items-center gap-2 text-primary font-bold text-lg"
      >
        <img
          src="/Jelajah-Memoria-01.png"
          alt="Jelajah Memoria"
          className="h-14 w-auto"
        />
      </Link>

      <div className="relative z-10">
        <h2 className="text-xl lg:text-3xl font-bold text-white leading-snug mb-1 lg:mb-3">
          {title}
        </h2>
        <p className="hidden lg:block text-white/70 text-sm max-w-sm">
          {description}
        </p>
      </div>
    </div>
  );
}
