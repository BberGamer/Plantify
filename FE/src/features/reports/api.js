// api.js - Cac ham goi API lien quan toi reports.
import { api } from "@/lib/api";

export const reportPost = async (postId, reason) => {
  const response = await api.post("/reports", { postId, reason });
  return response.data;
};

export const getReports = async (params = {}) => {
  const response = await api.get("/reports", { params });
  return response.data;
};

export const processReport = async (reportId, action = "remove") => {
  const response = await api.patch(`/reports/${reportId}/process`, { action });
  return response.data;
};

export const restoreReportedPost = async (postId) => {
  const response = await api.patch(`/posts/${postId}/restore`);
  return response.data;
};
