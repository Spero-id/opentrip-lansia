"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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
  const [isAuthError, setIsAuthError] = useState(false);
  const lastCheckedRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (showLoading = true) => {
    // Session expired/invalid — stop hammering the API on every poll
    if (isAuthError) return;
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (lastCheckedRef.current) {
        params.set("since", lastCheckedRef.current);
      }
      params.set("limit", "20");

      const response = await fetch(`/api/admin/notifications?${params}`);
      if (response.status === 401 || response.status === 403) {
        // Expected once the session expires — no console spam, stop polling
        setIsAuthError(true);
        setError("Sesi admin telah berakhir. Silakan login kembali.");
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data: NotificationsResponse = await response.json();

      // Update notifications
      if (lastCheckedRef.current) {
        // Append new notifications to existing ones
        setNotifications((prev) => {
          const newNotifications = data.notifications.filter(
            (n) => !prev.some((existing) => existing.id === n.id)
          );
          return [...newNotifications, ...prev].slice(0, 50); // Keep last 50
        });
      } else {
        // Initial load - set all notifications
        setNotifications(data.notifications);
      }

      // Update unread count
      if (lastCheckedRef.current) {
        // For subsequent fetches, count new items
        const newCount = data.notifications.filter(
          (n) => new Date(n.createdAt) > new Date(lastCheckedRef.current!)
        ).length;
        setUnreadCount((prev) => prev + newCount);
      } else {
        // Initial load - count recent (last 24h)
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const recentCount = data.notifications.filter(
          (n) => new Date(n.createdAt) > oneDayAgo
        ).length;
        setUnreadCount(recentCount);
      }

      // Update last checked timestamp
      lastCheckedRef.current = new Date().toISOString();
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Gagal memuat notifikasi");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthError]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Initial fetch
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (!cancelled) await fetchNotifications(true);
    })();
    return () => { cancelled = true; };
  }, [fetchNotifications]);

  // Polling
  useEffect(() => {
    if (isAuthError) return; // stop polling after session expiry

    intervalRef.current = setInterval(() => {
      fetchNotifications(false);
    }, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchNotifications, pollInterval, isAuthError]);

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
