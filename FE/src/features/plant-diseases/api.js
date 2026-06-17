// api.js - Các hàm gọi API cho Plant Diseases
import { api } from "@/lib/api";

export const getPlantDiseases = async (params = {}) => {
  const response = await api.get("/plant-diseases", { params });
  return response.data;
};

export const getPlantDiseaseById = async (id) => {
  const response = await api.get(`/plant-diseases/${id}`);
  return response.data;
};

export const createPlantDisease = async (data) => {
  const response = await api.post("/plant-diseases", data);
  return response.data;
};

export const updatePlantDisease = async (id, data) => {
  const response = await api.put(`/plant-diseases/${id}`, data);
  return response.data;
};

export const deletePlantDisease = async (id) => {
  const response = await api.delete(`/plant-diseases/${id}`);
  return response.data;
};
