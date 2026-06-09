// api.js - Các hàm gọi API liên quan tới sản phẩm
import { api } from "@/lib/api";

/**
 * Lấy thông tin sản phẩm theo id
 * @param {string} id
 * @returns {Promise<object>} response data
 */
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};
