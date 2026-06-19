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

/**
 * Tạo danh mục sản phẩm mới
 * @param {object} data
 * @returns {Promise<object>} response data
 */
export const createCategory = async (data) => {
  const response = await api.post("/products/categories", data);
  return response.data;
};

/**
 * Cập nhật danh mục sản phẩm
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>} response data
 */
export const updateCategory = async (id, data) => {
  const response = await api.put(`/products/categories/${id}`, data);
  return response.data;
};

/**
 * Xóa danh mục sản phẩm
 * @param {string} id
 * @returns {Promise<object>} response data
 */
export const deleteCategory = async (id) => {
  const response = await api.delete(`/products/categories/${id}`);
  return response.data;
};

/**
 * Tạo sản phẩm mới
 * @param {object} data
 * @returns {Promise<object>} response data
 */
export const createProduct = async (data) => {
  const response = await api.post("/products", data);
  return response.data;
};

/**
 * Cập nhật sản phẩm
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>} response data
 */
export const updateProduct = async (id, data) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};

/**
 * Xóa sản phẩm
 * @param {string} id
 * @returns {Promise<object>} response data
 */
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

