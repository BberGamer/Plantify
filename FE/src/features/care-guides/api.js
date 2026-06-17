// api.js - Các hàm gọi API cho Care Guides
import { api } from "@/lib/api";

export const getCareGuides = async (params = {}) => {
  const response = await api.get("/care-guides", { params });
  return response.data;
};

export const getCareGuideById = async (id) => {
  const response = await api.get(`/care-guides/${id}`);
  return response.data;
};

export const createCareGuide = async (data) => {
  const response = await api.post("/care-guides", data);
  return response.data;
};

export const updateCareGuide = async (id, data) => {
  const response = await api.put(`/care-guides/${id}`, data);
  return response.data;
};

export const deleteCareGuide = async (id) => {
  const response = await api.delete(`/care-guides/${id}`);
  return response.data;
};
