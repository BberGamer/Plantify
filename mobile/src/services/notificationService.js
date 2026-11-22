import api from "./api";
import { fetch } from "expo/fetch";
import { expireRequestSession, isSessionCurrent } from "./sessionAccess";

function subscribe(session, onChange) {
  const controller = new AbortController();
  let retry;
  async function connect() {
    if (!session.token || controller.signal.aborted || !isSessionCurrent(session)) return;
    try {
      const response = await fetch(api.getUri({ url: "/notifications/events" }), {
        headers: { Authorization: `Bearer ${session.token}`, Accept: "text/event-stream" },
        signal: controller.signal,
      });
      if (response.status === 401) {
        expireRequestSession(session);
        return;
      }
      if (!response.ok || !response.body) throw new Error("Notification stream unavailable");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        while (isSessionCurrent(session) && !controller.signal.aborted) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let boundary;
          while ((boundary = buffer.indexOf("\n\n")) >= 0) {
            const frame = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            if (frame === "data: changed" && !controller.signal.aborted && isSessionCurrent(session)) onChange();
          }
        }
      } finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
    } catch {
      // Kết nối lại sau khi mạng hoặc backend hoạt động trở lại.
    }
    if (!controller.signal.aborted && isSessionCurrent(session)) retry = setTimeout(connect, 3000);
  }
  void connect();
  return () => {
    clearTimeout(retry);
    controller.abort();
  };
}

export default {
  subscribe,
  list: async (params) => (await api.get("/notifications", { params })).data,
  unreadCount: async (sessionContext) => (await api.get("/notifications/unread-count", { sessionContext })).data,
  detail: async (id, sessionContext) => (await api.get(`/notifications/${id}`, { sessionContext })).data,
  markRead: async (id, sessionContext) => (await api.patch(`/notifications/${id}/read`, {}, { sessionContext })).data,
  markAllRead: async () => (await api.patch("/notifications/read-all")).data,
  preferences: async () => (await api.get("/notifications/preferences")).data,
  updatePreferences: async (enabled) => (await api.patch("/notifications/preferences",
    { treatment_reminders: enabled })).data,
};
