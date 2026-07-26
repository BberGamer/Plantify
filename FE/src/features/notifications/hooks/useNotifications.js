// useNotifications.js - Quản lý danh sách và kết nối thông báo realtime
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api";

export function useNotifications(enabled = true) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const knownNotificationIds = useRef(new Set());

  const refetch = useCallback(() => {
    setRefreshKey((currentKey) => currentKey + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchNotifications() {
      setLoading(true);
      setError(null);

      try {
        const [notificationsResponse, unreadCountResponse] = await Promise.all([
          getNotifications({ page: 1, limit: 8 }),
          getUnreadNotificationCount(),
        ]);

        if (cancelled) {
          return;
        }

        setNotifications(notificationsResponse.data?.notifications || []);
        knownNotificationIds.current = new Set(
          (notificationsResponse.data?.notifications || []).map(
            (notification) => notification._id
          )
        );
        setUnreadCount(unreadCountResponse.data?.unreadCount || 0);
        setLoading(false);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    }

    const token = localStorage.getItem("token");
    const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/api";
    const eventsUrl = `${apiBaseUrl.replace(/\/$/, "")}/notifications/events`;
    let controller;
    let reconnectTimer;

    async function connectRealtime() {
      controller = new AbortController();

      try {
        const response = await fetch(eventsUrl, {
          headers: {
            Accept: "text/event-stream",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Không thể kết nối thông báo realtime (${response.status})`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!cancelled) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split(/\r?\n\r?\n/);
          buffer = messages.pop() || "";

          for (const message of messages) {
            const eventName = message.match(/^event:\s*(.+)$/m)?.[1];
            const eventData = message.match(/^data:\s*(.+)$/m)?.[1];
            if (eventName !== "notification.created" || !eventData) continue;

            const { notification } = JSON.parse(eventData);
            if (!notification || knownNotificationIds.current.has(notification._id)) {
              continue;
            }

            knownNotificationIds.current.add(notification._id);
            setNotifications((currentNotifications) => (
              [notification, ...currentNotifications].slice(0, 8)
            ));
            if (!notification.readAt) {
              setUnreadCount((currentCount) => currentCount + 1);
            }
          }
        }
      } catch (streamError) {
        if (streamError.name !== "AbortError") {
          console.warn("[Notification realtime] Mất kết nối, đang thử lại...", streamError);
        }
      }

      if (!cancelled) reconnectTimer = setTimeout(connectRealtime, 2000);
    }

    fetchNotifications();
    connectRealtime();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      controller?.abort();
    };
  }, [enabled, refreshKey]);

  const readNotification = useCallback(async (notificationId) => {
    await markNotificationAsRead(notificationId);
    setNotifications((currentNotifications) => currentNotifications.map((notification) => (
      notification._id === notificationId
        ? { ...notification, readAt: notification.readAt || new Date().toISOString() }
        : notification
    )));
    setUnreadCount((currentCount) => Math.max(currentCount - 1, 0));
  }, []);

  const readAllNotifications = useCallback(async () => {
    await markAllNotificationsAsRead();
    const readAt = new Date().toISOString();
    setNotifications((currentNotifications) => currentNotifications.map((notification) => ({
      ...notification,
      readAt: notification.readAt || readAt,
    })));
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch,
    readNotification,
    readAllNotifications,
  };
}

