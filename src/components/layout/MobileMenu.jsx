"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import Link from "next/link";

const NAV_LINKS = [
  { name: "Beranda", href: "/" },
  { name: "Destinasi Trip", href: "/trips" },
  { name: "Private Trip", href: "/private" },
  { name: "Tentang Kami", href: "/about" },
];

const cn = (...classes) => classes.filter(Boolean).join(" ");

function NavbarLink({ href, children, className, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("block rounded-lg text-sm font-medium transition-colors", className)}
    >
      {children}
    </Link>
  );
}

export default function MobileMenu({ isOpen, setIsOpen, isScrolled }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const previousOverflow = document.body.style.overflow;

    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, mounted]);

  if (!mounted) {
    return null;
  }

  const mobileMenuClasses = cn(
    "lg:hidden fixed inset-y-0 left-0 top-0 z-60 h-full w-3/4 max-w-xs transform overflow-hidden bg-white shadow-2xl transition-transform duration-300 ease-in-out",
    isOpen ? "translate-x-0" : "-translate-x-full"
  );

  const overlayClasses = cn(
    "lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
  );

  const mobileLinkClasses = "px-3 py-2 text-black hover:bg-black/10 rounded-lg transition-colors";

  const activeLinkClasses = "px-3 py-2 text-[#F49D1A] rounded-lg transition-colors";

  return createPortal(
    <>
      <div
        className={overlayClasses}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      <div className={mobileMenuClasses}>
        <div className="flex h-full flex-col justify-start px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/Jelajah-Memoria-01.png" alt="Jelajah Memoria" className="h-24 w-auto" />
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full text-black hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#F49D1A]"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {NAV_LINKS.map((link) => (
              <NavbarLink
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={pathname === link.href ? activeLinkClasses : mobileLinkClasses}
              >
                {link.name}
              </NavbarLink>
            ))}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
