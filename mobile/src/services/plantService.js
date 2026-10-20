// src/services/plantService.js - Goi API Plants tu backend
import api from './api';

const plantService = {
  /**
   * Lay danh sach danh muc cay
   * GET /api/v1/plants/categories
   */
  getCategories: async () => {
    const response = await api.get('/plants/categories');
    return response.data; // { success, message, data: [...] }
  },

  /**
   * Lay danh sach cay co the loc theo danh muc va tim kiem
   * GET /api/v1/plants?category_id=...&search=...&page=1&limit=20
   */
  getPlants: async ({ categoryId, search, page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (categoryId) params.category_id = categoryId;
    if (search && search.trim()) params.search = search.trim();

    const response = await api.get('/plants', { params });
    return response.data; // { success, message, data: { plants, total, page, ... } }
  },

  /**
   * Lay chi tiet mot cay theo ID
   * GET /api/v1/plants/:id
   */
  getPlantById: async (id) => {
    const response = await api.get(`/plants/${id}`);
    return response.data; // { success, message, data: plant }
  },

  getManagerPlants: async ({ search, page = 1, limit = 50 } = {}) => {
    const response = await api.get('/plants/manager', { params: { search, page, limit } });
    return response.data;
  },

  createPlant: async (plant) => (await api.post('/plants/manager', plant)).data,
  updatePlant: async (id, plant) => (await api.put(`/plants/manager/${id}`, plant)).data,
  deletePlant: async (id) => (await api.delete(`/plants/manager/${id}`)).data,
};

export default plantService;
