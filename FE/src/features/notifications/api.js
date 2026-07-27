// api.js - Gọi API danh sách, trạng thái đọc và luồng thông báo thời gian thực
import { api } from "@/lib/api";

/**
 * Mở kết nối Server-Sent Events để nhận thông báo thời gian thực.
 * @param {Object} options - Tùy chọn kết nối.
 * @param {string} options.token - Access token dùng để xác thực.
 * @param {AbortSignal} options.signal - Signal dùng để đóng kết nối.
 * @returns {Promise<Response>} Phản hồi fetch chứa event stream.
 */
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

/**
 * Lấy danh sách thông báo theo bộ lọc phân trang.
 * @param {Object} [params={}] - Query gửi lên API.
 * @returns {Promise<Object>} Dữ liệu danh sách thông báo từ API.
 */
export const getNotifications = async (params = {}) => {
  const response = await api.get("/notifications", { params });
  return response.data;
};

/**
 * Lấy tổng số thông báo chưa đọc của người dùng hiện tại.
 * @returns {Promise<Object>} Dữ liệu số lượng chưa đọc từ API.
 */
export const getUnreadNotificationCount = async () => {
  const response = await api.get("/notifications/unread-count");
  return response.data;
};

/**
 * Đánh dấu một thông báo là đã đọc.
 * @param {string} notificationId - ID thông báo.
 * @returns {Promise<Object>} Thông báo sau khi cập nhật.
 */
export const markNotificationAsRead = async (notificationId) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

/**
 * Đánh dấu toàn bộ thông báo của người dùng là đã đọc.
 * @returns {Promise<Object>} Kết quả cập nhật từ API.
 */
export const markAllNotificationsAsRead = async () => {
  const response = await api.patch("/notifications/read-all");
  return response.data;
};
