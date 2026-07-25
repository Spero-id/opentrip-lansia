"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Compass, User, LogOut, Shield, MapPin } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const user = session?.user as { name?: string; role?: string } | undefined;

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
    router.refresh();
  };

  // Hide global navbar on admin routes to prevent double nav
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Destinasi", href: "/trips" },
    { name: "Tentang Kami", href: "/#tentang" },
    { name: "Kontak", href: "/#kontak" },
    { name: "Promo", href: "/#promo" },
    { name: "FAQ", href: "/#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-[#e06d26]">
            <Compass className="h-6 w-6" />
          </div>
          <span>Open<span className="text-[#e06d26]">Trip</span></span>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-colors duration-200 hover:text-[#e06d26] ${
                  isActive ? "text-[#e06d26] font-semibold" : ""
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Auth Actions */}
        <div className="flex items-center gap-3 text-sm">
          {!isPending && (
            <>
              {session && user ? (
                <div className="flex items-center gap-3">
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 border border-amber-200 transition"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Admin Panel
                    </Link>
                  )}
                  {user.role === "agent" && (
                    <Link
                      href="/agent"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Agent Panel
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-slate-700 hover:text-[#e06d26] font-medium bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition"
                  >
                    <User className="w-4 h-4 text-[#e06d26]" />
                    <span>{user.name || "Profil"}</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    title="Keluar"
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-slate-700 hover:text-[#e06d26] font-medium transition"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/auth/register"
                    className="rounded-xl bg-[#e06d26] px-5 py-2 font-medium text-white shadow-md shadow-orange-500/20 hover:bg-[#c85b18] active:scale-98 transition duration-200"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </header>
  );
}
