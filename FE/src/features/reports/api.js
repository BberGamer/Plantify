// api.js - Gọi API tạo và quản lý báo cáo nội dung
import { api } from "@/lib/api";

/** Gửi báo cáo cho một bài viết. @param {string} postId - ID bài viết. @param {string} reason - Lý do báo cáo. @returns {Promise<Object>} Báo cáo vừa tạo. */
export const reportPost = async (postId, reason) => {
  const response = await api.post("/reports", { postId, reason });
  return response.data;
};

/** Lấy danh sách báo cáo theo query. @param {Object} [params={}] - Bộ lọc báo cáo. @returns {Promise<Object>} Dữ liệu danh sách báo cáo. */
export const getReports = async (params = {}) => {
  const response = await api.get("/reports", { params });
  return response.data;
};

/** Xử lý một báo cáo. @param {string} reportId - ID báo cáo. @param {string} [action="remove"] - Hành động xử lý. @returns {Promise<Object>} Báo cáo sau xử lý. */
export const processReport = async (reportId, action = "remove") => {
  const response = await api.patch(`/reports/${reportId}/process`, { action });
  return response.data;
};

/** Khôi phục bài viết từng bị gỡ do báo cáo. @param {string} postId - ID bài viết. @returns {Promise<Object>} Kết quả khôi phục. */
export const restoreReportedPost = async (postId) => {
  const response = await api.patch(`/posts/${postId}/restore`);
  return response.data;
};
