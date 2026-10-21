"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, User, ShoppingBag, LogOut, Shield } from "lucide-react";
import { useSession, signOut } from "@/lib/auth/client";
import MobileMenu from "@/components/layout/MobileMenu";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Beranda", href: "/" },
  { name: "Destinasi Trip", href: "/trips" },
  { name: "Private Trip", href: "/private-trip" },
  { name: "Blog", href: "/blog" },
  { name: "Hubungi Kami", href: "/contact" },
];

// Approximate text widths (Tailwind spacing) so the loading skeleton of each
// nav link matches the width of the label it is standing in for.
const NAV_SKELETON_WIDTHS = ["w-14", "w-24", "w-20", "w-10", "w-24"];

import type { MouseEventHandler, ReactNode } from "react";

interface NavbarLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler;
}

function NavbarLink({ href, children, className, onClick }: NavbarLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "block rounded-lg text-sm font-medium transition-colors",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const sessionUser = session?.user ?? null;
  const sessionRole = (sessionUser as { role?: string } | null)?.role;

  const navClasses = cn(
    "w-full p-2 sticky top-0 z-40 bg-background shadow-lg border-b border-border",
  );

  const logoClasses = cn(
    "flex items-center gap-2 text-xl font-bold text-foreground",
  );

  const desktopLinkClasses =
    "hidden lg:flex font-medium text-sm text-foreground hover:text-primary";

  const loginButtonClasses = cn(buttonVariants(), "font-poppins");

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 shrink-0">
            {isPending ? (
              <div
                className="h-12 w-24 animate-pulse rounded-lg bg-muted"
                aria-hidden="true"
              />
            ) : (
              <Link href="/" className={logoClasses}>
                <Image
                  src="/Jelajah-Memoria-01.png"
                  alt="Jelajah Memoria"
                  width={4088}
                  height={2319}
                  priority
                  className="h-12 w-auto"
                />
              </Link>
            )}
          </div>

          <div className="ml-auto flex flex-1 items-center justify-end gap-4">
            <div className="hidden lg:flex flex-1 items-center justify-center space-x-8">
              {isPending
                ? NAV_LINKS.map((link, index) => (
                    <span
                      key={link.name}
                      className={cn(
                        "h-4 animate-pulse rounded bg-muted",
                        NAV_SKELETON_WIDTHS[index],
                      )}
                      aria-hidden="true"
                    />
                  ))
                : NAV_LINKS.map((link) => (
                    <NavbarLink
                      key={link.name}
                      href={link.href}
                      className={desktopLinkClasses}
                    >
                      {link.name}
                    </NavbarLink>
                  ))}
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              {isPending ? (
                <div
                  className="flex items-center gap-2 rounded-full p-1 sm:pr-3"
                  aria-hidden="true"
                >
                  <span className="hidden flex-col items-end gap-1.5 sm:flex">
                    <span className="h-4 w-24 animate-pulse rounded bg-muted" />
                    <span className="h-3 w-14 animate-pulse rounded bg-muted" />
                  </span>
                  <span className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />
                </div>
              ) : sessionUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="Menu akun"
                    className={cn(
                      "relative flex items-center gap-2 rounded-full p-1 sm:pr-3 cursor-pointer focus:outline-none",
                    )}
                  >
                    <span className="hidden sm:flex flex-col items-end leading-tight text-left">
                      <span
                        className={cn(
                          "max-w-[140px] truncate text-sm font-semibold text-foreground",
                        )}
                      >
                        {sessionUser.name || "Pengguna"}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] font-medium text-muted-foreground",
                        )}
                      >
                        {sessionRole === "admin"
                          ? "Admin"
                          : sessionRole === "agent"
                            ? "Agen"
                            : "Member"}
                      </span>
                    </span>

                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm overflow-hidden">
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                        {sessionUser.name
                          ? sessionUser.name.charAt(0).toUpperCase()
                          : "U"}
                      </span>
                      {sessionUser.image && (
                        <img
                          key={sessionUser.image}
                          src={sessionUser.image}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      )}
                    </span>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem
                      className="gap-3 px-3 py-2.5 font-medium text-foreground"
                      render={<Link href="/profile" />}
                    >
                      <User className="w-4 h-4 shrink-0" />
                      Profil
                    </DropdownMenuItem>
                    {sessionRole === "admin" && (
                      <DropdownMenuItem
                        className="gap-3 px-3 py-2.5 font-medium text-foreground"
                        render={<Link href="/admin" />}
                      >
                        <Shield className="w-4 h-4 shrink-0" />
                        Halaman Admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="gap-3 px-3 py-2.5 font-medium text-foreground"
                      render={<Link href="/my-trips" />}
                    >
                      <ShoppingBag className="w-4 h-4 shrink-0" />
                      Perjalanan Saya
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="mx-0" />

                    <DropdownMenuItem
                      variant="destructive"
                      className="gap-3 px-3 py-2.5 font-medium"
                      onClick={async () => {
                        await signOut();
                        router.push("/login");
                        router.refresh();
                      }}
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden items-center gap-2 lg:flex">
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "font-poppins",
                    )}
                  >
                    Masuk
                  </Link>
                  <Link href="/register" className={loginButtonClasses}>
                    Daftar
                  </Link>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen((current) => !current)}
              className={cn("lg:hidden", "text-slate-700 hover:text-slate-700")}
              aria-label="Toggle menu"
            >
              <Menu size={24} className="size-6" />
            </Button>
          </div>
        </div>
      </div>

      <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} />
    </nav>
  );
}
