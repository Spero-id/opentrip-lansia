"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from "react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  link?: string | null;
  // legacy optional fields for backward compat with old UI
  bookingCode?: string | null;
  status?: string | null;
  amount?: string | null;
  participantCount?: number | null;
  userName?: string | null;
  userEmail?: string | null;
}

export function getNotificationHref(n: Pick<Notification, "type" | "link">): string {
  if (n.link) return n.link;
  switch (n.type) {
    case "payment_proof":
      return "/admin/pesanan";
    case "private_trip_request":
      return "/admin/private-trips";
    case "participant_added":
      return "/admin/pesanan";
    default:
      return "/admin/notifications";
  }
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

export function useNotifications(pollInterval = 30000) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchNotifications = useCallback(async (showLoading = true) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const res = await fetch(`/api/admin/notifications?limit=20`, {
        credentials: "include",
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: NotificationsResponse = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return;
      console.error("Error fetching notifications:", err);
      setError("Gagal memuat notifikasi");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    // optimistic
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      const res = await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      console.error("markAsRead failed", e);
      // rollback
      await fetchNotifications(false);
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
    setUnreadCount(0);
    try {
      const res = await fetch(`/api/admin/notifications/read-all`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      console.error("markAllAsRead failed", e);
      await fetchNotifications(false);
    }
  }, [fetchNotifications]);

  const clearAll = useCallback(() => {
    // legacy: no delete API, alias to markAllAsRead locally
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
    setUnreadCount(0);
    void fetch(`/api/admin/notifications/read-all`, { method: "POST", credentials: "include" }).catch(() => {});
  }, []);

  useEffect(() => {
    void fetchNotifications(true);
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchNotifications]);

  useEffect(() => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      // don't poll when hidden; resume on visible
    }
    const id = setInterval(() => {
      if (document.visibilityState === "visible") fetchNotifications(false);
    }, pollInterval);
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchNotifications(false);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchNotifications, pollInterval]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
