"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { X, LogOut, User, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "@/lib/auth/client";

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

const NAV_LINKS = [
  { name: "Beranda", href: "/" },
  { name: "Destinasi Trip", href: "/trips" },
  { name: "Private Trip", href: "/private-trip" },
  { name: "Blog", href: "/blog" },
  { name: "Hubungi Kami", href: "/contact" },
];

import type { MouseEventHandler, ReactNode } from "react";

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

interface MenuItemProps {
  href?: string;
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler;
}

function MenuItem({ href, children, className, onClick }: MenuItemProps) {
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

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isScrolled?: boolean;
}

export default function MobileMenu({ isOpen, setIsOpen, isScrolled: _isScrolled }: MobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const isClient = useIsClient();

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isClient) {
    return null;
  }

  const mobileMenuClasses = cn(
    "lg:hidden fixed inset-y-0 left-0 top-0 z-60 h-full w-4/5 max-w-sm transform overflow-hidden bg-card shadow-2xl transition-transform duration-300 ease-in-out",
    isOpen ? "translate-x-0" : "-translate-x-full"
  );

  const overlayClasses = cn(
    "lg:hidden fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300",
    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
  );

  const sectionLabelClasses = "px-3 text-sm font-medium tracking-wide text-muted-foreground";
  const mobileLinkClasses = "block w-full rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-foreground/10 transition-colors";

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
              className="p-2 rounded-full text-foreground hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-primary"
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
                <div className="space-y-3">
                  <MenuItem
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className={pathname === "/profile" ? activeLinkClasses : mobileLinkClasses}
                  >
                    Profil Saya
                  </MenuItem>
                  <MenuItem
                    href="/my-trips"
                    onClick={() => setIsOpen(false)}
                    className={pathname === "/my-trips" ? activeLinkClasses : mobileLinkClasses}
                  >
                    Riwayat Trip
                  </MenuItem>
                </div>
                <div className="mt-4 pt-4">
                  <div className="px-3">
                    <div className="border-t border-border" />
                  </div>
                  <div className="mt-3">
                    <MenuItem
                      onClick={async () => {
                        setIsOpen(false);
                        await signOut();
                        router.refresh();
                      }}
                      className="block w-full cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-destructive-600 hover:bg-destructive-50 transition-colors text-left"
                    >
                      Keluar dari Akun
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
