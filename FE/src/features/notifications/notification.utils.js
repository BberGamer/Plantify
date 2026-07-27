const PLANT_CARE_TYPES = new Set([
  "plant_watering_due",
  "plant_fertilizing_due",
]);

export const NOTIFICATIONS_REFRESH_EVENT = "plantify:notifications-refresh";

export function requestNotificationsRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT));
  }
}

export function isPlantCareNotification(notification = {}) {
  return PLANT_CARE_TYPES.has(notification.type);
}

export function getPlantCareNotificationMessage(notification = {}) {
  if (notification.message) return notification.message;
  const plantName = notification.userPlantId?.name || "cây của bạn";
  return notification.type === "plant_fertilizing_due"
    ? `Đã đến lúc bón phân cho cây ${plantName}.`
    : `Đã đến lúc tưới cây ${plantName}.`;
}

export function getPlantCareNotificationSubtext(notification = {}) {
  const plantName = notification.userPlantId?.name || "My Garden";
  if (!notification.careDueAt) return plantName;
  return `${plantName} • Đến hạn ${new Date(
    notification.careDueAt
  ).toLocaleString("vi-VN")}`;
}

export function getPlantCareNotificationTarget(notification = {}) {
  if (!isPlantCareNotification(notification)) return null;
  const userPlantId = notification.userPlantId?._id
    || notification.userPlantId;
  if (!userPlantId) return "/my-garden";
  const searchParams = new URLSearchParams({ userPlantId: String(userPlantId) });
  return `/my-garden?${searchParams.toString()}`;
}
