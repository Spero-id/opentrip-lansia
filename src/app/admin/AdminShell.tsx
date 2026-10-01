"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Bell, Check, X, AlertCircle, ShoppingCart, User, ShoppingBag, LogOut, Shield } from "lucide-react";
import { useNotifications, getNotificationHref } from "@/hooks/useNotifications";
import { useSession, signOut } from "@/lib/auth/client";
import { AppSidebar } from "@/components/app-sidebar";
import { getActiveMenu } from "./components/nav-data";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeMenu = getActiveMenu(pathname);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(15000);
  const { data: session } = useSession();

  const adminName = session?.user?.name?.trim() || "Admin";
  const adminImage = session?.user?.image || null;
  const adminInitials =
    adminName
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";

  const handleNotificationClick = (n: { id: string; type: string; link?: string | null }) => {
    void markAsRead(n.id);
    const href = getNotificationHref(n);
    setShowNotifications(false);
    router.push(href);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment_proof":
        return <Check className="size-4 text-muted-foreground" />;
      case "private_trip_request":
        return <ShoppingCart className="size-4 text-muted-foreground" />;
      case "participant_added":
        return <Check className="size-4 text-muted-foreground" />;
      case "new_booking":
        return <ShoppingCart className="size-4 text-muted-foreground" />;
      case "booking_confirmed":
        return <Check className="size-4 text-muted-foreground" />;
      case "booking_cancelled":
        return <X className="size-4 text-muted-foreground" />;
      default:
        return <AlertCircle className="size-4 text-muted-foreground" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${diffDays} hari lalu`;
  };

  const formatRupiah = (amount?: string | null) => {
    if (!amount) return "";
    const num = parseInt(amount);
    if (isNaN(num)) return amount;
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(num);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-slate-100/70 min-w-0">
        <header className="sticky top-0 left-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-2 min-w-0">
            <SidebarTrigger className="-ml-1 text-slate-500" />
            {activeMenu && (
              <>
                <Separator
                  orientation="vertical"
                  className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                />
                <Breadcrumb className="min-w-0">
                  <BreadcrumbList>
                    {activeMenu.label && (
                      <>
                        <BreadcrumbItem>
                          <BreadcrumbPage>{activeMenu.label}</BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                      </>
                    )}
                    <BreadcrumbItem>
                      <BreadcrumbPage className="truncate text-slate-700">
                        {activeMenu.activeItem.name}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={notificationRef}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifikasi"
                aria-expanded={showNotifications}
                className="relative text-slate-500"
              >
                <Bell />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-popover text-popover-foreground rounded-md shadow-md border overflow-hidden z-50">
                  <div className="px-3 py-2 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Notifikasi</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-[#F49D1A] hover:text-[#E08A0E] font-medium"
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>
                  <div className="h-px bg-border" />

                  <div className="max-h-[400px] overflow-y-auto p-1">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Belum ada notifikasi</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className="relative flex cursor-pointer select-none gap-2 rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <span className="ml-auto size-2 rounded-full bg-primary shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[11px] text-muted-foreground/80">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                                {notification.amount ? (
                                  <>
                                    <span className="text-[11px] text-muted-foreground/80">•</span>
                                    <span className="text-[11px] font-medium">
                                      {formatRupiah(notification.amount)}
                                    </span>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <>
                      <div className="h-px bg-border" />
                      <div className="p-1">
                        <Link
                          href="/admin/notifications"
                          onClick={() => setShowNotifications(false)}
                          className="block rounded-sm px-2 py-1.5 text-center text-xs font-medium text-[#F49D1A] hover:bg-accent transition-colors"
                        >
                          Lihat semua notifikasi →
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="h-6 w-[1px] bg-slate-200" />

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                aria-label="Menu akun"
                aria-expanded={profileOpen}
                className="group relative flex items-center rounded-full transition-colors cursor-pointer focus:outline-none"
              >
                {adminImage ? (
                  <Image
                    src={adminImage}
                    alt={adminName}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover border border-[#F49D1A]/20"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F49D1A]/15 border border-[#F49D1A]/20 font-bold text-[#F49D1A] group-hover:bg-[#F49D1A]/25 transition-colors">
                    {adminInitials}
                  </div>
                )}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-4 w-56 rounded-2xl bg-white border border-slate-200/80 shadow-xl shadow-black/10 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {adminName}
                    </p>
                    <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                      {session?.user?.email}
                    </p>
                  </div>

                  <div className="py-1.5">
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                    >
                      <User className="w-4 h-4 shrink-0" />
                      Profil Saya
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                    >
                      <Shield className="w-4 h-4 shrink-0" />
                      Halaman Admin
                    </Link>
                    <Link
                      href="/my-trips"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 shrink-0" />
                      Riwayat Trip
                    </Link>
                  </div>

                  <div className="border-t border-slate-200 py-1.5">
                    <button
                      type="button"
                      onClick={async () => {
                        setProfileOpen(false);
                        await signOut();
                        router.push("/login");
                        router.refresh();
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-slate-200 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      Keluar dari Akun
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex-1 min-w-0 overflow-x-clip">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
