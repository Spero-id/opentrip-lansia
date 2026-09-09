"use client";

import { useState, useEffect } from "react";
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
  bookingCode: string;
  status: string;
  amount: string;
  participantCount: number;
  userName: string;
  userEmail: string;
  createdAt: string;
  isRead: boolean;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "new_booking":
      return <ShoppingCart className="w-5 h-5 text-blue-500" />;
    case "payment_proof":
      return <Check className="w-5 h-5 text-green-500" />;
    case "booking_confirmed":
      return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    case "booking_cancelled":
      return <X className="w-5 h-5 text-red-500" />;
    default:
      return <AlertCircle className="w-5 h-5 text-gray-500" />;
  }
}

function getNotificationBadge(type: string) {
  switch (type) {
    case "new_booking":
      return { label: "Pesanan Baru", className: "bg-blue-50 text-blue-700 border-blue-200" };
    case "payment_proof":
      return { label: "Bukti Pembayaran", className: "bg-green-50 text-green-700 border-green-200" };
    case "booking_confirmed":
      return { label: "Dikonfirmasi", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case "booking_cancelled":
      return { label: "Dibatalkan", className: "bg-red-50 text-red-700 border-red-200" };
    default:
      return { label: "Update", className: "bg-slate-50 text-slate-600 border-slate-200" };
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

function formatRupiah(amount: string) {
  const num = parseInt(amount);
  if (isNaN(num)) return amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(num);
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/notifications?limit=100", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setNotifications(data.notifications ?? []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Gagal memuat notifikasi");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Notifikasi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau seluruh aktivitas pesanan dan notifikasi terbaru.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="rounded-2xl bg-[#F49D1A]/10 px-5 py-2.5 text-xs font-semibold text-[#F49D1A] border border-[#F49D1A]/20 hover:bg-[#F49D1A]/20 transition inline-flex items-center gap-2 shrink-0"
          >
            <CheckCircle className="w-4 h-4" />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 font-bold hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs w-fit">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            filter === "all"
              ? "bg-[#F49D1A] text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5 ${
            filter === "unread"
              ? "bg-[#F49D1A] text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          Belum Dibaca
          {unreadCount > 0 && (
            <span
              className={`min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 ${
                filter === "unread"
                  ? "bg-white/20 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 text-center">
            <Loader2 className="w-8 h-8 text-slate-300 mx-auto mb-3 animate-spin" />
            <p className="text-sm text-slate-400">Memuat notifikasi...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">
              {filter === "unread"
                ? "Semua notifikasi sudah dibaca"
                : "Belum ada notifikasi"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {filter === "unread"
                ? "Notifikasi baru akan muncul di sini"
                : "Notifikasi akan muncul saat ada aktivitas pesanan"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notification) => {
              const badge = getNotificationBadge(notification.type);
              return (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`px-4 sm:px-6 py-4 hover:bg-slate-50/60 cursor-pointer transition ${
                    !notification.isRead ? "bg-[#F49D1A]/[0.03]" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="mt-0.5 shrink-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          !notification.isRead ? "bg-[#F49D1A]/10" : "bg-slate-100"
                        }`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              className={`text-sm truncate ${
                                !notification.isRead
                                  ? "font-bold text-slate-900"
                                  : "font-semibold text-slate-700"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                            {!notification.isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#F49D1A] shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>

                        {/* Time & Amount */}
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(notification.createdAt)}
                          </div>
                          <p className="text-xs font-bold text-[#F49D1A] mt-1">
                            {formatRupiah(notification.amount)}
                          </p>
                        </div>
                      </div>

                      {/* Meta Row */}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {notification.bookingCode}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {notification.userName}
                        </span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          {notification.userEmail}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {notification.participantCount} peserta
                        </span>
                        <span className="text-[10px] text-slate-300 hidden sm:inline">
                          {formatDate(notification.createdAt)}
                        </span>
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
