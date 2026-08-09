"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Compass,
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  Tag,
  Percent,
  Star,
  FileText,
  ArrowLeft,
  Bell,
  Route,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useAdminAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navGroups = [
    {
      label: null,
      items: [{ name: "Dashboard", href: "/admin", icon: LayoutDashboard }],
    },
    {
      label: "Trip & Tempat",
      items: [
        { name: "Paket Trip", href: "/admin/trips", icon: Compass },
        { name: "Private Trip", href: "/admin/private-trips", icon: Route },
      ],
    },
    {
      label: "Pengguna & Partner",
      items: [
        { name: "Pengguna", href: "/admin/users", icon: UserCheck },
        { name: "HORECA", href: "/admin/horeca", icon: Building2 },
        { name: "Vendor", href: "/admin/vendors", icon: Users },
      ],
    },
    {
      label: "Marketing",
      items: [
        { name: "Promo", href: "/admin/promotions", icon: Tag },
        { name: "Komisi", href: "/admin/commissions", icon: Percent },
      ],
    },
    {
      label: "Order",
      items: [
        { name: "Pesanan", href: "/admin/pesanan", icon: ShoppingCart },
        { name: "Ulasan", href: "/admin/reviews", icon: Star },
      ],
    },
    {
      label: "Konten",
      items: [{ name: "Blog", href: "/admin/blogs", icon: FileText }],
    },
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
        className="fixed top-3 left-3 z-50 lg:hidden bg-[#0D238E] text-white p-2.5 rounded-xl shadow-lg shadow-[#0D238E]/30"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#081868] text-slate-200 flex flex-col justify-between p-4 border-r border-[#061452] shrink-0 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:inset-auto lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="space-y-6">
          {/* Brand header */}
          <div className="px-3 pt-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-white tracking-tight">
              <img src="/Jelajah-Memoria-01.png" alt="Jelajah Memoria" className="h-15 w-auto" />
            </Link>
          </div>

          {/* Nav menu */}
          <nav className="space-y-4 text-sm font-medium overflow-y-auto max-h-[calc(100vh-9rem)]">
            {navGroups.map((group, gi) => (
              <div key={gi} className="space-y-1">
                {group.label && (
                  <p className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-blue-300/50">
                    {group.label}
                  </p>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition duration-200 ${
                        isActive
                          ? "bg-[#F49D1A] text-white font-semibold shadow-lg shadow-[#F49D1A]/25"
                          : "text-blue-100 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Back to main website link */}
        <div className="pt-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-100 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4 text-[#F49D1A]" />
            <span>Kembali ke Website Utama</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar Header */}
        <header className="bg-white border-b border-slate-200/80 pl-14 lg:pl-6 pr-3 sm:pr-6 py-3.5 flex items-center justify-end sticky top-0 z-30">

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F49D1A]" />
            </button>

            <div className="h-6 w-[1px] bg-slate-200" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F49D1A]/15 text-[#F49D1A] font-bold text-xs flex items-center justify-center border border-[#F49D1A]/20">
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
