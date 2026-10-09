"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, User, ShoppingBag, LogOut, Shield } from "lucide-react";
import { useSession, signOut } from "@/lib/auth/client";
import MobileMenu from "@/components/layout/MobileMenu";

const NAV_LINKS = [
  { name: "Beranda", href: "/" },
  { name: "Destinasi Trip", href: "/trips" },
  { name: "Private Trip", href: "/private-trip" },
  { name: "Blog", href: "/blog" },
  { name: "Hubungi Kami", href: "/contact" },
];

import type { MouseEventHandler, ReactNode } from "react";

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

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
      className={cn("block rounded-lg text-sm font-medium transition-colors", className)}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();
  const sessionUser = session?.user ?? null;
  const sessionRole = (sessionUser as { role?: string } | null)?.role;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navClasses = cn(
    "w-full p-2 sticky top-0 z-40 transition-all duration-300",
    isScrolled
      ? "bg-foreground/50 backdrop-blur-sm shadow-lg border-b border-background/10"
      : "bg-transparent border-b border-transparent",
    isOpen && "bg-background/10 backdrop-blur-xl"
  );

  const logoClasses = cn(
    "flex items-center gap-2 text-xl font-bold transition-colors",
    isScrolled ? "text-foreground" : "text-foreground"
  );

  const desktopLinkClasses = isScrolled
    ? "hidden lg:flex font-medium text-sm text-background hover:text-primary"
    : "hidden lg:flex font-medium text-sm text-foreground hover:text-primary";

  const loginButtonClasses = isScrolled
    ? "px-4 py-2 rounded-xl text-sm font-medium font-poppins transition-colors bg-background/0 border border-background/20 text-background hover:text-primary hover:border-primary hover:bg-background/10"
    : "px-4 py-2 rounded-xl text-sm font-medium font-poppins transition-colors bg-background/10 border border-primary text-primary-foreground backdrop-blur-sm hover:bg-primary/20 hover:border-primary/20 hover:text-primary";

  const toggleButtonClasses = cn(
    "p-2 transition-colors",
    isScrolled ? "text-background" : "text-foreground"
  );

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setIsOpen((current) => !current)} className={cn(toggleButtonClasses, "lg:hidden")} aria-label="Toggle menu">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/" className={logoClasses}>
              <Image src="/Jelajah-Memoria-01.png" alt="Jelajah Memoria" width={96} height={96} priority className="h-24 w-auto" />
            </Link>
          </div>

          <div className="ml-auto flex flex-1 items-center justify-end gap-4">
            <div className="hidden lg:flex flex-1 items-center justify-center space-x-8">
              {NAV_LINKS.map((link) => (
                <NavbarLink key={link.name} href={link.href} className={desktopLinkClasses}>
                  {link.name}
                </NavbarLink>
              ))}
            </div>

            <div className={cn("flex items-center gap-2", isOpen && "bg-transparent")}>
              {sessionUser ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    aria-label="Menu akun"
                    aria-expanded={dropdownOpen}
                    className={cn(
                      "group relative flex items-center gap-2 rounded-full p-1 sm:pr-3 transition-colors cursor-pointer focus:outline-none"
                    )}
                  >

                    <span className="hidden sm:flex flex-col items-end leading-tight text-left">
                      <span
                        className={cn(
                          "max-w-[140px] truncate text-sm font-semibold",
                          isScrolled ? "text-background" : "text-foreground"
                        )}
                      >
                        {sessionUser.name || "Pengguna"}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] font-medium",
                          isScrolled ? "text-background/70" : "text-muted-foreground"
                        )}
                      >
                        {sessionRole === "admin"
                          ? "Admin"
                          : sessionRole === "agent"
                          ? "Agen"
                          : "Member"}
                      </span>
                    </span>

                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors group-hover:bg-primary/90 overflow-hidden">
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                        {sessionUser.name ? sessionUser.name.charAt(0).toUpperCase() : "U"}
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
                      <span className="absolute inset-0 bg-foreground/35 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    </span>

                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-4 w-56 rounded-2xl bg-card border border-border/80 shadow-xl shadow-black/10 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-foreground truncate">
                          {sessionUser.name || "Pengguna"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5 font-medium">
                          {sessionUser.email}
                        </p>
                      </div>

                      <div className="py-1.5">
                        <Link
                          href="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-border hover:text-foreground transition-colors"
                        >
                          <User className="w-4 h-4 shrink-0" />
                          Profil Saya
                        </Link>
                        {sessionRole === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-border hover:text-foreground transition-colors"
                          >
                            <Shield className="w-4 h-4 shrink-0" />
                            Halaman Admin
                          </Link>
                        )}
                        <Link
                          href="/my-trips"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-border hover:text-foreground transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4 shrink-0" />
                          Riwayat Trip
                        </Link>
                      </div>

                      <div className="border-t border-border py-1.5">
                        <button
                          type="button"
                          onClick={async () => {
                            setDropdownOpen(false);
                            await signOut();
                            router.push("/login");
                            router.refresh();
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-destructive-600 transition-colors hover:bg-border cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          Keluar dari Akun
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/register" className={loginButtonClasses}>
                    Daftar
                  </Link>
                  <Link
                    href="/login"
                    className="bg-primary border border-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium font-poppins transition-colors shadow-sm hover:bg-primary/90 hover:border-primary/90 hover:shadow-xl"
                  >
                    Masuk
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} isScrolled={isScrolled} />
    </nav>
  );
}
