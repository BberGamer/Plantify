import { api } from "@/lib/api";

export const openNotificationEventStream = ({ token, signal }) => {
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/api";
  const eventsUrl = `${apiBaseUrl.replace(/\/$/, "")}/notifications/events`;

  return fetch(eventsUrl, {
    headers: {
      Accept: "text/event-stream",
      Authorization: `Bearer ${token}`,
    },
    signal,
  });
};

export const getNotifications = async (params = {}) => {
  const response = await api.get("/notifications", { params });
  return response.data;
};

export const getUnreadNotificationCount = async () => {
  const response = await api.get("/notifications/unread-count");
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.patch("/notifications/read-all");
  return response.data;
};
