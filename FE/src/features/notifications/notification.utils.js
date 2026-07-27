// notification.utils.js - Cung cấp tiện ích phân loại và điều hướng từ thông báo
const PLANT_CARE_TYPES = new Set([
  "plant_watering_due",
  "plant_fertilizing_due",
]);

export const NOTIFICATIONS_REFRESH_EVENT = "plantify:notifications-refresh";

/**
 * Phát sự kiện yêu cầu các hook thông báo tải lại dữ liệu trên trình duyệt.
 * @returns {void}
 */
export function requestNotificationsRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT));
  }
}

/** Kiểm tra thông báo có thuộc nhóm lịch chăm sóc cây hay không. @param {Object} [notification={}] - Thông báo cần kiểm tra. @returns {boolean} `true` nếu là nhắc tưới hoặc bón phân. */
export function isPlantCareNotification(notification = {}) {
  return PLANT_CARE_TYPES.has(notification.type);
}

/** Tạo nội dung hiển thị cho thông báo chăm sóc cây. @param {Object} [notification={}] - Thông báo từ API. @returns {string} Nội dung thông báo. */
export function getPlantCareNotificationMessage(notification = {}) {
  if (notification.message) return notification.message;
  const plantName = notification.userPlantId?.name || "cây của bạn";
  return notification.type === "plant_fertilizing_due"
    ? `Đã đến lúc bón phân cho cây ${plantName}.`
    : `Đã đến lúc tưới cây ${plantName}.`;
}

/** Tạo dòng phụ gồm tên cây và thời điểm đến hạn. @param {Object} [notification={}] - Thông báo từ API. @returns {string} Dòng mô tả phụ. */
export function getPlantCareNotificationSubtext(notification = {}) {
  const plantName = notification.userPlantId?.name || "My Garden";
  if (!notification.careDueAt) return plantName;
  return `${plantName} • Đến hạn ${new Date(
    notification.careDueAt
  ).toLocaleString("vi-VN")}`;
}

/** Tạo URL My Garden trỏ tới đúng cây của thông báo chăm sóc. @param {Object} [notification={}] - Thông báo từ API. @returns {string|null} URL đích hoặc `null` nếu không phải thông báo chăm sóc. */
export function getPlantCareNotificationTarget(notification = {}) {
  if (!isPlantCareNotification(notification)) return null;
  const userPlantId = notification.userPlantId?._id
    || notification.userPlantId;
  if (!userPlantId) return "/my-garden";
  const searchParams = new URLSearchParams({ userPlantId: String(userPlantId) });
  return `/my-garden?${searchParams.toString()}`;
}
