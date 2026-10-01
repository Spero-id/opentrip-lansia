"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppFloat from "./WhatsAppFloat";

const HIDDEN_PREFIXES = ["/login", "/register", "/forbidden", "/admin", "/dashboard"];
const FLOAT_EXACT = ["/", "/blog", "/private"];
const FLOAT_PREFIX = "/trips";

function isHidden(pathname: string): boolean {
  return HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function showFloat(pathname: string): boolean {
  if (FLOAT_EXACT.includes(pathname)) return true;
  return pathname === FLOAT_PREFIX || pathname.startsWith(`${FLOAT_PREFIX}/`);
}

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isHidden(pathname)) return <>{children}</>;
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      {showFloat(pathname) && <WhatsAppFloat />}
    </>
  );
}
