// api.js - Các hàm gọi API liên quan tới favorites (cây yêu thích)
import { api } from "@/lib/api";

/**
 * Lấy danh sách cây yêu thích của user hiện tại
 * @returns {Promise<object>}
 */
export const getMyFavorites = async () => {
  const response = await api.get("/favorites");
  return response.data;
};

/**
 * Thêm cây vào danh sách yêu thích
 * @param {string} plantId
 * @returns {Promise<object>}
 */
export const addFavorite = async (plantId) => {
  const response = await api.post(`/favorites/${plantId}`);
  return response.data;
};

/**
 * Xóa cây khỏi danh sách yêu thích
 * @param {string} plantId
 * @returns {Promise<object>}
 */
export const removeFavorite = async (plantId) => {
  const response = await api.delete(`/favorites/${plantId}`);
  return response.data;
};

/**
 * Kiểm tra user đã thích cây này chưa
 * @param {string} plantId
 * @returns {Promise<object>}
 */
export const checkFavorite = async (plantId) => {
  const response = await api.get(`/favorites/${plantId}/check`);
  return response.data;
};
