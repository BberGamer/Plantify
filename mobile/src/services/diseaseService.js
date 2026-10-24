// src/services/diseaseService.js - Gọi API quản lý bệnh cây
import api from "./api";
import { adaptDiseasesList } from "./listAdapters";

const diseaseService = {
  getDiseases: async ({ plantId, page = 1, limit = 100 } = {}) => {
    const params = { page, limit };
    if (plantId) params.plant_id = plantId;
    const response = await api.get("/diseases", { params });
    return response.data;
  },

  getManagerDiseases: async ({
    search,
    status,
    plantId,
    page = 1,
    limit = 50,
  } = {}) => {
    const params = { page, limit };
    if (search?.trim()) params.search = search.trim();
    if (status) params.status = status;
    if (plantId) params.plant_id = plantId;

    const response = await api.get("/diseases/manager", { params });
    return adaptDiseasesList(response.data);
  },

  getManagerDiseaseById: async (id) => {
    const response = await api.get(`/diseases/manager/${id}`);
    return response.data;
  },

  createDisease: async (disease) => {
    const response = await api.post("/diseases/manager", disease);
    return response.data;
  },

  updateDisease: async (id, disease) => {
    const response = await api.put(`/diseases/manager/${id}`, disease);
    return response.data;
  },

  deleteDisease: async (id) => {
    const response = await api.delete(`/diseases/manager/${id}`);
    return response.data;
  },
};

export default diseaseService;
