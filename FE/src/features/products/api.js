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

/**
 * Lấy danh sách sản phẩm theo bộ lọc
 * @param {object} params
 * @returns {Promise<object>} response data
 */
export const getProducts = async (params) => {
  const response = await api.get("/products", { params });
  return response.data;
};

/**
 * Lấy tất cả danh mục sản phẩm
 * @returns {Promise<object>} response data
 */
export const getCategories = async () => {
  const response = await api.get("/products/categories");
  return response.data;
};

