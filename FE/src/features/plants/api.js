// api.js - Các hàm gọi API liên quan tới plants
import { api } from "@/lib/api";

/**
 * Lấy danh sách cây từ backend.
 * @param {Object} params - Query params như category, page, limit
 * @returns {Promise<object>} Response data từ API
 */
export const getPlants = async (params = {}) => {
  const response = await api.get("/plants", { params });
  return response.data;
};
