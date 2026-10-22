"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { LogOut, Shield, ShoppingBag, User, X } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth/client";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    "h-11 w-full cursor-pointer justify-start rounded-lg px-3",
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
  const { data: session } = useSession();
  const { logout } = useLogout();
  const sessionUser = session?.user ?? null;
  const sessionRole = (sessionUser as { role?: string } | null)?.role;
  const isLoggedIn = Boolean(sessionUser);
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
            <div className="space-y-1.5">
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
              <div className="mt-6 space-y-1.5">
                <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                  <Avatar size="lg" className="bg-primary">
                    {sessionUser?.image && (
                      <AvatarImage src={sessionUser.image} alt="" />
                    )}
                    <AvatarFallback className="text-primary-foreground">
                      {sessionUser?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {sessionUser?.name || "Pengguna"}
                    </p>
                    <p className="truncate text-xs font-medium text-muted-foreground">
                      {sessionRole === "admin"
                        ? "Admin"
                        : sessionRole === "agent"
                          ? "Agen"
                          : "Member"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <MenuItem
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="gap-3"
                  >
                    <User className="size-4 shrink-0" />
                    Profil
                  </MenuItem>
                  <MenuItem
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="gap-3"
                  >
                    <Shield className="size-4 shrink-0" />
                    Halaman Admin
                  </MenuItem>
                  <MenuItem
                    href="/my-trips"
                    onClick={() => setIsOpen(false)}
                    className="gap-3"
                  >
                    <ShoppingBag className="size-4 shrink-0" />
                    Perjalanan Saya
                  </MenuItem>
                </div>
              </div>
            )}
            {isLoggedIn && (
              <div className="mt-4 pt-2">
                <div className="px-3">
                  <div className="border-t border-border" />
                </div>
                <div className="mt-2">
                  <MenuItem
                    onClick={async () => {
                      setIsOpen(false);
                      await logout();
                    }}
                    className="gap-3 text-destructive hover:bg-red-50 hover:text-destructive"
                  >
                    <LogOut className="size-4 shrink-0" />
                    Log Out
                  </MenuItem>
                </div>
              </div>
            )}
          </div>
          {!isLoggedIn && (
            <div className="grid grid-cols-2 gap-2 border-t border-border px-4 pb-2 pt-4">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className={`${cn(buttonVariants({ variant: "outline", size: "lg" }))} w-full`}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className={`${cn(buttonVariants({ variant: "default", size: "lg" }))} w-full`}
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
