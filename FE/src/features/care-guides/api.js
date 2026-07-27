// api.js - Gọi API danh sách và thao tác hướng dẫn chăm sóc
import { api } from "@/lib/api";

/** Lấy danh sách hướng dẫn chăm sóc. @param {Object} [params={}] - Query API. @returns {Promise<Object>} Dữ liệu danh sách. */
export const getCareGuides = async (params = {}) => {
  const response = await api.get("/care-guides", { params });
  return response.data;
};

/** Lấy chi tiết hướng dẫn chăm sóc. @param {string} id - ID hướng dẫn. @returns {Promise<Object>} Dữ liệu hướng dẫn. */
export const getCareGuideById = async (id) => {
  const response = await api.get(`/care-guides/${id}`);
  return response.data;
};

/** Tạo hướng dẫn chăm sóc. @param {Object} data - Dữ liệu hướng dẫn. @returns {Promise<Object>} Hướng dẫn vừa tạo. */
export const createCareGuide = async (data) => {
  const response = await api.post("/care-guides", data);
  return response.data;
};

/** Cập nhật hướng dẫn chăm sóc. @param {string} id - ID hướng dẫn. @param {Object} data - Dữ liệu cập nhật. @returns {Promise<Object>} Hướng dẫn sau cập nhật. */
export const updateCareGuide = async (id, data) => {
  const response = await api.put(`/care-guides/${id}`, data);
  return response.data;
};

/** Xóa hướng dẫn chăm sóc. @param {string} id - ID hướng dẫn. @returns {Promise<Object>} Kết quả xóa. */
export const deleteCareGuide = async (id) => {
  const response = await api.delete(`/care-guides/${id}`);
  return response.data;
};
