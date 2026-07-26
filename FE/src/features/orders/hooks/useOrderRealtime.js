// useOrderRealtime.js - Lắng nghe thay đổi trạng thái đơn hàng qua SSE
import { useEffect } from "react";

/**
 * Kết nối SSE bằng JWT và tự kết nối lại khi đường truyền gián đoạn.
 */
export function useOrderRealtime(onOrderUpdated, enabled = true) {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!enabled || !token) return undefined;

    const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/api";
    const eventsUrl = `${apiBaseUrl.replace(/\/$/, "")}/orders/events`;
    let controller;
    let reconnectTimer;
    let stopped = false;

    const connect = async () => {
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
          throw new Error(`Không thể kết nối realtime (${response.status})`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!stopped) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split(/\r?\n\r?\n/);
          buffer = messages.pop() || "";

          for (const message of messages) {
            const eventName = message.match(/^event:\s*(.+)$/m)?.[1];
            const eventData = message.match(/^data:\s*(.+)$/m)?.[1];
            if (!["order.created", "order.updated"].includes(eventName) || !eventData) continue;

            const payload = JSON.parse(eventData);
            onOrderUpdated(payload.order, eventName);
          }
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.warn("[Order realtime] Mất kết nối, đang thử lại...", error);
        }
      }

      if (!stopped) reconnectTimer = setTimeout(connect, 2000);
    };

    connect();

    return () => {
      stopped = true;
      clearTimeout(reconnectTimer);
      controller?.abort();
    };
  }, [enabled, onOrderUpdated]);
}
