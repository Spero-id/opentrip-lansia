"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppFloat from "./WhatsAppFloat";

const FLOAT_EXACT = ["/", "/blog", "/private"];
const FLOAT_PREFIX = "/trips";

function showFloat(pathname: string): boolean {
  if (FLOAT_EXACT.includes(pathname)) return true;
  return pathname === FLOAT_PREFIX || pathname.startsWith(`${FLOAT_PREFIX}/`);
}

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      {showFloat(pathname) && <WhatsAppFloat />}
    </>
  );
}
