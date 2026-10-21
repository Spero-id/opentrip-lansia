"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "@/lib/auth/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
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

interface MenuItemProps {
  href?: string;
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler;
}

function MenuItem({ href, children, className, onClick }: MenuItemProps) {
  const commonClasses = cn(
    "w-full cursor-pointer justify-start rounded-lg px-3 py-2",
    className,
  );

  if (href) {
    return (
      <Button
        variant="ghost"
        nativeButton={false}
        render={<Link href={href} onClick={onClick} />}
        className={commonClasses}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      type="button"
      onClick={onClick}
      className={commonClasses}
    >
      {children}
    </Button>
  );
}

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function MobileMenu({ isOpen, setIsOpen }: MobileMenuProps) {
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
    "lg:hidden fixed inset-y-0 left-0 top-0 z-60 h-full w-full transform overflow-hidden bg-background shadow-2xl transition-transform duration-300 ease-in-out",
    isOpen ? "translate-x-0" : "-translate-x-full",
  );

  const overlayClasses = cn(
    "lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
    isOpen
      ? "opacity-100 pointer-events-auto"
      : "opacity-0 pointer-events-none",
  );

  const sectionLabelClasses =
    "px-3 text-sm font-medium tracking-wide text-muted-foreground";

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
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2"
            >
              <img
                src="/Jelajah-Memoria-01.png"
                alt="Jelajah Memoria"
                className="h-12 w-auto"
              />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} className="size-5" />
            </Button>
          </div>

          <div className="mt-6 flex-1 min-h-0 overflow-y-auto pr-1">
            <div className="space-y-3">
              <div className={sectionLabelClasses}>Menu</div>
              {NAV_LINKS.map((link) => (
                <MenuItem
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </MenuItem>
              ))}
            </div>
            {isLoggedIn && (
              <div className="mt-8 space-y-3">
                <div className={sectionLabelClasses}>Akun</div>
                <div className="space-y-3">
                  <MenuItem href="/profile" onClick={() => setIsOpen(false)}>
                    Profil Saya
                  </MenuItem>
                  <MenuItem href="/my-trips" onClick={() => setIsOpen(false)}>
                    Riwayat Trip
                  </MenuItem>
                </div>
              </div>
            )}
            {isLoggedIn && (
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
                    className="text-destructive hover:bg-red-50 hover:text-destructive"
                  >
                    Keluar dari Akun
                  </MenuItem>
                </div>
              </div>
            )}
          </div>
          {!isLoggedIn && (
            <div className="grid grid-cols-2 gap-2 border-t border-border px-4 pb-2 pt-4">
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className={`${cn(buttonVariants({ variant: "default", size: "lg" }))} w-full`}
              >
                Daftar
              </Link>
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className={`${cn(buttonVariants({ variant: "outline", size: "lg" }))} w-full`}
              >
                Masuk
              </Link>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
