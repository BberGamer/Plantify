export const statusLabels = {
  pending: "Chờ xử lý",
  accepted: "Đã tiếp nhận",
  rejected: "Từ chối",
};
export const typeLabels = {
  diagnosis_feedback: "Feedback chẩn đoán",
  proactive_feedback: "Feedback Chủ động",
};
export const assessmentLabels = {
  supported: "Có căn cứ",
  conflicting: "Có dấu hiệu mâu thuẫn",
  insufficient: "Chưa đủ bằng chứng",
};
export const feedbackTime = (value) =>
  new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

