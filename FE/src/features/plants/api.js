// api.js - Các hàm gọi API liên quan tới plants
// Cung cấp CRUD: lấy danh sách, chi tiết, tạo, cập nhật, xóa cây
import { api } from "@/lib/api";

export const getPlants = async (params = {}) => {
  const response = await api.get("/plants", { params });
  return response.data;
};

export const getTags = async () => {
  const response = await api.get("/plants/tags");
  return response.data;
};

export const getPlantById = async (id, populate = false) => {
  const response = await api.get(`/plants/${id}`, { params: { populate } });
  return response.data;
};

export const createPlant = async (data) => {
  const response = await api.post("/plants", data);
  return response.data;
};

export const updatePlant = async (id, data) => {
  const response = await api.put(`/plants/${id}`, data);
  return response.data;
};

export const deletePlant = async (id) => {
  const response = await api.delete(`/plants/${id}`);
  return response.data;
};

export const getPlantCategories = async () => {
  const response = await api.get("/plants/categories");
  return response.data;
};

export const createCategory = async (data) => {
  const response = await api.post("/plants/categories", data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/plants/categories/${id}`);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await api.put(`/plants/categories/${id}`, data);
  return response.data;
};
