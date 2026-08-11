"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
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
  MapPin,
  ShoppingCart,
  Menu,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(15000);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_booking":
        return <ShoppingCart className="w-4 h-4 text-blue-500" />;
      case "payment_proof":
        return <Check className="w-4 h-4 text-green-500" />;
      case "booking_confirmed":
        return <Check className="w-4 h-4 text-green-600" />;
      case "booking_cancelled":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${diffDays} hari lalu`;
  };

  const formatRupiah = (amount: string) => {
    const num = parseInt(amount);
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(num);
  };

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
        { name: "Meeting Point", href: "/admin/meeting-points", icon: MapPin },
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
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Notifikasi</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-[#F49D1A] hover:text-[#E08A0E] font-medium"
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Belum ada notifikasi</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition ${
                            !notification.isRead ? "bg-[#F49D1A]/5" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-[#F49D1A] shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] text-slate-400">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                                <span className="text-[10px] text-slate-400">•</span>
                                <span className="text-[10px] font-medium text-slate-600">
                                  {formatRupiah(notification.amount)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
                      <Link
                        href="/admin/pesanan"
                        onClick={() => setShowNotifications(false)}
                        className="text-xs text-[#F49D1A] hover:text-[#E08A0E] font-medium text-center block"
                      >
                        Lihat semua pesanan →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

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
