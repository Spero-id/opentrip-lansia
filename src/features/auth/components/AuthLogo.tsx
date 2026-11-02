import Image from "next/image";
import { cn } from "@/lib/utils";

interface AuthLogoProps {
  src?: string;
  alt?: string;
  className?: string;
}

// Brand block shared by AuthAside (desktop photo column) and the mobile-only
// anchor that AuthShell renders above the form.
export default function AuthLogo({ src = "/Jelajah-Memoria-01.png", alt = "Jelajah Memoria", className }: AuthLogoProps) {
  return (
    <div className={cn("relative z-10 flex items-center self-start", className)}>
      <Image
        src={src}
        alt={alt}
        width={4088}
        height={2319}
        className="h-12 w-auto"
      />
    </div>
  );
}
