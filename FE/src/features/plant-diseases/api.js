// api.js - Gọi API danh sách và thao tác dữ liệu bệnh cây
import { api } from "@/lib/api";

/** Lấy danh sách bệnh cây. @param {Object} [params={}] - Query API. @returns {Promise<Object>} Dữ liệu danh sách bệnh. */
export const getPlantDiseases = async (params = {}) => {
  const response = await api.get("/plant-diseases", { params });
  return response.data;
};

/** Lấy chi tiết bệnh cây. @param {string} id - ID bệnh cây. @returns {Promise<Object>} Dữ liệu bệnh cây. */
export const getPlantDiseaseById = async (id) => {
  const response = await api.get(`/plant-diseases/${id}`);
  return response.data;
};

/** Tạo bệnh cây. @param {Object} data - Dữ liệu bệnh cây. @returns {Promise<Object>} Bệnh cây vừa tạo. */
export const createPlantDisease = async (data) => {
  const response = await api.post("/plant-diseases", data);
  return response.data;
};

/** Cập nhật bệnh cây. @param {string} id - ID bệnh cây. @param {Object} data - Dữ liệu cập nhật. @returns {Promise<Object>} Bệnh cây sau cập nhật. */
export const updatePlantDisease = async (id, data) => {
  const response = await api.put(`/plant-diseases/${id}`, data);
  return response.data;
};

/** Xóa bệnh cây. @param {string} id - ID bệnh cây. @returns {Promise<Object>} Kết quả xóa. */
export const deletePlantDisease = async (id) => {
  const response = await api.delete(`/plant-diseases/${id}`);
  return response.data;
};
