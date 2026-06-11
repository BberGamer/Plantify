// api.js - Các hàm gọi API liên quan tới plants
import { api } from "@/lib/api";

/**
 * Lấy danh sách cây từ backend.
 * @param {Object} params - Query params như search, tag, page, limit
 * @returns {Promise<object>} Response data từ API
 */
export const getPlants = async (params = {}) => {
  const response = await api.get("/plants", { params });
  return response.data;
};

/**
 * Lấy danh mục cây từ backend.
 * @returns {Promise<object>} Response data từ API
 */
export const getPlantCategories = async () => {
  const response = await api.get("/plants/categories");
 * Lấy danh sách tags độc nhất từ backend.
 * @returns {Promise<Array>} Mảng tags
 */
export const getTags = async () => {
  const response = await api.get("/plants/tags");
  return response.data;
};
