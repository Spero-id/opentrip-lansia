"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AuthLogoProps {
  // Defaults are the Jelajah Memoria brand block. The intrinsic
  // width/height below must match the swapped asset's aspect ratio.
  src?: string;
  alt?: string;
  href?: string;
  className?: string;
}

// Brand block shared by AuthAside (desktop photo column) and the mobile-only
// anchor that AuthShell renders above the form.
export default function AuthLogo({ src = "/Jelajah-Memoria-01.png", alt = "Jelajah Memoria", href = "/", className }: AuthLogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "relative z-10 flex items-center gap-2 self-start text-primary font-bold text-lg",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={4088}
        height={2319}
        className="h-12 w-auto"
      />
    </Link>
  );
}
