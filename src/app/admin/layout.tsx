"use client";

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Compass,
  LayoutDashboard,
  MapPin,
  Building2,
  Users,
  Tag,
  Percent,
  Star,
  FileText,
  ArrowLeft,
  Search,
  Bell,
  User,
  Route,
  ShoppingCart,
  Map,
  Menu,
  X,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Paket Trip", href: "/admin/trips", icon: MapPin },
    { name: "Destinasi", href: "/admin/destinations", icon: Compass },
    { name: "HORECA", href: "/admin/horeca", icon: Building2 },
    { name: "Vendor", href: "/admin/vendors", icon: Users },
    { name: "Promo", href: "/admin/promotions", icon: Tag },
    { name: "Komisi", href: "/admin/commissions", icon: Percent },
    { name: "Ulasan", href: "/admin/reviews", icon: Star },
    { name: "Meeting Point", href: "/admin/meeting-points", icon: Map },
    { name: "Blog", href: "/admin/blogs", icon: FileText },
    { name: "Pesanan", href: "/admin/pesanan", icon: ShoppingCart },
    { name: "Private Trip", href: "/admin/private-trips", icon: Route },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100/70 font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-3 left-3 z-50 lg:hidden bg-[#0b0f19] text-white p-2.5 rounded-xl shadow-lg"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0b0f19] text-slate-300 flex flex-col justify-between p-4 border-r border-slate-800 shrink-0 transition-transform duration-300 lg:static lg:inset-auto lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="space-y-6">
          {/* Brand header */}
          <div className="px-3 pt-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-white tracking-tight">
              <Compass className="h-6 w-6 text-[#e06d26]" />
              <img src="/Jelajah-Memoria-01.png" alt="Jelajah Memoria" className="h-8 w-auto" />
              <span className="ml-auto text-[10px] font-bold bg-[#e06d26]/20 text-[#e06d26] px-2 py-0.5 rounded-full border border-orange-500/30 uppercase">
                ADMIN
              </span>
            </Link>
          </div>

          {/* Nav menu */}
          <nav className="space-y-1 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition duration-200 ${
                    isActive
                      ? "bg-[#e06d26] text-white font-semibold shadow-lg shadow-orange-500/25"
                      : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Back to main website link */}
        <div className="pt-4 border-t border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4 text-[#e06d26]" />
            <span>Kembali ke Website Utama</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar Header */}
        <header className="bg-white border-b border-slate-200/80 pl-14 lg:pl-6 pr-3 sm:pr-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 bg-slate-100 px-3.5 py-2 rounded-2xl border border-slate-200/60 w-48 sm:w-64 lg:w-80">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari data admin..."
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#e06d26]" />
            </button>

            <div className="h-6 w-[1px] bg-slate-200" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#e06d26] font-bold text-xs flex items-center justify-center border border-orange-200">
                ADM
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-slate-900 leading-tight">Admin Master</span>
                <span className="block text-[11px] text-slate-400 leading-tight">admin@opentrip.co.id</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content View Container */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>

      </div>
    </div>
  );
}
