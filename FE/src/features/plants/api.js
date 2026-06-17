// api.js - Các hàm gọi API liên quan tới plants
// Cung cấp CRUD: lấy danh sách, chi tiết, tạo, cập nhật, xóa cây
import { api } from "@/lib/api";

/**
 * Lấy danh sách cây từ backend.
 * @param {Object} params - Query params như search, category, tag, page, limit
 * @returns {Promise<object>} Response data từ API
 */
export const getPlants = async (params = {}) => {
  const response = await api.get("/plants", { params });
  return response.data;
};

/**
 * Lấy danh sách tags độc nhất từ backend.
 * @returns {Promise<Array>} Mảng tags
 */
export const getTags = async () => {
  const response = await api.get("/plants/tags");
  return response.data;
};

/**
 * Lấy chi tiết một cây theo id.
 * @param {string} id - Plant id
 * @param {boolean} populate - Có populate category không
 * @returns {Promise<object>} Plant data
 */
export const getPlantById = async (id, populate = false) => {
  const response = await api.get(`/plants/${id}`, {
    params: { populate },
  });
  return response.data;
};

/**
 * Tạo mới một cây.
 * @param {Object} data - Dữ liệu cây mới
 * @returns {Promise<object>} Plant đã tạo
 */
export const createPlant = async (data) => {
  const response = await api.post("/plants", data);
  return response.data;
};

/**
 * Cập nhật một cây theo id.
 * @param {string} id - Plant id
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise<object>} Plant đã cập nhật
 */
export const updatePlant = async (id, data) => {
  const response = await api.put(`/plants/${id}`, data);
  return response.data;
};

/**
 * Xóa một cây theo id.
 * @param {string} id - Plant id
 * @returns {Promise<object>} Plant đã xóa
 */
export const deletePlant = async (id) => {
  const response = await api.delete(`/plants/${id}`);
  return response.data;
};
