"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatIDR } from "@/utils/format";
import {
  Bell,
  Check,
  X,
  AlertCircle,
  ShoppingCart,
  Loader2,
  CheckCircle,
  Clock,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  link?: string | null;
  bookingCode?: string | null;
  status?: string | null;
  amount?: string | null;
  participantCount?: number | null;
  userName?: string | null;
  userEmail?: string | null;
}

function getHref(n: Pick<Notification, "type" | "link">): string {
  if (n.link) return n.link;
  switch (n.type) {
    case "payment_proof":
      return "/admin/bookings";
    case "private_trip_request":
      return "/admin/private-trips";
    case "participant_added":
      return "/admin/bookings";
    default:
      return "/admin/notifications";
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "payment_proof":
      return <Check className="w-5 h-5 text-success-500" />;
    case "private_trip_request":
      return <ShoppingCart className="w-5 h-5 text-purple-500" />;
    case "participant_added":
      return <Check className="w-5 h-5 text-info-500" />;
    case "new_booking":
      return <ShoppingCart className="w-5 h-5 text-info-500" />;
    case "booking_confirmed":
      return <CheckCircle className="w-5 h-5 text-success-600" />;
    case "booking_cancelled":
      return <X className="w-5 h-5 text-destructive-500" />;
    default:
      return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
  }
}

function getNotificationBadge(type: string) {
  switch (type) {
    case "payment_proof":
      return { label: "Bukti Pembayaran", className: "bg-success-50 text-success-700 border-success-200" };
    case "private_trip_request":
      return { label: "Private Trip", className: "bg-purple-50 text-purple-700 border-purple-200" };
    case "participant_added":
      return { label: "Peserta Baru", className: "bg-info-50 text-info-700 border-info-200" };
    case "new_booking":
      return { label: "Pesanan Baru", className: "bg-info-50 text-info-700 border-info-200" };
    case "booking_confirmed":
      return { label: "Dikonfirmasi", className: "bg-success-50 text-success-700 border-success-200" };
    case "booking_cancelled":
      return { label: "Dibatalkan", className: "bg-destructive-50 text-destructive-700 border-destructive-200" };
    default:
      return { label: "Update", className: "bg-muted text-muted-foreground border-border" };
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimeAgo(dateString: string) {
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
}



export default function AdminNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications?limit=100", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat notifikasi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  async function markAsRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)));
    try {
      const res = await fetch(`/api/admin/notifications/${id}/read`, { method: "PATCH", credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      void fetchData();
    }
  }

  function handleClick(n: Notification) {
    void markAsRead(n.id);
    router.push(getHref(n));
  }

  async function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
    try {
      const res = await fetch(`/api/admin/notifications/read-all`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      void fetchData();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-3xl border border-border/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Notifikasi</h1>
          <p className="text-sm text-muted-foreground mt-1">Pantau bukti pembayaran, request private trip, dan peserta baru.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="rounded-2xl bg-primary/10 px-5 py-2.5 text-xs font-semibold text-primary-foreground border border-primary/20 hover:bg-primary/20 transition inline-flex items-center gap-2 shrink-0"
          >
            <CheckCircle className="w-4 h-4" />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {error && (
        <div className="bg-destructive-50 border border-destructive-200 text-destructive-700 text-sm px-4 py-3 rounded-2xl">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-bold hover:underline">Tutup</button>
        </div>
      )}

      <div className="flex items-center gap-2 bg-card p-2 rounded-2xl border border-border/80 shadow-xs w-fit">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${filter === "all" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
        >
          Semua
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5 ${filter === "unread" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
        >
          Belum Dibaca
          {unreadCount > 0 && (
            <span className={`min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 ${filter === "unread" ? "bg-white/20 text-white" : "bg-destructive-600 text-white"}`}>{unreadCount}</span>
          )}
        </button>
      </div>

      <div className="bg-card rounded-3xl border border-border/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 text-center">
            <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-3 animate-spin" />
            <p className="text-sm text-muted-foreground">Memuat notifikasi...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Bell className="w-12 h-12 text-border mx-auto mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">{filter === "unread" ? "Semua notifikasi sudah dibaca" : "Belum ada notifikasi"}</p>
            <p className="text-xs text-muted-foreground mt-1">{filter === "unread" ? "Notifikasi baru akan muncul di sini" : "Notifikasi akan muncul saat ada bukti pembayaran / private trip / peserta baru"}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredNotifications.map((notification) => {
              const badge = getNotificationBadge(notification.type);
              return (
                <div
                  key={notification.id}
                  onClick={() => handleClick(notification)}
                  className={`px-4 sm:px-6 py-4 hover:bg-muted/60 cursor-pointer transition ${!notification.isRead ? "bg-primary/[0.03]" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 shrink-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${!notification.isRead ? "bg-primary/10" : "bg-muted"}`}>{getNotificationIcon(notification.type)}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm truncate ${!notification.isRead ? "font-bold text-foreground" : "font-semibold text-foreground"}`}>{notification.title}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}>{badge.label}</span>
                            {!notification.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(notification.createdAt)}
                          </div>
                          {notification.amount ? <p className="text-xs font-bold text-primary-foreground mt-1">{formatIDR(notification.amount)}</p> : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {notification.bookingCode ? <span className="text-[11px] font-mono font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{notification.bookingCode}</span> : null}
                        <span className="text-[10px] text-muted-foreground hidden sm:inline">{formatDate(notification.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
