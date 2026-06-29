import { useCallback, useEffect, useRef, useState } from "react";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api";

const POLLING_INTERVAL_MS = 30000; // 30 giây

export function useNotifications(enabled = true) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const pollingRef = useRef(null);

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

    async function fetchNotifications(isPolling = false) {
      if (!isPolling) {
        setLoading(true);
      }
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

    fetchNotifications(false);

    // Polling mỗi 30 giây để kiểm tra thông báo mới
    pollingRef.current = setInterval(() => {
      if (!cancelled) {
        fetchNotifications(true);
      }
    }, POLLING_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
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

