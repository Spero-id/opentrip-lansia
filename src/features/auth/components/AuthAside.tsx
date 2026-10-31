"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import AuthLogo from "./AuthLogo";

interface AuthAsideProps {
  image: string;
  title: ReactNode;
  description: string;
  // Logo defaults to the Jelajah Memoria asset; logoSrc/logoAlt/logoHref let a
  // page swap the brand block without restyling the aside. The intrinsic
  // width/height below must match the swapped asset's aspect ratio.
  logoSrc?: string;
  logoAlt?: string;
  logoHref?: string;
  wrapperClassName?: string;
  gradientClassName?: string;
}

export default function AuthAside({
  image,
  title,
  description,
  logoSrc = "/Jelajah-Memoria-01.png",
  logoAlt = "Jelajah Memoria",
  logoHref = "/",
  wrapperClassName,
  gradientClassName,
}: AuthAsideProps) {
  return (
    <div
      className={cn(
        "shrink-0 relative hidden lg:flex flex-col justify-between p-6 lg:p-10 h-56 lg:h-auto bg-cover bg-center",
        wrapperClassName,
      )}
      style={{
        backgroundImage: `url('${image}')`,
      }}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/70",
          gradientClassName,
        )}
      />

      <AuthLogo src={logoSrc} alt={logoAlt} href={logoHref} />

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
