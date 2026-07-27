// api.js - Gọi API danh sách, chi tiết và thao tác dữ liệu cây
// Cung cấp CRUD: lấy danh sách, chi tiết, tạo, cập nhật, xóa cây
import { api } from "@/lib/api";

/** Lấy danh sách cây theo query. @param {Object} [params={}] - Bộ lọc API. @returns {Promise<Object>} Dữ liệu danh sách cây. */
export const getPlants = async (params = {}) => {
  const response = await api.get("/plants", { params });
  return response.data;
};

/** Lấy danh sách tag cây hiện có. @returns {Promise<Object>} Dữ liệu tag từ API. */
export const getTags = async () => {
  const response = await api.get("/plants/tags");
  return response.data;
};

/** Lấy chi tiết cây. @param {string} id - ID cây. @param {boolean} [populate=false] - Có populate dữ liệu liên quan hay không. @returns {Promise<Object>} Dữ liệu cây. */
export const getPlantById = async (id, populate = false) => {
  const response = await api.get(`/plants/${id}`, { params: { populate } });
  return response.data;
};

/** Tạo cây mới. @param {Object} data - Dữ liệu cây. @returns {Promise<Object>} Cây vừa tạo. */
export const createPlant = async (data) => {
  const response = await api.post("/plants", data);
  return response.data;
};

/** Cập nhật cây. @param {string} id - ID cây. @param {Object} data - Dữ liệu cập nhật. @returns {Promise<Object>} Cây sau cập nhật. */
export const updatePlant = async (id, data) => {
  const response = await api.put(`/plants/${id}`, data);
  return response.data;
};

/** Xóa cây. @param {string} id - ID cây. @returns {Promise<Object>} Kết quả xóa. */
export const deletePlant = async (id) => {
  const response = await api.delete(`/plants/${id}`);
  return response.data;
};

/** Lấy danh sách danh mục cây. @returns {Promise<Object>} Dữ liệu danh mục. */
export const getPlantCategories = async () => {
  const response = await api.get("/plants/categories");
  return response.data;
};

/** Tạo danh mục cây. @param {Object} data - Dữ liệu danh mục. @returns {Promise<Object>} Danh mục vừa tạo. */
export const createCategory = async (data) => {
  const response = await api.post("/plants/categories", data);
  return response.data;
};

/** Xóa danh mục cây. @param {string} id - ID danh mục. @returns {Promise<Object>} Kết quả xóa. */
export const deleteCategory = async (id) => {
  const response = await api.delete(`/plants/categories/${id}`);
  return response.data;
};

/** Cập nhật danh mục cây. @param {string} id - ID danh mục. @param {Object} data - Dữ liệu cập nhật. @returns {Promise<Object>} Danh mục sau cập nhật. */
export const updateCategory = async (id, data) => {
  const response = await api.put(`/plants/categories/${id}`, data);
  return response.data;
};
