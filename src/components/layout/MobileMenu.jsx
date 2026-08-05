"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { X, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "@/lib/auth-client";

const NAV_LINKS = [
  { name: "Beranda", href: "/" },
  { name: "Destinasi Trip", href: "/trips" },
  { name: "Private Trip", href: "/private" },
  { name: "Tentang Kami", href: "/about" },
];

const cn = (...classes) => classes.filter(Boolean).join(" ");

function MenuItem({ href, children, className, onClick }) {
  const commonClasses = cn("block w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left", className);

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={commonClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={commonClasses}>
      {children}
    </button>
  );
}

export default function MobileMenu({ isOpen, setIsOpen, isScrolled }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);
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

  const sectionLabelClasses = "px-3 text-xs font-medium tracking-wide text-gray-400";
  const mobileLinkClasses = "block w-full rounded-lg px-3 py-2 text-sm font-medium text-black hover:bg-black/10 transition-colors";

  const activeLinkClasses = mobileLinkClasses;

  return createPortal(
    <>
      <div
        className={overlayClasses}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      <div className={mobileMenuClasses}>
        <div className="flex h-full flex-col px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
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

          <div className="mt-6 flex-1 min-h-0 overflow-y-auto pr-1">
            <div className="space-y-3">
              <div className={sectionLabelClasses}>Menu</div>
              {NAV_LINKS.map((link) => (
                <MenuItem
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={pathname === link.href ? activeLinkClasses : mobileLinkClasses}
                >
                  {link.name}
                </MenuItem>
              ))}
            </div>
            {isLoggedIn && (
              <div className="mt-8 space-y-3">
                <div className={sectionLabelClasses}>Akun</div>
                <div className="space-y-1">
                  <MenuItem
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className={pathname === "/profile" ? activeLinkClasses : mobileLinkClasses}
                  >
                    Pengaturan Profil
                  </MenuItem>
                </div>
                <div className="mt-4 pt-4">
                  <div className="px-3">
                    <div className="border-t border-gray-200" />
                  </div>
                  <div className="mt-3">
                    <MenuItem
                      onClick={async () => {
                        setIsOpen(false);
                        await signOut();
                        router.refresh();
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <LogOut size={16} className="text-red-600" />
                        <span>Keluar</span>
                      </div>
                    </MenuItem>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
