// useNotifications.js - Quản lý danh sách và kết nối thông báo realtime
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  openNotificationEventStream,
} from "@/features/notifications/api";
import { NOTIFICATIONS_REFRESH_EVENT } from "@/features/notifications/notification.utils";

const INITIAL_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30000;
const STABLE_CONNECTION_MS = 20000;

/**
 * Tải thông báo, duy trì kết nối realtime và cung cấp action đánh dấu đã đọc.
 * @param {boolean} [enabled=true] - Có bật tải và realtime hay không.
 * @returns {Object} Danh sách, số chưa đọc, trạng thái và action thông báo.
 */
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
    if (!enabled) return undefined;
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, refetch);
    return () => {
      window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, refetch);
    };
  }, [enabled, refetch]);

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

    let controller = null;
    let streamReader = null;
    let reconnectTimer = null;
    let reconnectAttempt = 0;

    /**
     * Hẹn kết nối lại theo exponential backoff để tránh tạo vòng lặp request dày.
     */
    function scheduleReconnect() {
      if (cancelled || reconnectTimer || !localStorage.getItem("token")) {
        return;
      }

      const delay = Math.min(
        INITIAL_RECONNECT_DELAY_MS * (2 ** reconnectAttempt),
        MAX_RECONNECT_DELAY_MS
      );
      reconnectAttempt += 1;
      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = null;
        connectRealtime();
      }, delay);
    }

    /**
     * Mở stream notification và chỉ retry khi kết nối bị lỗi ngoài ý muốn.
     */
    async function connectRealtime() {
      if (cancelled) return;

      const token = localStorage.getItem("token");
      if (!token) return;

      const activeController = new AbortController();
      controller = activeController;
      let connectedAt = 0;
      let shouldReconnect = true;

      try {
        const response = await openNotificationEventStream({
          token,
          signal: activeController.signal,
        });

        if (response.status === 401 || response.status === 403) {
          shouldReconnect = false;
          window.dispatchEvent(new Event("auth-expired"));
          return;
        }

        if (!response.ok || !response.body) {
          throw new Error(`Không thể kết nối thông báo realtime (${response.status})`);
        }

        const reader = response.body.getReader();
        streamReader = reader;
        const decoder = new TextDecoder();
        let buffer = "";
        connectedAt = Date.now();

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
        const isIntentionalAbort = cancelled
          || activeController.signal.aborted
          || streamError.name === "AbortError";

        if (!isIntentionalAbort) {
          console.warn("[Notification realtime] Mất kết nối, đang thử lại...", streamError);
        }
      } finally {
        if (controller === activeController) {
          controller = null;
        }
        streamReader = null;
      }

      if (
        connectedAt
        && Date.now() - connectedAt >= STABLE_CONNECTION_MS
      ) {
        reconnectAttempt = 0;
      }

      if (shouldReconnect) {
        scheduleReconnect();
      }
    }

    fetchNotifications();
    connectRealtime();

    return () => {
      cancelled = true;
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
      controller?.abort();
      streamReader?.cancel().catch(() => {
        // Reader có thể đã đóng cùng AbortController; đây không phải lỗi kết nối thật.
      });
      streamReader = null;
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

