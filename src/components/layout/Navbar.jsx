"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, User, ShoppingBag } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import MobileMenu from "@/components/layout/MobileMenu";

const NAV_LINKS = [
  { name: "Beranda", href: "/" },
  { name: "Destinasi Trip", href: "/trips" },
  { name: "Private Trip", href: "/private" },
  { name: "Tentang Kami", href: "/about" },
  { name: "Hubungi Kami", href: "/contact" },
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

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navClasses = cn(
    "w-full p-2 sticky top-0 z-40 transition-all duration-300",
    isScrolled
      ? "bg-black/50 backdrop-blur-sm shadow-lg border-b border-white/10"
      : "bg-transparent border-b border-transparent",
    isOpen && "bg-white/10 backdrop-blur-xl"
  );

  const logoClasses = cn(
    "flex items-center gap-2 text-xl font-bold transition-colors",
    isScrolled ? "text-gray-900" : "text-black"
  );

  const desktopLinkClasses = isScrolled
    ? "hidden lg:flex font-medium text-sm text-white hover:text-[#F49D1A]"
    : "hidden lg:flex font-medium text-sm text-black hover:text-[#F49D1A]";

  const loginButtonClasses = isScrolled
    ? "px-4 py-2 rounded-xl text-sm font-medium font-poppins transition-colors bg-white/0 border border-white/20 text-white hover:text-[#F49D1A] hover:border-[#F49D1A] hover:bg-white/10"
    : "px-4 py-2 rounded-xl text-sm font-medium font-poppins transition-colors bg-white/10 border border-[#F49D1A] text-[#F49D1A] backdrop-blur-sm hover:bg-[#F49D1A]/20 hover:border-[#F49D1A]/20 hover:text-[#F49D1A]";

  const toggleButtonClasses = cn(
    "p-2 transition-colors",
    isScrolled ? "text-white" : "text-slate-700"
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
              <img src="/Jelajah-Memoria-01.png" alt="Jelajah Memoria" className="h-24 w-auto" />
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
              {isLoggedIn ? (
                /* Avatar + Dropdown */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    aria-label="Menu akun"
                    aria-expanded={dropdownOpen}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F49D1A] text-white shadow-sm transition-colors hover:bg-[#c47d12] focus:outline-none focus:ring-2 focus:ring-[#F49D1A]/50 focus:ring-offset-1"
                  >
                    <span className="text-sm font-semibold">
                      {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                    </span>
                  </button>

                  {/* Dropdown panel */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200/80 shadow-xl shadow-black/10 overflow-hidden z-50">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {session.user.name || "Pengguna"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {session.user.email}
                        </p>
                      </div>

                      {/* Menu items */}
                      <div className="py-1.5">
                        <Link
                          href="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#F49D1A] transition-colors"
                        >
                          <User className="w-4 h-4 shrink-0" />
                          Profil Saya
                        </Link>
                        <Link
                          href="/my-trips"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#F49D1A] transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4 shrink-0" />
                          Histori Trip
                        </Link>
                      </div>

                      {/* Logout */}
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
                    className="bg-[#F49D1A] border border-[#F49D1A] text-white px-4 py-2 rounded-xl text-sm font-medium font-poppins transition-colors shadow-sm hover:bg-[#c47d12] hover:border-[#c47d12] hover:shadow-xl"
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
