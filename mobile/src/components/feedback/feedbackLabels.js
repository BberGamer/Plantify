export const statusLabels = {
  pending: "Chờ xử lý",
  accepted: "Đã tiếp nhận",
  rejected: "Từ chối",
};
export const typeLabels = {
  diagnosis_feedback: "Feedback chẩn đoán",
  proactive_feedback: "Feedback Chủ động",
};
export const feedbackTime = (value) =>
  new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

